import { Controller, Get, Query, Session } from "@nestjs/common";
import { FindNearestStore } from "src/application/use-cases/find-nearest-store";

@Controller('v1')
export class FindNearestStoreController {
  constructor(private findNearestStore: FindNearestStore) { }

  @Get('find/nearest/store')
  async getFindNearestStore(@Query('cep') cep: string, @Query('numberOfStoresToBePresented') numberOfStoresToBePresented: string) {
    const { distancesAndDurationBetweenOriginAndDestinationSortedAndRoutePlotted } = await this.findNearestStore.execute({
      cep,
      numberOfStoresToBePresented
    })

    return {
      distancesAndDurationBetweenOriginAndDestinationSortedAndRoutePlotted
    }
  }
}