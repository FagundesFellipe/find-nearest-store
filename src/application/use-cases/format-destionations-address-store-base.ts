import { Injectable } from "@nestjs/common"

interface FormatDestinationsAddressStoreBaseParams {
  destinationsAddressTransformed: {
    centerId: string,
    store: string
    street: string,
    neighborhood: string,
    cep: string,
    city: string
    uf: string,
    responsiblePerson: string
  }[],
}

interface FormatDestinationsAddressResponse {
  destinationsAddressFormated: string[]
}

type DestinationsAddressArrayStoreBase = {
  centerId: string,
  store: string
  street: string,
  neighborhood: string,
  cep: string,
  city: string
  uf: string,
  responsiblePerson: string
}[]


@Injectable()
export class FormatDestinationsAddressStoreBase {
  constructor() { }

  private async splitArray(destinationsAddressArray: DestinationsAddressArrayStoreBase, chunkSize: number) {
    const splitArray: {}[] = [];
    const length = destinationsAddressArray.length;

    for (let i = 0; i < length; i += chunkSize) {
      const chunk = destinationsAddressArray.slice(i, i + chunkSize);
      splitArray.push(chunk);
    }

    return {
      splitArray
    };
  }

  async execute(params: FormatDestinationsAddressStoreBaseParams): Promise<FormatDestinationsAddressResponse> {

    const chunkSize = 25;
    const { destinationsAddressTransformed } = params

    let destinationsAddressArrayHelper: string[] = []
    let destinationsAddressFormated: string[] = []

    // Se Length for igual a 1 quer dizer que veio do controller de traçar rota
    const { splitArray } = await this.splitArray(destinationsAddressTransformed, chunkSize)

    for (const element of splitArray) {
      for (const item in element) {
        destinationsAddressArrayHelper.push(`${element[item].street}+${element[item].neighborhood}+${element[item].city}+${element[item].uf}`)
      }

      const destinationsAddressJoined = destinationsAddressArrayHelper.join('|')
      const destinationsAddressFormatedHelper = encodeURI(destinationsAddressJoined)

      destinationsAddressFormated.push(destinationsAddressFormatedHelper)
      destinationsAddressArrayHelper = []

    }

    return {
      destinationsAddressFormated
    }

  }
}