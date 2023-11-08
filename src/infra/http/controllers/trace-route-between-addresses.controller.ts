import { Controller, Get, Query } from "@nestjs/common";
import { TraceRouteBetweenAddress } from "src/application/use-cases/trace-route-between-addresses";

@Controller('v1')
export class TraceRouteBetweenAddressController {
  constructor(private traceRouterBetweenAddress: TraceRouteBetweenAddress) {
  }

  @Get('trace/router/between/address')
  async traceRouter(@Query('originCep') originCep: string,
    @Query('destinationCep') destinationCep: string) {
    const { urlWithTracedRouter } = await this.traceRouterBetweenAddress.execute({
      originCep,
      destinationCep
    })

    return {
      urlWithTracedRouter: urlWithTracedRouter
    }
  }
}