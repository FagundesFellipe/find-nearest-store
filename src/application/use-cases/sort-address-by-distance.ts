import { Injectable } from "@nestjs/common"

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
}[]

interface SortAddressByDistanceParams {
  distancesAndDurationBetweenOriginAndDestinationConcatenatedWithStoreBase: DistancesAndDurationWithStoreInfos
}

interface SortAddressByDistanceResponse {
  distancesAndDurationBetweenOriginAndDestinationSorted: DistancesAndDurationWithStoreInfos
}

@Injectable()
export class SortAddressByDistance {
  constructor() { }

  async execute(params: SortAddressByDistanceParams): Promise<SortAddressByDistanceResponse> {
    const { distancesAndDurationBetweenOriginAndDestinationConcatenatedWithStoreBase } = params

    distancesAndDurationBetweenOriginAndDestinationConcatenatedWithStoreBase.sort((a, b) => 0 - (a.distance.value! > b.distance.value! ? -1 : 1))

    return {
      distancesAndDurationBetweenOriginAndDestinationSorted: distancesAndDurationBetweenOriginAndDestinationConcatenatedWithStoreBase
    }
  }
}