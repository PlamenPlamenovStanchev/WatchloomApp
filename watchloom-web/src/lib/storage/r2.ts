import { S3Client } from "@aws-sdk/client-s3";

const requiredEnvVars = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_ENDPOINT",
  "R2_PUBLIC_BASE_URL",
] as const;

export const getR2Config = () => {
  const missing: string[] = requiredEnvVars.filter((key) => !process.env[key]);
  const bucketName = process.env.R2_BUCKET_NAME || process.env.R2_MEDIA_BUCKET_NAME;

  if (!bucketName) {
    missing.push("R2_BUCKET_NAME or R2_MEDIA_BUCKET_NAME");
  }

  if (missing.length > 0) {
    throw new Error(`Missing R2 environment variables: ${missing.join(", ")}`);
  }

  return {
    bucketName,
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL!,
  };
};

export const r2Client = new S3Client({
  region: process.env.R2_REGION || "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});
