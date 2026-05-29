import { PutObjectCommand } from "@aws-sdk/client-s3";

import { getR2Config, r2Client } from "@/lib/storage/r2";

type PosterMediaType = "movie" | "series";

type UploadPosterFileInput = {
  buffer: Buffer;
  originalFilename: string;
  contentType: string;
  mediaType: PosterMediaType;
  entityId: number;
  slugOrTitle?: string | null;
};

const maxPosterFileSize = 5 * 1024 * 1024;

const allowedImageTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export class StorageServiceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "EMPTY_FILE"
      | "FILE_TOO_LARGE"
      | "UNSUPPORTED_FILE_TYPE"
      | "INVALID_IMAGE_SIGNATURE",
  ) {
    super(message);
    this.name = "StorageServiceError";
  }
}

const sanitizeSlugPart = (value?: string | null) => {
  const slug = value
    ?.toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return slug || "poster";
};

const hasValidImageSignature = (buffer: Buffer, contentType: keyof typeof allowedImageTypes) => {
  if (contentType === "image/jpeg") {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (contentType === "image/png") {
    return (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }

  return (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  );
};

const validatePosterFile = (input: UploadPosterFileInput) => {
  if (input.buffer.length === 0) {
    throw new StorageServiceError("Choose a poster image before uploading.", "EMPTY_FILE");
  }

  if (input.buffer.length > maxPosterFileSize) {
    throw new StorageServiceError("Poster image must be 5MB or smaller.", "FILE_TOO_LARGE");
  }

  if (!(input.contentType in allowedImageTypes)) {
    throw new StorageServiceError("Poster image must be JPEG, PNG, or WebP.", "UNSUPPORTED_FILE_TYPE");
  }

  const safeContentType = input.contentType as keyof typeof allowedImageTypes;

  if (!hasValidImageSignature(input.buffer, safeContentType)) {
    throw new StorageServiceError("Poster image contents do not match the selected file type.", "INVALID_IMAGE_SIGNATURE");
  }

  return {
    contentType: safeContentType,
    extension: allowedImageTypes[safeContentType],
  };
};

export const buildPublicR2Url = (key: string) => {
  const { publicBaseUrl } = getR2Config();

  return `${publicBaseUrl.replace(/\/+$/, "")}/${key.replace(/^\/+/, "")}`;
};

export const uploadPosterFile = async (input: UploadPosterFileInput) => {
  const { bucketName } = getR2Config();
  const { contentType, extension } = validatePosterFile(input);
  const mediaFolder = input.mediaType === "movie" ? "movies" : "series";
  const slugPart = sanitizeSlugPart(input.slugOrTitle || input.originalFilename);
  const key = `posters/${mediaFolder}/${input.entityId}-${slugPart}-${Date.now()}.${extension}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: input.buffer,
      ContentType: contentType,
    }),
  );

  return {
    key,
    publicUrl: buildPublicR2Url(key),
    contentType,
    size: input.buffer.length,
  };
};
