import { HttpService } from "@nestjs/axios";
import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AxiosError } from "axios";
import { catchError, firstValueFrom } from "rxjs";
import { FormatOriginAddress } from "./format-origin-address";
import { FormatDestinationsAddressStoreBase } from "./format-destionations-address-store-base";
import { CallDistanceMatrixApi } from "./call-distance-matrix-api";
import { SortAddressByDistance } from "./sort-address-by-distance";
import { ValidateCepFormat } from "./validate-cep-format";
import { ReadDataOfStoreBase } from "./read-datas-of-store-base";
import { TraceRouteBetweenAddress } from "./trace-route-between-addresses";

type DistancesAndDurationWithStoreInfos = {
  centerId: string,
  store: string,
  street: string,
  neighborhood: string,
  cep: string,
  city: string,
  uf: string,
  responsiblePerson: string,
  distance: { text: string, value: number },
  duration: { text: string, value: number },
  status: string
  link?: string
}[]

interface FindNearestStoreRequest {
  cep: string
  numberOfStoresToBePresented: string
}

interface FindNearestStoreResponse {
  distancesAndDurationBetweenOriginAndDestinationSortedAndRoutePlotted: DistancesAndDurationWithStoreInfos
}

@Injectable()
export class FindNearestStore {
  constructor(private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly validateCepFormat: ValidateCepFormat,
    private readonly formatOriginAddress: FormatOriginAddress,
    private readonly formatDestinationsAddress: FormatDestinationsAddressStoreBase,
    private readonly callDistanceMatrixApi: CallDistanceMatrixApi,
    private readonly sortAddressByDistance: SortAddressByDistance,
    private readonly readDataOfStoreBase: ReadDataOfStoreBase,
    private traceRouterBetweenAddress: TraceRouteBetweenAddress) { }


  private async makeRequestForViaCepAPI(cep: string) {
    const { data } = await firstValueFrom(
      this.httpService.get(`https://viacep.com.br/ws/${cep}/json/`).pipe(
        catchError((error: AxiosError) => {
          let statusCode = error.response?.status || 500
          throw new HttpException(`OriginCepError. An ERROR happened in GET Request 'Via Cep'. Verifique o cep de origem digitado`,
            statusCode as number,
            {
              cause: new Error(), description: `${error.response?.data}`
            }
          )
        })
      )
    )

    if (data.hasOwnProperty('erro')) {
      throw new InternalServerErrorException('OriginCepError. Erro ao consultar a API ViaCEP, verifique o Cep de origem digitado')
    }

    return {
      infosAboultCep: data
    }
  }

  private async transformedArray(sheetData: any) {

    const transformedArray = sheetData.map(item => ({
      centerId: item.Centro.toString(),
      store: item.Loja,
      street: item['Endereço'],
      neighborhood: item.Bairro,
      cep: item.CEP,
      city: item['Cidade/EST'].match(/^(.*?)\//)?.[1] || item['Cidade/EST'],
      uf: item.UF,
      responsiblePerson: item['Responsável loja']
    }));

    return {
      destinationsAddressTransformed: transformedArray
    }
  }

  private async splitArray(distancesAndDurationWithStoreInfosArray: DistancesAndDurationWithStoreInfos, chunkSize: number) {
    let distancesAndDurationBetweenOriginAndDestinationSortedSplited: DistancesAndDurationWithStoreInfos;

    const chunk = distancesAndDurationWithStoreInfosArray.slice(0, chunkSize);

    distancesAndDurationBetweenOriginAndDestinationSortedSplited = chunk;

    return {
      distancesAndDurationBetweenOriginAndDestinationSortedSplited
    };
  }

  async execute(request: FindNearestStoreRequest): Promise<FindNearestStoreResponse> {
    let { cep, numberOfStoresToBePresented } = request

    const isCepFormatValid = await this.validateCepFormat.execute({ cep })

    if (!isCepFormatValid) {
      throw new BadRequestException('CEP inválido')
    }

    cep = cep.replace(/[^\d]+/g, '')

    const { infosAboultCep } = await this.makeRequestForViaCepAPI(cep)

    const { originAddressFormated } = await this.formatOriginAddress.execute({
      street: infosAboultCep.logradouro,
      neighborhood: infosAboultCep.bairro,
      city: infosAboultCep.localidade,
      uf: infosAboultCep.uf
    })

    const { sheetData } = await this.readDataOfStoreBase.execute()

    const { destinationsAddressTransformed } = await this.transformedArray(sheetData)

    const { destinationsAddressFormated } = await this.formatDestinationsAddress.execute({
      destinationsAddressTransformed
    })

    const callDistancesMatrixPromises = destinationsAddressFormated.map(async (item) => {
      const { distancesAndDurationBetweenOriginAndDestination } = await this.callDistanceMatrixApi.execute({
        originAddressFormated,
        destinationsAddressFormated: item
      });

      return distancesAndDurationBetweenOriginAndDestination;
    });

    const callDistancesMatrixPromisesResult = await Promise.all(callDistancesMatrixPromises);

    let distancesAndDurationBetweenOriginAndDestination = callDistancesMatrixPromisesResult.flatMap(array => array)

    const distancesAndDurationBetweenOriginAndDestinationConcatenatedWithStoreBase = distancesAndDurationBetweenOriginAndDestination.map((distancesAndDuration, index) => {
      const destinationsAddress = destinationsAddressTransformed[index];
      delete (distancesAndDuration.status)
      return { ...destinationsAddress, ...distancesAndDuration };
    });

    const { distancesAndDurationBetweenOriginAndDestinationSorted } = await this.sortAddressByDistance.execute({
      distancesAndDurationBetweenOriginAndDestinationConcatenatedWithStoreBase
    })

    const { distancesAndDurationBetweenOriginAndDestinationSortedSplited } = await this.splitArray(distancesAndDurationBetweenOriginAndDestinationSorted, Number(numberOfStoresToBePresented))

    const urlWithTracedRouterPromises = distancesAndDurationBetweenOriginAndDestinationSortedSplited.map(async (item) => {
      const { urlWithTracedRouter } = await this.traceRouterBetweenAddress.execute({
        originCep: cep,
        destinationCep: item.cep
      })

      return urlWithTracedRouter
    })

    const urlWithTracedRouterPromisesResult = await Promise.all(urlWithTracedRouterPromises)

    const distancesAndDurationBetweenOriginAndDestinationSortedAndRoutePlotted = distancesAndDurationBetweenOriginAndDestinationSortedSplited.map((obj, index) => {
      const link = urlWithTracedRouterPromisesResult[index]

      return {
        ...obj,
        link: link
      }
    })


    return {
      distancesAndDurationBetweenOriginAndDestinationSortedAndRoutePlotted
    }
  }
}