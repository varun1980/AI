import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnrichLeadsDto, GenerateOutreachDto, EnrichedLeadDto } from './dto';

export interface OutreachPackage extends EnrichedLeadDto {
  diagnosis: string;
  siteBrief: string;
  coldMessage: string;
  followUp1: string;
  followUp2: string;
  lovablePrompt: string;
  higgsfieldPrompt: string;
}

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(private configService: ConfigService) {}

  async enrichLeads(dto: EnrichLeadsDto): Promise<EnrichedLeadDto[]> {
    const prompt = `You are a local marketing analyst. I have a list of ${dto.niche} businesses in ${dto.city} sourced from Google Maps.

For each business, analyze their online presence and add three fields:
- presenceDiagnosis: One clear sentence on what is wrong with their website/online presence (or why having no website is costing them). Be specific, no buzzwords.
- outreachAngle: One specific hook I could use in outreach that feels personal — tied to their actual business name, service, location, or notes. Should sound like I actually looked them up.
- websiteGap: The concrete business outcome (leads, bookings, phone calls) they are losing because of their weak online presence.

Return ONLY a valid JSON array. No markdown, no explanation, no extra text. Each object must include all original fields plus the three new ones.

Here is the list:
${JSON.stringify(dto.leads, null, 2)}`;

    const text = await this.callClaude(prompt, 4096);
    return this.parseJsonResponse<EnrichedLeadDto[]>(text);
  }

  async generateOutreach(dto: GenerateOutreachDto): Promise<OutreachPackage[]> {
    const prompt = `You are a senior local marketing strategist building pre-sales assets for local businesses. For each business below, generate a complete outreach package.

Return ONLY a valid JSON array. No markdown, no extra text. Each object must include all original fields plus these seven new fields:

- diagnosis: 50 words max. What is broken about their online presence and what revenue is leaking because of it. Concrete and specific, no buzzwords.
- siteBrief: 100 words max. Hero angle, key services to highlight, tone that fits the industry, best call-to-action that converts, one design choice that sets them apart from local competitors.
- coldMessage: Under 70 words. Opens with one specific observation proving you looked at THIS business. References their actual service or location. Ends with a soft ask to see a mockup. Sound like a real person who looked them up. No corporate language. No mention of AI tools.
- followUp1: Under 50 words. Reference a specific gap in their current site. No AI mentions. Same genuine tone.
- followUp2: Under 50 words. Reference what a strong local competitor is doing better online. No AI mentions. Same tone.
- lovablePrompt: A complete Lovable.dev prompt to build a landing page for this specific business. Must include: business name, type, city, target audience description, brand feel (3 specific adjectives), hero focus tied to their strongest service, five sections in order (hero with CTA, three core services, about with credibility, social proof placeholder, final CTA), design details (specific color palette, generous whitespace, mobile-first, subtle scroll animations), industry-appropriate tone, and specific things to avoid (AI-looking gradients, generic stock photos, "Welcome to" headlines, "Your trusted partner" copy).
- higgsfieldPrompt: A complete Higgsfield.ai prompt for a 10-second cinematic walkthrough of the mockup. Include: camera movements (slow zoom on hero 2s, smooth pan to services, gentle ease to about, end on CTA with soft fade), style (premium, cinematic, professional, subtle motion on text, soft depth of field, modern editorial), format (9:16 vertical, 1080x1920), and things to avoid (dramatic zooms, fast cuts, aggressive color grading).

Make each row feel like a different person wrote it. No AI tool mentions anywhere in the user-facing copy fields.

Here is the list:
${JSON.stringify(dto.leads, null, 2)}`;

    const text = await this.callClaude(prompt, 8192);
    return this.parseJsonResponse<OutreachPackage[]>(text);
  }

  private async callClaude(prompt: string, maxTokens: number): Promise<string> {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) {
      throw new BadRequestException('ANTHROPIC_API_KEY is not configured on the server');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Anthropic API error ${response.status}: ${error}`);
      throw new BadRequestException(`Claude API request failed: ${response.status}`);
    }

    const data = (await response.json()) as { content: Array<{ text: string }> };
    return data.content[0].text;
  }

  private parseJsonResponse<T>(text: string): T {
    const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      this.logger.error(`Failed to parse Claude JSON response: ${cleaned.slice(0, 500)}`);
      throw new BadRequestException(
        'Claude returned malformed JSON. Try again or reduce the batch size.',
      );
    }
  }
}
