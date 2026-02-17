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

@Controller('workspaces/:workspaceId/notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  async getNotes(@Param('workspaceId') workspaceId: string) {
    return this.notesService.getNotes(workspaceId);
  }

  @Get('search')
  async search(
    @Param('workspaceId') workspaceId: string,
    @Query('q') q: string,
  ) {
    return this.notesService.search(workspaceId, q);
  }

  @Get(':id')
  async getNote(
    @Param('workspaceId') workspaceId: string,
    @Param('id') noteId: string,
  ) {
    return this.notesService.getNote(noteId, workspaceId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createNote(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateNoteDto,
  ) {
    return this.notesService.createNote(workspaceId, 'default-user', dto);
  }

  @Patch(':id')
  async updateNote(
    @Param('workspaceId') workspaceId: string,
    @Param('id') noteId: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.notesService.updateNote(noteId, 'default-user', workspaceId, dto);
  }

  @Delete(':id')
  async deleteNote(
    @Param('workspaceId') workspaceId: string,
    @Param('id') noteId: string,
  ) {
    return this.notesService.deleteNote(noteId, 'default-user', workspaceId);
  }

  @Get(':id/revisions')
  async getRevisions(
    @Param('workspaceId') workspaceId: string,
    @Param('id') noteId: string,
  ) {
    return this.notesService.getRevisions(noteId, workspaceId);
  }

  @Post(':id/revisions/:revisionId/restore')
  async restoreRevision(
    @Param('workspaceId') workspaceId: string,
    @Param('id') noteId: string,
    @Param('revisionId') revisionId: string,
  ) {
    return this.notesService.restoreRevision(noteId, revisionId, 'default-user', workspaceId);
  }

  @Post(':id/share')
  async createShareLink(
    @Param('workspaceId') workspaceId: string,
    @Param('id') noteId: string,
  ) {
    return this.notesService.createShareLink(noteId, workspaceId);
  }
}

