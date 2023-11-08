import { HttpService } from "@nestjs/axios";
import { HttpException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AxiosError } from "axios";
import { catchError, firstValueFrom, map } from "rxjs";

type googleDistanceMatrixApi = {
  distance: { text: string, value: number },
  duration: { text: string, value: number },
  status?: string
}[]

interface CallDistanceMatrixApiParams {
  originAddressFormated: string
  destinationsAddressFormated: string
}

interface CallDistanceMatrixApiResponse {
  distancesAndDurationBetweenOriginAndDestination: googleDistanceMatrixApi
}

@Injectable()
export class CallDistanceMatrixApi {
  constructor(private readonly configService: ConfigService,
    private readonly httpService: HttpService) { }

  async execute(params: CallDistanceMatrixApiParams): Promise<CallDistanceMatrixApiResponse> {

    const { originAddressFormated, destinationsAddressFormated } = params

    const googleApiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY')

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originAddressFormated}&destinations=${destinationsAddressFormated}&key=${googleApiKey}`

    const distancesAndDurationBetweenOriginAndDestination = await firstValueFrom(
      this.httpService.get(url).pipe(
        map((response) => {
          return response.data.rows[0].elements
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

    return {
      distancesAndDurationBetweenOriginAndDestination
    }
  }
}