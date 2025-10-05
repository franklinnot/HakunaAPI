import {
  Controller,
  Post,
  Get,
  Body,
  Patch,
  Param,
  Query,
  Put,
} from '@nestjs/common';
import { MensajeService } from '../application/message.service';
import { CreateMensajeDto } from '../application/dto/create-message.dto';
import type { FilterQuery } from 'mongoose';
import { Mensaje } from '../domain/schemas/message.schema';

@Controller('message')
export class MessageController {

  constructor(private readonly mensajeService: MensajeService) {}

    @Post('create')
      register(@Body() createMensajeDto: CreateMensajeDto) {
        return this.mensajeService.create(createMensajeDto);
      }

}