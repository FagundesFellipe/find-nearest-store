import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from './infra/http/http.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: '/upload'
      })
    }),
    HttpModule
  ],
})
export class AppModule { }
