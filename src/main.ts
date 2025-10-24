import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { JwtAuthGuard } from './modules/auth/presentation/jwt/jwt.guard';
import { FiltroExcepcion } from './exception.filter';
import { json } from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Disable default bodyParser
  });

  // Enable body-parser with a larger limit for JSON payloads
  app.use(json({ limit: '50mb' }));

  const logger = new Logger(); // logger para el proceso de arranque

  // acceder a las variables de entorno
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT') || 3000;

  // CONFIGURACIONES GLOBALES

  // aplicar reglas de DTOS
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // guard de jwt
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  // configuracion de swagger
  const config = new DocumentBuilder().setTitle('API de Hakuna').build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // dispobible en /api/docs

  // asegurrar que la app no se apague abruptamente
  app.enableShutdownHooks();

  // filtro de excepciones
  app.useGlobalFilters(new FiltroExcepcion());

  // cors
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // run run
  await app.listen(PORT);
  logger.log(`Aplicación corriendo en http://localhost:${PORT}/api`);
  logger.log(`Documentación disponible en: http://localhost:${PORT}/api/docs`);
}
bootstrap();
