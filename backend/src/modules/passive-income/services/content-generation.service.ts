import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaService } from '../../prisma/prisma.service';
import { ContentStatus } from '@prisma/client';
import { GenerateContentDto, ContentTopic } from '../dto/generate-content.dto';

@Injectable()
export class ContentGenerationService {
  private readonly logger = new Logger(ContentGenerationService.name);
  private readonly anthropic: Anthropic;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.anthropic = new Anthropic({
      apiKey: this.config.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  async generateBlogPost(dto: GenerateContentDto) {
    this.logger.log(`Generating blog post: ${dto.title}`);

    const wordCount = dto.wordCount || '1200';
    const audience = dto.targetAudience || 'parents and young footballers in the UK';
    const tone = dto.tone || 'inspiring and educational';
    const keywords = dto.keywords?.join(', ') || dto.focusKeyword || 'football coaching';

    const prompt = `You are an expert football coaching content writer for Sanches Coaching, a premium football coaching service in the UK run by Gus Sanches.

Write a comprehensive, SEO-optimised blog post with the following specifications:

**Title:** ${dto.title}
**Focus Keyword:** ${dto.focusKeyword || keywords}
**Target Audience:** ${audience}
**Tone:** ${tone}
**Word Count:** approximately ${wordCount} words
**Keywords to include naturally:** ${keywords}

Requirements:
- Write in HTML format with proper heading tags (h2, h3)
- Include a compelling introduction that hooks the reader
- Use bullet points and numbered lists where appropriate
- Include a strong call-to-action at the end pointing to booking a session with Sanches Coaching
- Naturally mention football training, youth development, or skill improvement
- Include practical, actionable advice that demonstrates expertise
- End with a section about how Sanches Coaching can help

Return ONLY the HTML content (no markdown wrapper, no code blocks), starting with the first paragraph.`;

    const message = await this.anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '';

    // Generate slug from title
    const slug = this.generateSlug(dto.title);

    // Generate meta description
    const metaDescription = await this.generateMetaDescription(dto.title, dto.focusKeyword || keywords);

    const post = await this.prisma.contentPost.create({
      data: {
        title: dto.title,
        slug,
        content,
        focusKeyword: dto.focusKeyword,
        keywords: dto.keywords || [],
        category: this.mapTopicToCategory(dto.topic),
        metaTitle: `${dto.title} | Sanches Coaching`,
        metaDescription,
        status: ContentStatus.DRAFT,
        aiGenerated: true,
        aiModel: 'claude-opus-4-6',
        generationPrompt: prompt,
        author: 'Gus Sanches',
      },
    });

    this.logger.log(`Generated blog post: ${post.id} - ${post.title}`);
    return post;
  }

  async generateEmailCopy(subject: string, goal: string, tone: string = 'warm and personal'): Promise<{ subject: string; htmlContent: string; textContent: string }> {
    const prompt = `Write a high-converting marketing email for Sanches Coaching, a premium football coaching service in London run by Gus Sanches.

**Email Subject:** ${subject}
**Goal:** ${goal}
**Tone:** ${tone}

Requirements:
- Write in HTML format for the email body
- Keep it personal and conversational
- Include a clear, compelling call-to-action button
- Use social proof where appropriate
- Maximum 300 words
- Include a plain text version after HTML, separated by "---PLAIN TEXT---"
- The call-to-action should link to [CTA_URL] (placeholder)

Write only the email content, starting with the HTML body content.`;

    const message = await this.anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const fullContent = message.content[0].type === 'text' ? message.content[0].text : '';
    const parts = fullContent.split('---PLAIN TEXT---');
    const htmlContent = parts[0].trim();
    const textContent = parts[1]?.trim() || htmlContent.replace(/<[^>]+>/g, '');

    return { subject, htmlContent, textContent };
  }

  async generateSocialPost(topic: string, platform: 'TWITTER' | 'INSTAGRAM' | 'FACEBOOK'): Promise<{ caption: string; hashtags: string[] }> {
    const limits = { TWITTER: 280, INSTAGRAM: 2200, FACEBOOK: 1000 };
    const limit = limits[platform];

    const prompt = `Write an engaging ${platform} post for Sanches Coaching, a premium football coaching service in London.

Topic: ${topic}
Character limit: ${limit}

Requirements:
- Write a compelling caption that stops the scroll
- Include a subtle call-to-action
- ${platform === 'TWITTER' ? 'Keep it punchy and quotable' : 'Use emojis sparingly but effectively'}
- End with "[LINK]" placeholder

After the caption, on a new line starting with "HASHTAGS:", list 8-12 relevant hashtags separated by spaces.`;

    const message = await this.anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const hashtagMatch = text.match(/HASHTAGS:\s*(.+)/s);
    const hashtagLine = hashtagMatch ? hashtagMatch[1].trim() : '';
    const hashtags = hashtagLine.match(/#\w+/g) || [];
    const caption = text.replace(/HASHTAGS:[\s\S]*/, '').trim();

    return { caption, hashtags };
  }

  async bulkGenerateContentPlan(topics: string[]): Promise<any[]> {
    this.logger.log(`Bulk generating ${topics.length} content posts`);
    const results = [];

    for (const topic of topics) {
      try {
        const post = await this.generateBlogPost({
          title: topic,
          topic: ContentTopic.FOOTBALL_TRAINING,
          focusKeyword: topic.toLowerCase().replace(/\s+/g, ' '),
          tone: 'educational and inspiring',
          wordCount: '1000',
        });
        results.push(post);
        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        this.logger.error(`Failed to generate post for "${topic}": ${err.message}`);
      }
    }

    return results;
  }

  async getPublishedPosts(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      this.prisma.contentPost.findMany({
        where: { status: ContentStatus.PUBLISHED },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          category: true,
          tags: true,
          featuredImageUrl: true,
          publishedAt: true,
          viewCount: true,
          author: true,
        },
      }),
      this.prisma.contentPost.count({ where: { status: ContentStatus.PUBLISHED } }),
    ]);

    return { posts, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getPostBySlug(slug: string) {
    const post = await this.prisma.contentPost.findUnique({
      where: { slug },
    });

    if (post && post.status === ContentStatus.PUBLISHED) {
      // Increment view count
      await this.prisma.contentPost.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } },
      });
    }

    return post;
  }

  async publishPost(postId: string) {
    return this.prisma.contentPost.update({
      where: { id: postId },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private async generateMetaDescription(title: string, keyword: string): Promise<string> {
    const message = await this.anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: `Write a compelling SEO meta description (max 155 characters) for a blog post titled "${title}" targeting the keyword "${keyword}". Write only the meta description, nothing else.`,
      }],
    });

    return message.content[0].type === 'text' ? message.content[0].text.slice(0, 155) : '';
  }

  private mapTopicToCategory(topic?: ContentTopic): string {
    const map: Record<ContentTopic, string> = {
      [ContentTopic.FOOTBALL_TRAINING]: 'Football Training',
      [ContentTopic.YOUTH_DEVELOPMENT]: 'Youth Development',
      [ContentTopic.NUTRITION]: 'Nutrition & Health',
      [ContentTopic.MENTAL_STRENGTH]: 'Mental Performance',
      [ContentTopic.COACHING_TIPS]: 'Coaching Tips',
      [ContentTopic.INJURY_PREVENTION]: 'Injury Prevention',
      [ContentTopic.SKILL_DRILLS]: 'Skill Drills',
      [ContentTopic.PARENT_GUIDE]: "Parent's Guide",
    };
    return topic ? map[topic] : 'Football Training';
  }
}
