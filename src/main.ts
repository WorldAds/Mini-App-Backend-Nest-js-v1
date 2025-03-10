import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  logger.log('🚀 Starting application...');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Advertisement API')
    .setDescription('The Advertisement API description')
    .setVersion('1.0')
    .addTag('advertisements')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`
🚀 Server is running on: ${await app.getUrl()}
📝 Swagger documentation: ${await app.getUrl()}/api
⚡️ Environment: ${process.env.NODE_ENV || 'development'}
  `);
}

bootstrap().catch((error) => {
  new Logger('Bootstrap').error('❌ Error starting server:', error);
  process.exit(1);
});

