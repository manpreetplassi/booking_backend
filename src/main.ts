import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Setup Middleware (No await here!)
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());


  // 3. Start everything
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  console.log(`🚀 HTTP Server is running on: http://localhost:${port}`);
  console.log(`Ready to receive Redis events...`);
}
bootstrap();