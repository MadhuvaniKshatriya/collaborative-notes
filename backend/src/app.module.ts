import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { NotesModule } from './modules/notes/notes.module';
import { CommentsModule } from './modules/comments/comments.module';
import { ActivityModule } from './modules/activity/activity.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    WorkspaceModule,
    NotesModule,
    CommentsModule,
    ActivityModule,
    GatewayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
