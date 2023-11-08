import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from "@nestjs/common"
import { ValidateCepFormat } from "./validate-cep-format"
import { catchError, firstValueFrom } from "rxjs"
import { HttpService } from "@nestjs/axios"
import { AxiosError } from "axios"
import { FormatOriginAddress } from "./format-origin-address"
import { FormatDestinationsAddressViaCep } from "./format-destionations-address-via-cep"
import { CallDirectionsApi } from "./call-directions-api"
import { SetupURLWithRoutePlottedOnRouter } from "./setup-url-with-route-plotted-on-map"

interface TraceRouteBetweenAddressRequest {
  originCep: string
  destinationCep: string
}

interface TraceRouteBetweenAddressResponse {
  urlWithTracedRouter: string
}

@Injectable()
export class TraceRouteBetweenAddress {
  constructor(private readonly validateCepFormat: ValidateCepFormat,
    private readonly httpService: HttpService,
    private readonly formatOriginAddress: FormatOriginAddress,
    private readonly formatDestinationAddress: FormatDestinationsAddressViaCep,
    private readonly callDirectionsApi: CallDirectionsApi,
    private readonly setupUrlWithRouterPlottedOnMap: SetupURLWithRoutePlottedOnRouter) { }

  private async makeRequestForViaCepAPI(cep: string) {
    const { data } = await firstValueFrom(
      this.httpService.get(`https://viacep.com.br/ws/${cep}/json/`).pipe(
        catchError((error: AxiosError) => {
          let statusCode = error.response?.status || 500
          throw new HttpException(`DestinationCepError. An ERROR happened in GET Request 'Via Cep'. ERROR: ${error.response?.data}`,
            statusCode as number,
            {
              cause: new Error(), description: `${error.response?.data}`
            }
          )
        })
      )
    )

    if (data.hasOwnProperty('erro')) {
      throw new InternalServerErrorException('DestinationCepError. Erro ao consultar a API ViaCEP, verifique os Ceps de destinos consultados')
    }

    return {
      data
    }
  }

  async execute(request: TraceRouteBetweenAddressRequest): Promise<TraceRouteBetweenAddressResponse> {

    let { originCep, destinationCep } = request

    const isOriginCepFormatValid = await this.validateCepFormat.execute({ cep: originCep })

    if (!isOriginCepFormatValid) {
      throw new BadRequestException('CEP de Origem inválido')
    }

    const isDestinationCepFormatValid = await this.validateCepFormat.execute({ cep: destinationCep })

    if (!isDestinationCepFormatValid) {
      throw new BadRequestException('CEP de Destino inválido')
    }

    originCep = originCep.replace(/[^\d]+/g, '')
    destinationCep = destinationCep.replace(/[^\d]+/g, '')

    const infosAboultOriginCep = (await this.makeRequestForViaCepAPI(originCep)).data
    const infosAboultDestinationsCep = (await this.makeRequestForViaCepAPI(destinationCep)).data

    const { originAddressFormated } = await this.formatOriginAddress.execute({
      street: infosAboultOriginCep.logradouro,
      neighborhood: infosAboultOriginCep.bairro,
      city: infosAboultOriginCep.localidade,
      uf: infosAboultOriginCep.uf
    })

    const destinationsAddress = [
      {
        street: infosAboultDestinationsCep.logradouro,
        neighborhood: infosAboultDestinationsCep.bairro,
        city: infosAboultDestinationsCep.localidade,
        uf: infosAboultOriginCep.uf
      },
    ]

    const { destinationsAddressFormated } = await this.formatDestinationAddress.execute({
      destinationsAddress
    })

    const { placesId } = await this.callDirectionsApi.execute({
      originAddressFormated,
      destinationsAddressFormated
    })


    const { urlWithTracedRouter } = await this.setupUrlWithRouterPlottedOnMap.execute({
      originAddressFormated,
      placeIdOrigin: placesId.placeIdOrigin,
      destinationsAddressFormated,
      placeIdDestination: placesId.placeIdDestination
    })

    return {
      urlWithTracedRouter
    }

  }
}