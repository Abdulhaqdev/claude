import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import prisma from "@/lib/db/prisma";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./uploads";
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE ?? "10485760");

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "text/csv",
];

export class FileUploadService {
  async upload(
    file: File,
    organizationId: string,
    options?: { entityType?: string; entityId?: string; uploadedBy?: string }
  ) {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File exceeds maximum size of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error("File type not allowed");
    }

    const ext = path.extname(file.name);
    const filename = `${nanoid()}${ext}`;
    const dir = path.join(UPLOAD_DIR, organizationId);

    await mkdir(dir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filepath = path.join(dir, filename);
    await writeFile(filepath, buffer);

    const url = `/uploads/${organizationId}/${filename}`;

    return prisma.fileUpload.create({
      data: {
        organizationId,
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url,
        entityType: options?.entityType,
        entityId: options?.entityId,
        uploadedBy: options?.uploadedBy,
      },
    });
  }

  async getByEntity(entityType: string, entityId: string) {
    return prisma.fileUpload.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const fileUploadService = new FileUploadService();
