import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { EnrichLeadsDto, GenerateOutreachDto } from './dto';

@Controller('leads')
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Post('enrich')
  @HttpCode(HttpStatus.OK)
  async enrich(@Body() dto: EnrichLeadsDto) {
    return this.leadsService.enrichLeads(dto);
  }

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generate(@Body() dto: GenerateOutreachDto) {
    return this.leadsService.generateOutreach(dto);
  }
}
