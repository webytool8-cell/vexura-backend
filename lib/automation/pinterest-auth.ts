const PINTEREST_API_BASE = 'https://api.pinterest.com/v5';
const PINTEREST_OAUTH_BASE = 'https://www.pinterest.com/oauth';

const DEFAULT_PINTEREST_SCOPES = [
  'pins:read',
  'pins:write',
  'boards:read',
  'user_accounts:read'
];

let cachedAccessToken: string | null = null;
let cachedTokenExpiry = 0;

interface PinterestTokenResponse {
  access_token: string;
  token_type: string;
  scope?: string;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  expires_in?: number;
}

function getConfiguredScopes(): string[] {
  const configured = process.env.PINTEREST_SCOPES?.trim();
  if (!configured) return DEFAULT_PINTEREST_SCOPES;

  return configured
    .split(',')
    .map((scope) => scope.trim())
    .filter(Boolean);
}

function getOAuthCredentials() {
  return {
    clientId: process.env.PINTEREST_APP_ID || process.env.PINTEREST_CLIENT_ID,
    clientSecret: process.env.PINTEREST_APP_SECRET || process.env.PINTEREST_CLIENT_SECRET,
    redirectUri: process.env.PINTEREST_REDIRECT_URI
  };
}

function assertOAuthEnv() {
  const { clientId, clientSecret, redirectUri } = getOAuthCredentials();

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      'Pinterest OAuth configuration is incomplete. Set PINTEREST_APP_ID (or PINTEREST_CLIENT_ID), PINTEREST_APP_SECRET (or PINTEREST_CLIENT_SECRET), and PINTEREST_REDIRECT_URI.'
    );
  }

  return { clientId, clientSecret, redirectUri };
}

export function getRequiredPinterestScopes(): string[] {
  return getConfiguredScopes();
}

export function buildPinterestAuthUrl(state?: string): string {
  const { clientId, redirectUri } = assertOAuthEnv();
  const scopes = getConfiguredScopes();

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes.join(','),
    ...(state ? { state } : {})
  });

  return `${PINTEREST_OAUTH_BASE}/?${params.toString()}`;
}

async function requestPinterestToken(params: URLSearchParams): Promise<PinterestTokenResponse> {
  const { clientId, clientSecret } = assertOAuthEnv();
  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${PINTEREST_API_BASE}/oauth/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authHeader}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  const text = await response.text();
  let parsed: any = null;

  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = { raw: text };
  }

  if (!response.ok) {
    throw new Error(`Pinterest token request failed (${response.status}): ${JSON.stringify(parsed)}`);
  }

  return parsed as PinterestTokenResponse;
}

export async function exchangePinterestCodeForToken(code: string): Promise<PinterestTokenResponse> {
  const { redirectUri } = assertOAuthEnv();

  if (!code) {
    throw new Error('Missing authorization code.');
  }

  const token = await requestPinterestToken(
    new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri
    })
  );

  cacheToken(token);
  return token;
}

export async function refreshPinterestAccessToken(refreshToken?: string): Promise<PinterestTokenResponse> {
  const existingRefreshToken = refreshToken || process.env.PINTEREST_REFRESH_TOKEN;

  if (!existingRefreshToken) {
    throw new Error('No Pinterest refresh token configured. Set PINTEREST_REFRESH_TOKEN.');
  }

  const token = await requestPinterestToken(
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: existingRefreshToken
    })
  );

  cacheToken(token);
  return token;
}

function cacheToken(token: PinterestTokenResponse) {
  cachedAccessToken = token.access_token;
  const ttl = Math.max(60, Number(token.expires_in || 0));
  cachedTokenExpiry = Date.now() + (ttl - 30) * 1000;
}

export async function getPinterestAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < cachedTokenExpiry) {
    return cachedAccessToken;
  }

  if (process.env.PINTEREST_ACCESS_TOKEN) {
    return process.env.PINTEREST_ACCESS_TOKEN;
  }

  const token = await refreshPinterestAccessToken();
  return token.access_token;
}

export function getPinterestAuthReadiness() {
  const { clientId, clientSecret, redirectUri } = getOAuthCredentials();

  return {
    clientIdConfigured: Boolean(clientId),
    clientSecretConfigured: Boolean(clientSecret),
    redirectUriConfigured: Boolean(redirectUri),
    accessTokenConfigured: Boolean(process.env.PINTEREST_ACCESS_TOKEN),
    refreshTokenConfigured: Boolean(process.env.PINTEREST_REFRESH_TOKEN),
    scopes: getConfiguredScopes()
  };
}
