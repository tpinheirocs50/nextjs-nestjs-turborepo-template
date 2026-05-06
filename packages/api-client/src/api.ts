import type { HealthCheck } from "@repo/shared-types";
import type { ApiClient } from "./client";

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

export const createApi = (client: ApiClient) => ({
  health: {
    get: () => client.get<HealthCheck>("/health"),
  },
  users: {
    list: () => client.get<User[]>("/users"),
  },
});

export type Api = ReturnType<typeof createApi>;
