import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { NotesService } from './modules/notes/notes.service';

type HealthResponse = {
  status: 'ok' | 'error';
  uptime: number;
  timestamp: string;
};

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly notesService: NotesService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  health(): HealthResponse {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('share/:token')
  async getSharedNote(@Param('token') token: string) {
    return this.notesService.getSharedNote(token);
  }
}
