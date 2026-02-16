import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  getAll() {
    return this.notesService.getAll();
  }

  @Get('search')
  search(@Query('q') q: string) {
    return this.notesService.search(q);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.notesService.getOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateNoteDto) {
    return this.notesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateNoteDto) {
    return this.notesService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.notesService.delete(id);
  }

  @Get(':id/revisions')
  getRevisions(@Param('id') id: string) {
    return this.notesService.getRevisions(id);
  }
}
