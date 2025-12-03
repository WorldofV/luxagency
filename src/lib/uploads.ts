import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const uploadDir = path.join(process.cwd(), "public/uploads");

async function ensureDir() {
  await fs.mkdir(uploadDir, { recursive: true });
}

const inferExtension = (fileName: string) => {
  const ext = path.extname(fileName);
  if (ext) return ext;
  return ".jpg";
};

export async function saveUploadedFile(file: File) {
  await ensureDir();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const extension = inferExtension(file.name);
  const fileName = `${Date.now()}-${randomUUID()}${extension}`;
  const filePath = path.join(uploadDir, fileName);
  await fs.writeFile(filePath, buffer);
  return {
    url: `/uploads/${fileName}`,
    path: filePath,
  };
}


