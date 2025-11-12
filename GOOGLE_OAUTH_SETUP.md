# Google OAuth Setup Guide

This guide will walk you through setting up Google OAuth for your application. **You don't need a business account** - just a free Google account!

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account (any personal account works)
3. Click on the project dropdown at the top
4. Click "New Project"
5. Enter a project name (e.g., "Kadabra Demo")
6. Click "Create"

## Step 2: Configure OAuth Consent Screen

1. In the Google Cloud Console, navigate to **APIs & Services** > **OAuth consent screen**
2. Select **External** (unless you're using Google Workspace)
3. Fill in the required information:
   - **App name**: Your app name (e.g., "Kadabra Demo")
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
4. Click "Save and Continue"
5. On the **Scopes** page, click "Add or Remove Scopes"
   - Add these scopes:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
   - Click "Update" then "Save and Continue"
6. On the **Test users** page (for testing):
   - Add your email address as a test user
   - Click "Save and Continue"
7. Review and click "Back to Dashboard"

## Step 3: Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**
4. If prompted, configure the OAuth consent screen (you can skip this if you already did it)
5. Select **"Web application"** as the application type
6. Give it a name (e.g., "Kadabra Demo Web Client")
7. Under **Authorized redirect URIs**, click **"+ ADD URI"** and add:
   - For local development: `http://localhost:5173/api/auth/google/callback`
   - For production: `https://yourdomain.com/api/auth/google/callback`
8. Click **"CREATE"**
9. **Important**: Copy the **Client ID** and **Client Secret** - you'll need these!

## Step 4: Set Environment Variables

Add these to your `.env` file:

```bash
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:5173/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-jwt-secret-key-minimum-32-characters
```

**For production**, update:
- `GOOGLE_REDIRECT_URI` to your production callback URL
- `FRONTEND_URL` to your production frontend URL

## Step 5: Test the Setup

### Option 1: Using the API Routes

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Initiate OAuth flow**:
   Visit: `http://localhost:5173/api/auth/google/authorize`
   
   This will redirect you to Google's OAuth consent screen.

3. **After authorization**:
   Google will redirect back to your callback URL with a token in the query string.

### Option 2: Using the tRPC Endpoint

```typescript
import { trpc } from './lib/trpc-client'

// Get the OAuth URL
const { data } = trpc.auth.getGoogleAuthUrl.useQuery({
  redirectUrl: 'http://localhost:5173/dashboard' // Optional
})

// Redirect user to data.authUrl
window.location.href = data.authUrl
```

## How It Works

1. **User clicks "Sign in with Google"** → Redirects to Google OAuth
2. **User authorizes** → Google redirects to `/api/auth/google/callback` with code
3. **Backend exchanges code** → Gets user info from Google
4. **Backend creates/updates user** → Creates user and org if new, or updates existing
5. **Backend generates JWT** → Returns token to frontend
6. **Frontend stores token** → Saves in localStorage or cookie
7. **All subsequent requests** → Include token in Authorization header

## Frontend Integration

### Login Button Component

```typescript
import { trpc } from '../lib/trpc-client'

function LoginButton() {
  const { data } = trpc.auth.getGoogleAuthUrl.useQuery()
  
  const handleLogin = () => {
    if (data?.authUrl) {
      window.location.href = data.authUrl
    }
  }
  
  return (
    <button onClick={handleLogin}>
      Sign in with Google
    </button>
  )
}
```

### Handle OAuth Callback

In your app's root or a callback page, check for the token in the URL:

```typescript
import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')
    
    if (error) {
      console.error('OAuth error:', error)
      navigate('/login?error=auth_failed')
      return
    }
    
    if (token) {
      // Store token
      localStorage.setItem('auth-token', token)
      
      // Clear URL params
      navigate('/dashboard', { replace: true })
    }
  }, [searchParams, navigate])
  
  return <div>Authenticating...</div>
}
```

### Update tRPC Client to Include Token

```typescript
// In your tRPC client setup
headers() {
  const token = localStorage.getItem('auth-token')
  return {
    authorization: token ? `Bearer ${token}` : undefined,
  }
}
```

## Troubleshooting

### "redirect_uri_mismatch" Error
- Make sure the redirect URI in your Google Cloud Console **exactly matches** the `GOOGLE_REDIRECT_URI` in your `.env`
- Check for trailing slashes, `http` vs `https`, and port numbers

### "access_denied" Error
- User may have denied access
- Check that your email is added as a test user (if app is in testing mode)

### Token Not Working
- Check that `JWT_SECRET` is set correctly
- Verify token is being sent in Authorization header
- Check browser console for errors

### User Not Created
- Check database connection
- Verify Google OAuth is returning user info
- Check server logs for errors

## Production Checklist

Before deploying to production:

- [ ] Update `GOOGLE_REDIRECT_URI` to production URL
- [ ] Update `FRONTEND_URL` to production URL
- [ ] Set a strong `JWT_SECRET` (32+ characters, random)
- [ ] Add production redirect URI in Google Cloud Console
- [ ] Submit OAuth consent screen for verification (if using sensitive scopes)
- [ ] Use HTTPS (required for secure cookies)
- [ ] Set secure cookie flags (HttpOnly, Secure, SameSite)

## Publishing Your App (Optional)

If you want to allow any Google user to sign in (not just test users):

1. Go to **OAuth consent screen** in Google Cloud Console
2. Click **"PUBLISH APP"**
3. Follow Google's verification process if required

**Note**: For most basic apps, you can stay in testing mode and just add test users. Publishing is only needed if you want unrestricted access.

## Security Notes

- Never commit your `GOOGLE_CLIENT_SECRET` or `JWT_SECRET` to version control
- Use environment variables for all secrets
- In production, use HTTPS to protect tokens in transit
- Consider implementing refresh tokens for better security
- Regularly rotate your JWT secret

## Need Help?

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- Check your server logs for detailed error messages

