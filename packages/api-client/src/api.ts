import type { HealthCheck } from "@repo/shared-types";
import type { ApiClient } from "./client";

export const createApi = (client: ApiClient) => ({
  health: {
    get: () => client.get<HealthCheck>("/health"),
  },
});

export type Api = ReturnType<typeof createApi>;
