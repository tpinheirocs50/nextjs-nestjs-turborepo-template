export interface HealthCheck {
  status: "ok";
  timestamp: string;
}
export interface Me {
  user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image: string | null;
  };
  session: {
    id: string;
    expiresAt: string;
  };
}