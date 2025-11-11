import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
  private s3: AWS.S3;
  private bucket: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION'),
    });
    this.bucket = this.configService.get('AWS_S3_BUCKET') || 'sanches-coaching';
  }

  async uploadFile(file: Express.Multer.File, type: 'image' | 'video') {
    const key = `${type}s/${uuidv4()}-${file.originalname}`;

    const uploadParams = {
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    const result = await this.s3.upload(uploadParams).promise();

    const media = await this.prisma.media.create({
      data: {
        title: file.originalname,
        type,
        url: result.Location,
        s3Key: key,
        s3Bucket: this.bucket,
        fileSize: file.size,
        mimeType: file.mimetype,
      },
    });

    return media;
  }

  async findAll(type?: 'image' | 'video') {
    return this.prisma.media.findMany({
      where: type ? { type } : {},
      orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findById(id: string) {
    return this.prisma.media.findUnique({ where: { id } });
  }

  async delete(id: string) {
    const media = await this.findById(id);
    if (!media) return;

    // Delete from S3
    await this.s3
      .deleteObject({
        Bucket: this.bucket,
        Key: media.s3Key,
      })
      .promise();

    // Delete from database
    return this.prisma.media.delete({ where: { id } });
  }

  async update(id: string, data: any) {
    return this.prisma.media.update({
      where: { id },
      data,
    });
  }
}
