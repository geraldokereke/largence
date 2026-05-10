import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Largence Legal OS API')
    .setDescription(
      'The core API for the Largence Legal Operating System. Powering legal productivity, organisation management, and matter automation.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication & MFA flow')
    .addTag('organisations', 'Law firm organisation & member management')
    .addTag('workspaces', 'Departmental workspaces & team isolation')
    .addTag('matters', 'Legal case management, conflict checks & billable time')
    .addTag('audit', 'Enterprise audit logging & certificate generation')
    .addTag('users', 'User profiles & internal preferences')
    .addTag('system', 'Platform administration (Admin only)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.use(cookieParser());

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      const allowedOrigins = [
        /^https?:\/\/[a-z0-9-]+\.largence\.com$/,
        /^https?:\/\/localhost(:\d+)?$/,
      ];

      if (!origin || allowedOrigins.some(regex => regex.test(origin))) {
        callback(null, true);
      } else {
        callback(new Error('Origin not allowed by CORS'));
      }
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(3001);
  console.log(`Application has started on port 3001`);
}
bootstrap().catch(err => {
  console.error('Failed to start application', err);
  process.exit(1);
});
