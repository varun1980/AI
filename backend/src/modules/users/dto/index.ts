import { IsString, IsOptional, IsEmail, IsDateString, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsEmail()
  @IsOptional()
  parentEmail?: string;

  @IsString()
  @IsOptional()
  parentName?: string;

  @IsBoolean()
  @IsOptional()
  consentGiven?: boolean;
}
