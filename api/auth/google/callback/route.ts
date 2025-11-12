// Load environment variables for server-side code
import 'dotenv/config'

import { handleGoogleCallback } from '../../../../src/server/auth/google-oauth'
import { db } from '../../../../src/server/db'

/**
 * Google OAuth callback handler
 * This endpoint receives the authorization code from Google and exchanges it for user info
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const state = searchParams.get('state') // Can be used to store redirect URL

  // Handle OAuth errors
  if (error) {
    return new Response(
      JSON.stringify({ error: 'OAuth authentication failed', details: error }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  if (!code) {
    return new Response(
      JSON.stringify({ error: 'Authorization code not provided' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    // Exchange code for tokens and get/create user
    // Pass state as invitationToken if it's not a URL
    const invitationToken = state && !state.startsWith('http') ? state : undefined
    const { token, user, org, invitationAccepted } = await handleGoogleCallback(code, db, invitationToken)

    // Redirect to frontend callback page with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const redirectUrl = new URL(`${frontendUrl}/auth/callback`)
    
    // Pass token as query param
    redirectUrl.searchParams.set('token', token)
    
    // If invitation was accepted, pass that info
    if (invitationAccepted) {
      redirectUrl.searchParams.set('invitation_accepted', 'true')
      redirectUrl.searchParams.set('org_name', org.name)
    }

    // If state is a URL, use it for redirect
    if (state && state.startsWith('http')) {
      const stateRedirect = new URL(state)
      stateRedirect.searchParams.set('token', token)
      if (invitationAccepted) {
        stateRedirect.searchParams.set('invitation_accepted', 'true')
        stateRedirect.searchParams.set('org_name', org.name)
      }
      return Response.redirect(stateRedirect.toString(), 302)
    }

    return Response.redirect(redirectUrl.toString(), 302)
  } catch (err) {
    console.error('Google OAuth callback error:', err)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const errorUrl = new URL(frontendUrl)
    errorUrl.searchParams.set('error', 'authentication_failed')
    
    return Response.redirect(errorUrl.toString(), 302)
  }
}

