import { Injectable } from "@nestjs/common"

interface FormatDestinationsAddressViaCepParams {
  destinationsAddress: {
    street: string,
    neighborhood: string,
    city: string
    uf: string,
  }[],
}

interface FormatDestinationsAddressResponse {
  destinationsAddressFormated: string
}

@Injectable()
export class FormatDestinationsAddressViaCep {
  constructor() { }

  async execute(params: FormatDestinationsAddressViaCepParams): Promise<FormatDestinationsAddressResponse> {

    const { destinationsAddress } = params

    let destinationsAddressArrayHelper: string[] = []
    for (let element of destinationsAddress) {
      destinationsAddressArrayHelper.push(`${element.street}+${element.neighborhood}+${element.city}+${element.uf}`)
    }

    const destinationsAddressJoined = destinationsAddressArrayHelper.join('|')

    const destinationsAddressFormated = encodeURI(destinationsAddressJoined)

    return {
      destinationsAddressFormated
    }

  }
}