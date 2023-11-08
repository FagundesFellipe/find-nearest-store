import { HttpService } from "@nestjs/axios"
import { HttpException, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { AxiosError } from "axios"
import { catchError, firstValueFrom, map } from "rxjs"

interface CallDirectionsApiParams {
  originAddressFormated: string
  destinationsAddressFormated: string
}

interface CallDirectionsApiResponse {
  placesId: { placeIdOrigin: string, placeIdDestination: string }
}

interface GetPlacesIdResponse {
  placeIdOrigin: string
  placeIdDestination: string
}

type GeocodedWaypoints = {
  geocoder_status: string,
  partial_match: boolean
  place_id: string,
  types: string[]
}[]

@Injectable()
export class CallDirectionsApi {
  constructor(private readonly configService: ConfigService,
    private httpService: HttpService) { }

  private async getPlacesId(geocoded_waypoints: GeocodedWaypoints): Promise<GetPlacesIdResponse> {
    let placeIdOrigin: string
    let placeIdDestination: string

    placeIdOrigin = geocoded_waypoints[0].place_id
    placeIdDestination = geocoded_waypoints[1].place_id

    return {
      placeIdOrigin,
      placeIdDestination
    }
  }

  async execute(params: CallDirectionsApiParams): Promise<CallDirectionsApiResponse> {
    const { originAddressFormated, destinationsAddressFormated } = params

    const googleApiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY')

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originAddressFormated}&destination=${destinationsAddressFormated}&key=${googleApiKey}`

    const geocoded_waypoints = await firstValueFrom(
      this.httpService.get(url).pipe(
        map((response) => {
          return response.data.geocoded_waypoints
        }),
        catchError((error: AxiosError) => {
          let statusCode = error.response?.status || 500
          throw new HttpException(`An ERROR happened. ERROR in GET Request 'Distance Matrix': ${error.response?.data}`,
            statusCode as number, {
            cause: new Error(), description: `${error.response?.data}`
          });
        })
      )
    )

    const { placeIdOrigin, placeIdDestination } = await this.getPlacesId(geocoded_waypoints)

    return {
      placesId: {
        placeIdOrigin,
        placeIdDestination
      }
    }

  }
}