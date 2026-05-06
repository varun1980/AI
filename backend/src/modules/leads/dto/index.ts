import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RawLeadDto {
  @IsString()
  businessName: string;

  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  currentWebsite?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class EnrichLeadsDto {
  @IsString()
  niche: string;

  @IsString()
  city: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RawLeadDto)
  leads: RawLeadDto[];
}

export class EnrichedLeadDto {
  businessName: string;
  location: string;
  currentWebsite?: string;
  phoneNumber?: string;
  notes?: string;
  presenceDiagnosis: string;
  outreachAngle: string;
  websiteGap: string;
}

export class GenerateOutreachDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EnrichedLeadDto)
  leads: EnrichedLeadDto[];
}
