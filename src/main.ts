import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as path from 'path'
import * as fs from 'fs'
import * as session from 'express-session'

const rootCertPath = '/opt/certificates'
const crtPath = path.join(rootCertPath, '')
const caPath = path.join(rootCertPath, '')
const keyPath = path.join(rootCertPath, '')

const httpsOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(crtPath),
  ca: fs.readFileSync(caPath)
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    //httpsOptions
  });
  app.use(
    session({
      secret: '',
      resave: false,
      saveUninitialized: false
    })
  )
  await app.listen(3000);
}
bootstrap();
