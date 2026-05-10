import {
  AnalyzeDocumentCommand,
  DetectDocumentTextCommand,
  TextractClient,
} from '@aws-sdk/client-textract';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class OcrService {
  private readonly client: TextractClient;
  private readonly logger = new Logger(OcrService.name);

  constructor() {
    this.client = new TextractClient({
      region: process.env.AWS_REGION || 'eu-west-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'stub',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'stub',
      },
    });
  }

  async extractText(bucket: string, key: string): Promise<string> {
    try {
      const command = new DetectDocumentTextCommand({
        Document: {
          S3Object: {
            Bucket: bucket,
            Name: key,
          },
        },
      });

      const response = await this.client.send(command);
      return (
        response.Blocks?.filter(b => b.BlockType === 'LINE')
          .map(b => b.Text)
          .join('\n') || ''
      );
    } catch (error) {
      this.logger.error(`OCR failed for ${key}`, (error as Error).stack);
      return '';
    }
  }

  async analyzeDocument(bucket: string, key: string): Promise<any> {
    try {
      const command = new AnalyzeDocumentCommand({
        Document: {
          S3Object: {
            Bucket: bucket,
            Name: key,
          },
        },
        FeatureTypes: ['TABLES', 'FORMS', 'QUERIES'],
      });

      const response = await this.client.send(command);
      return response.Blocks;
    } catch (error) {
      this.logger.error(`Document analysis failed for ${key}`, (error as Error).stack);
      return null;
    }
  }
}
