import { IsString, IsOptional, IsDateString, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  sessionConfigId: string;

  @IsDateString()
  startTime: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID()
  @IsOptional()
  packageId?: string;
}

export class UpdateBookingDto {
  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CancelBookingDto {
  @IsString()
  @IsOptional()
  reason?: string;
}
