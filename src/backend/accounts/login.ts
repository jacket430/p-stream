import { ofetch } from "ofetch";

import { SessionResponse } from "@/backend/accounts/auth";

export interface ChallengeTokenResponse {
  challenge: string;
}

export async function getLoginChallengeToken(
  url: string,
  publicKey: string,
  turnstileToken?: string,
): Promise<ChallengeTokenResponse> {
  const headers: Record<string, string> = {};
  if (turnstileToken) {
    headers["x-turnstile-token"] = turnstileToken;
  }

  return ofetch<ChallengeTokenResponse>("/auth/login/start", {
    method: "POST",
    body: {
      publicKey,
    },
    baseURL: url,
    headers,
  });
}

export interface LoginResponse {
  session: SessionResponse;
  token: string;
}

export interface LoginInput {
  publicKey: string;
  challenge: {
    code: string;
    signature: string;
  };
  device: string;
}

export async function loginAccount(
  url: string,
  data: LoginInput,
  turnstileToken?: string,
): Promise<LoginResponse> {
  const headers: Record<string, string> = {};
  if (turnstileToken) {
    headers["x-turnstile-token"] = turnstileToken;
  }

  return ofetch<LoginResponse>("/auth/login/complete", {
    method: "POST",
    body: {
      namespace: "movie-web",
      ...data,
    },
    baseURL: url,
    headers,
  });
}
