import { ApiClient, createApi } from "@repo/api-client";
import { env } from "@/env";

const client = new ApiClient({
  baseUrl: env.NEXT_PUBLIC_API_URL,
});

export const api = createApi(client);
