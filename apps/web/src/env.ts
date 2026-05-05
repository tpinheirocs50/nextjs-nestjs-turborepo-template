import { z } from "zod";

const serverSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:3001"),
});

const isServer = typeof window === "undefined";

const processEnv = {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
};

const parsed = isServer
  ? serverSchema.merge(clientSchema).safeParse(processEnv)
  : clientSchema.safeParse(processEnv);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(JSON.stringify(z.treeifyError(parsed.error), null, 2));
  throw new Error("Invalid environment variables");
}

export const env = parsed.data as z.infer<typeof serverSchema> &
  z.infer<typeof clientSchema>;
