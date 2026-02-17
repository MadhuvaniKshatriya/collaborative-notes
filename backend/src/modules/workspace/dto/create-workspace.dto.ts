import { IsString, MinLength } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  description?: string;
}
