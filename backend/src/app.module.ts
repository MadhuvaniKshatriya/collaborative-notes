import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { NotesModule } from './modules/notes/notes.module';
import { ActivityModule } from './modules/activity/activity.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotesService } from './modules/notes/notes.service';
import { CollaborationGateway } from './modules/collaboration/collaboration.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    WorkspaceModule,
    NotesModule,
    ActivityModule,
  ],
  controllers: [AppController],
  providers: [AppService, NotesService, CollaborationGateway],
})
export class AppModule {}
