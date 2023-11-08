import { Injectable } from "@nestjs/common"

interface FormatOriginAddressParams {
  street: string
  neighborhood: string
  city: string
  uf: string

}

interface FormatOriginAddressResponse {
  originAddressFormated: string
}

@Injectable()
export class FormatOriginAddress {
  constructor() { }

  async execute(params: FormatOriginAddressParams): Promise<FormatOriginAddressResponse> {
    const { street, neighborhood, city, uf } = params

    let originAddress = `${street}+${neighborhood}+${city}+${uf}`

    let originAddressFormated = encodeURI(originAddress)

    return {
      originAddressFormated
    }

  }
}