import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import path from 'path';
import fs from 'fs/promises';

@Injectable()
export class UploadsService {
  constructor(private configService: ConfigService) {}

  async uploadFile(
    file: Express.Multer.File,
  ): Promise<{ filename: string; url: string }> {
    const uploadDir = this.configService.get<string>(
      'UPLOAD_DEST',
      './uploads',
    );

    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    const filepath = path.join(uploadDir, filename);

    await fs.writeFile(filepath, file.buffer);

    return {
      filename,
      url: `/uploads/${filename}`,
    };
  }

  async deleteFile(filename: string): Promise<void> {
    const uploadDir = this.configService.get<string>(
      'UPLOAD_DEST',
      './uploads',
    );
    const filepath = path.join(uploadDir, filename);

    try {
      await fs.unlink(filepath);
    } catch (error) {
      // File doesn't exist or already deleted
      console.warn(`Could not delete file: ${filepath}`, error.message);
    }
  }

  getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }
}
