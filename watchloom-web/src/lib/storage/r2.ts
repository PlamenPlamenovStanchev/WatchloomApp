import { S3Client } from "@aws-sdk/client-s3";

const requiredEnvVars = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_ENDPOINT",
  "R2_PUBLIC_BASE_URL",
] as const;

export const getR2Config = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing R2 environment variables: ${missing.join(", ")}`);
  }

  return {
    bucketName: process.env.R2_BUCKET_NAME!,
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
