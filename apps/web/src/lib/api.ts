import { ApiClient, createApi } from "@repo/api-client";
import { env } from "@/env";

// Server-side: use INTERNAL_API_URL if set (for container-to-container networking),
// otherwise fall back to the public URL.
// Client-side: always use the public URL.
const isServer = typeof window === "undefined";
const baseUrl = isServer
  ? (env.INTERNAL_API_URL ?? env.NEXT_PUBLIC_API_URL)
  : env.NEXT_PUBLIC_API_URL;

const client = new ApiClient({ baseUrl });

export const api = createApi(client);
