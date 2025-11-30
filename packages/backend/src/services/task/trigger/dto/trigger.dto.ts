import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString
} from "class-validator";
import { IsValidCron } from "../decorators/is-valid-cron.decorator";

export class CreateTriggerDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  taskName!: string;

  @IsString()
  @IsNotEmpty()
  @IsValidCron()
  cron!: string;

  @IsOptional()
  @IsObject()
  params?: Record<string, any>;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class UpdateTriggerDto {
  @IsOptional()
  @IsString()
  @IsValidCron()
  cron?: string;

  @IsOptional()
  @IsObject()
  params?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}
