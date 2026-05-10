import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly logger = new Logger(StorageService.name);

  constructor() {
    this.client = new S3Client({
      region: process.env.AWS_REGION || 'eu-west-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'stub',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'stub',
      },
      endpoint: process.env.AWS_S3_ENDPOINT, // For Minio/Local testing
      forcePathStyle: !!process.env.AWS_S3_ENDPOINT,
    });
    this.bucket = process.env.AWS_S3_BUCKET || 'largence-documents';
  }

  async upload(
    key: string,
    body: Buffer | Uint8Array | Blob,
    contentType: string,
  ): Promise<string> {
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
        }),
      );
      return key;
    } catch (error) {
      this.logger.error(`Failed to upload file to S3: ${key}`, (error as Error).stack);
      throw error;
    }
  }

  async getDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.client, command, { expiresIn });
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (error) {
      this.logger.error(`Failed to delete file from S3: ${key}`, (error as Error).stack);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }
}
