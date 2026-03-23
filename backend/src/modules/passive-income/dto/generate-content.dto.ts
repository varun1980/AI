import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';

export enum ContentTopic {
  FOOTBALL_TRAINING = 'football_training',
  YOUTH_DEVELOPMENT = 'youth_development',
  NUTRITION = 'nutrition',
  MENTAL_STRENGTH = 'mental_strength',
  COACHING_TIPS = 'coaching_tips',
  INJURY_PREVENTION = 'injury_prevention',
  SKILL_DRILLS = 'skill_drills',
  PARENT_GUIDE = 'parent_guide',
}

export class GenerateContentDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsEnum(ContentTopic)
  topic?: ContentTopic;

  @IsOptional()
  @IsString()
  focusKeyword?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsString()
  targetAudience?: string;

  @IsOptional()
  @IsString()
  tone?: string;  // 'professional', 'casual', 'inspiring', 'educational'

  @IsOptional()
  @IsString()
  wordCount?: string;  // '800', '1200', '2000'
}
