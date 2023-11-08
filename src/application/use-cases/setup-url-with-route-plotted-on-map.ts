import { Injectable } from "@nestjs/common"

interface SetupURLWithRoutePlottedOnRouterParams {
  originAddressFormated: string
  placeIdOrigin: string
  destinationsAddressFormated: string
  placeIdDestination: string
}

interface SetupURLWithRoutePlottedOnRouterResponse {
  urlWithTracedRouter: string
}

@Injectable()
export class SetupURLWithRoutePlottedOnRouter {
  constructor() { }

  async execute(params: SetupURLWithRoutePlottedOnRouterParams): Promise<SetupURLWithRoutePlottedOnRouterResponse> {
    const { originAddressFormated, placeIdOrigin, destinationsAddressFormated, placeIdDestination } = params

    let url = `https://www.google.com/maps/dir/?api=1&origin=${originAddressFormated}&origin_place_id=${placeIdOrigin}&destination=${destinationsAddressFormated}&destination_place_id=${placeIdDestination}&travelmode=driving`

    return {
      urlWithTracedRouter: url
    }
  }
}