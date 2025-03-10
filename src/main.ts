import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  logger.log('🚀 Starting application...');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`
🚀 Server is running on: ${await app.getUrl()}
⚡️ Environment: ${process.env.NODE_ENV || 'development'}
  `);
}

bootstrap().catch((error) => {
  new Logger('Bootstrap').error('❌ Error starting server:', error);
  process.exit(1);
});

