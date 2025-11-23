import { Injectable } from '@nestjs/common';
import { fileTypeFromBuffer, FileTypeResult } from 'file-type';

@Injectable()
export class ArchivosUtils {
  // Limpia el base64 (remueve data:image/png;base64, etc.)
  private limpiarBase64(base64: string): string {
    if (!base64) return '';
    const comaIndex = base64.indexOf(',');
    return comaIndex !== -1 ? base64.substring(comaIndex + 1) : base64;
  }

  // Convierte base64 a Buffer
  base64ToBuffer(base64: string): Buffer | null {
    try {
      const cleanBase64 = this.limpiarBase64(base64);
      const buffer = Buffer.from(cleanBase64, 'base64');

      // Validar que realmente sea un base64 válido
      if (buffer.toString('base64') !== cleanBase64.replace(/\s/g, '')) {
        return null;
      }
      return buffer;
    } catch {
      return null;
    }
  }

  // Obtener el file type
  async getFileType(base64: string): Promise<FileTypeResult | null> {
    try {
      const cleanBase64 = this.limpiarBase64(base64);
      const buffer = Buffer.from(cleanBase64, 'base64');
      const fileType = await fileTypeFromBuffer(buffer);
      return fileType || null;
    } catch {
      return null;
    }
  }

  // Obtiene el tamaño del buffer en MB
  obtenerTamañoMB(buffer: Buffer): number {
    const sizeMB = buffer.length / (1024 * 1024);
    return Number(sizeMB.toFixed(2));
  }

  async getBuffer(
    base64: string,
    allowedFormats?: string[],
  ): Promise<Buffer | null> {
    if (allowedFormats) {
      const fileType = await this.getFileType(base64);
      if (!fileType || !allowedFormats.includes(fileType.mime)) {
        return null;
      }
    }

    const buffer = this.base64ToBuffer(base64);
    return buffer || null;
  }
}
