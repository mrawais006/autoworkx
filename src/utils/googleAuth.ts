// Google OAuth 2.0 Authentication Helper
// This helps manage the OAuth flow for Google My Business API

export class GoogleAuthHelper {
  private clientId: string;
  private scope: string = 'https://www.googleapis.com/auth/business.manage';
  private redirectUri: string;

  constructor(clientId: string, redirectUri?: string) {
    this.clientId = clientId;
    this.redirectUri = redirectUri || `${window.location.origin}/auth/callback`;
  }

  // Generate OAuth URL for user to visit
  generateAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scope,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string, clientSecret: string): Promise<any> {
    const tokenEndpoint = 'https://oauth2.googleapis.com/token';
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectUri
    });

    try {
      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }

  // Store tokens securely (in production, use secure storage)
  storeTokens(tokens: any): void {
    localStorage.setItem('google_access_token', tokens.access_token);
    if (tokens.refresh_token) {
      localStorage.setItem('google_refresh_token', tokens.refresh_token);
    }
    if (tokens.expires_in) {
      const expiryTime = Date.now() + (tokens.expires_in * 1000);
      localStorage.setItem('google_token_expiry', expiryTime.toString());
    }
  }

  // Get stored access token
  getAccessToken(): string | null {
    const token = localStorage.getItem('google_access_token');
    const expiry = localStorage.getItem('google_token_expiry');
    
    if (!token) return null;
    
    if (expiry && Date.now() > parseInt(expiry)) {
      console.warn('Access token has expired');
      return null;
    }
    
    return token;
  }

  // Refresh access token using refresh token
  async refreshAccessToken(clientSecret: string): Promise<any> {
    const refreshToken = localStorage.getItem('google_refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const tokenEndpoint = 'https://oauth2.googleapis.com/token';
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });

    try {
      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      const tokens = await response.json();
      this.storeTokens(tokens);
      return tokens;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  // Clear stored tokens
  clearTokens(): void {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_refresh_token');
    localStorage.removeItem('google_token_expiry');
  }
}

// Utility function to create auth helper instance
export const createGoogleAuthHelper = (clientId?: string): GoogleAuthHelper | null => {
  const id = clientId || import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!id) {
    console.warn('Google Client ID not configured');
    return null;
  }
  return new GoogleAuthHelper(id);
};