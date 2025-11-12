// Load environment variables for server-side code
import 'dotenv/config'

import { getGoogleAuthUrl } from '../../../../src/server/auth/google-oauth'

/**
 * Google OAuth authorization endpoint
 * Redirects user to Google's OAuth consent screen
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const redirectUrl = searchParams.get('redirect') // Optional: where to redirect after auth

  // Create state parameter with redirect URL if provided
  const state = redirectUrl ? encodeURIComponent(redirectUrl) : undefined

  // Get Google OAuth URL
  const authUrl = getGoogleAuthUrl(state)

  // Redirect to Google
  return Response.redirect(authUrl, 302)
}

