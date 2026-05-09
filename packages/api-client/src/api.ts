import type { HealthCheck, Me } from "@repo/shared-types";
import type { ApiClient } from "./client";

export const createApi = (client: ApiClient) => ({
  health: {
    get: () => client.get<HealthCheck>("/health"),
  },
  me: {
    get: (init?: RequestInit) => client.get<Me>("/me", init),
  }
});
