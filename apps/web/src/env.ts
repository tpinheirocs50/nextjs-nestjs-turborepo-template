import { z } from "zod";

const serverSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  INTERNAL_API_URL: z.string().url().optional(),
  BETTER_AUTH_SECRET: z.string().min(32, "must be at least 32 characters"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:3001"),
});

const isServer = typeof window === "undefined";

const processEnv = {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  INTERNAL_API_URL: process.env.INTERNAL_API_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
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
