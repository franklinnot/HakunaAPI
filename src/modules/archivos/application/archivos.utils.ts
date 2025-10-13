import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { fileTypeFromBuffer } from 'file-type';

@Injectable()
export class ArchivosUtils {
  private readonly allowedFormats = ['image/webp', 'image/png', 'image/jpeg'];

  // base64 a Buffer
  base64ToBuffer(base64: string): Buffer | null {
    try {
      const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;

      // validar que sea un base64 válido
      const buffer = Buffer.from(cleanBase64, 'base64');
      if (buffer.toString('base64') !== cleanBase64.replace(/\s/g, '')) {
        return null; // no es base64 válido
      }
      return buffer;
    } catch {
      return null;
    }
  }

  // extrae el tipo MIME desde el Base64
  async getMimeType(base64: string): Promise<string | null> {
    const buffer = Buffer.from(base64, 'base64');
    const fileType = await fileTypeFromBuffer(buffer);
    return fileType?.mime || null;
  }

  // Obtiene el tamaño del buffer en MB como string
  obtenerTamañoMB(buffer: Buffer): number {
    const sizeMB = buffer.length / (1024 * 1024);
    return Number(sizeMB.toFixed(2));
  }

  validarImagen(mimeType: string): boolean {
    if (!this.allowedFormats.includes(mimeType)) {
      return false;
    }
    return true;
  }

  async convertirAWebp(buffer: Buffer): Promise<Buffer | null> {
    try {
      const result = await sharp(buffer).webp({ quality: 80 }).toBuffer();
      return result;
    } catch {
      return null;
    }
  }
}
