import { Module } from '@nestjs/common';
import { NotesModule } from './modules/notes/notes.module';
import { RevisionsModule } from './modules/revisions/revisions.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, NotesModule, RevisionsModule],
})
export class AppModule { }
