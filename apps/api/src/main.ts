import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend requests
  const allowedOrigins = [
    process.env.DASHBOARD_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
  ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 4000);
  console.log(`🚀 Server running on port ${process.env.PORT ?? 4000}`);
}

void bootstrap();
