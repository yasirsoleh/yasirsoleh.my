export type TokenClaims = {
  sub: string;
  account_name: string;
  email: string;
};

export function extractTokenClaims(token: string): TokenClaims | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}
