import { Module } from '@nestjs/common'
import { HttpModule as Http_Module } from '@nestjs/axios'
import { FindNearestStoreController } from './controllers/find-nearest-store.controller'
import { FindNearestStore } from 'src/application/use-cases/find-nearest-store'
import { FormatOriginAddress } from 'src/application/use-cases/format-origin-address'
import { FormatDestinationsAddressStoreBase } from 'src/application/use-cases/format-destionations-address-store-base'
import { FormatDestinationsAddressViaCep } from 'src/application/use-cases/format-destionations-address-via-cep'
import { CallDistanceMatrixApi } from 'src/application/use-cases/call-distance-matrix-api'
import { SortAddressByDistance } from 'src/application/use-cases/sort-address-by-distance'
import { ValidateCepFormat } from 'src/application/use-cases/validate-cep-format'
import { CallDirectionsApi } from 'src/application/use-cases/call-directions-api'
import { TraceRouteBetweenAddressController } from './controllers/trace-route-between-addresses.controller'
import { TraceRouteBetweenAddress } from 'src/application/use-cases/trace-route-between-addresses'
import { SetupURLWithRoutePlottedOnRouter } from 'src/application/use-cases/setup-url-with-route-plotted-on-map'
import { ReadDataOfStoreBase } from 'src/application/use-cases/read-datas-of-store-base'

@Module({
  imports: [
    Http_Module.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5
      })
    })
  ],
  controllers: [FindNearestStoreController, TraceRouteBetweenAddressController],
  providers: [FindNearestStore,
    ValidateCepFormat,
    FormatOriginAddress,
    FormatDestinationsAddressStoreBase,
    FormatDestinationsAddressViaCep,
    CallDistanceMatrixApi,
    CallDirectionsApi,
    SortAddressByDistance,
    TraceRouteBetweenAddress,
    SetupURLWithRoutePlottedOnRouter,
    ReadDataOfStoreBase
  ]
})

export class HttpModule { }