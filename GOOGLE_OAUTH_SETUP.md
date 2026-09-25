# Neon Auth Setup Instructions

## Step 1: Get Your Neon Auth URL

Your Neon Auth URL is available in your Neon console:

1. Go to [Neon Console](https://console.neon.tech/)
2. Select your project (e.g., "Omnium")
3. Go to **Settings** → **Auth**
4. Copy the **Auth URL** - it looks like:
   ```
   https://ep-xyz.neonauth.c-2.us-east-2.aws.neon.build/neondb/auth
   ```

## Step 2: Enable Google OAuth in Neon

Since you're using Neon Auth, Google OAuth is configured directly in the Neon console:

1. In your Neon project, go to **Settings** → **Auth**
2. Under **OAuth providers**, you should see **Google** is already available
3. Click on **Google** to configure it if needed
4. Neon Auth handles the OAuth flow automatically

## Step 3: Update Your Environment Variables

### For Local Development:
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Neon Auth URL:
   ```env
   NEON_AUTH_URL=https://ep-xyz.neonauth.c-2.us-east-2.aws.neon.build/neondb/auth
   NODE_ENV=development
   PORT=3000
   ```

### For Render Deployment:
1. Go to your Render web service
2. Click "Environment" tab
3. Add these environment variables:
   - `NEON_AUTH_URL`: Your Neon Auth URL from the console
   - `NODE_ENV`: `production`

## Step 4: Test Authentication

### Local Testing:
1. Start your server: `npm start`
2. Go to `http://localhost:3000`
3. Test username/password registration
4. Test Google OAuth registration
5. Test login with both methods

### Production Testing:
1. Deploy to Render
2. Access your app at the Render URL
3. Test all authentication flows

## Important Notes:

- **Neon Auth Handles OAuth**: Unlike custom Google OAuth, Neon Auth manages the OAuth providers and callbacks
- **No Google Cloud Console Needed**: You don't need to set up Google Cloud Console - Neon handles this
- **Automatic Session Management**: Neon Auth manages sessions automatically with secure cookies
- **User Data Storage**: All user data is stored in your Neon database in the `neon_auth` schema

## Authentication Flow:

1. **Username/Password Registration**: Users can register with email/password directly
2. **Google OAuth Registration**: Users can sign up with Google OAuth
3. **Username Setup**: After Google OAuth, users can set their username
4. **Login**: Users can login with either method
5. **Session Management**: Neon Auth handles secure sessions automatically

## Troubleshooting:

### Authentication Not Working:
- Ensure your `NEON_AUTH_URL` is correct
- Check that Neon Auth is enabled in your Neon console
- Verify Google OAuth is enabled in Neon Auth settings

### Session Issues:
- Neon Auth uses HTTP-only cookies automatically
- Ensure your app is served over HTTPS in production
- Check browser console for cookie-related errors

### Google OAuth Issues:
- Since Neon Auth manages Google OAuth, check Neon console settings
- Ensure the callback URL matches your app's domain
- Verify Google OAuth is enabled in Neon Auth settings

## Security Benefits of Neon Auth:

1. **Managed Security**: Neon handles OAuth security best practices
2. **Secure Sessions**: HTTP-only, secure cookies automatically
3. **No Secret Management**: Neon manages OAuth secrets
4. **Built-in Security**: Automatic rate limiting, CSRF protection, etc.
5. **Database Integration**: User data lives directly in your Neon database

That's it! Your authentication system is now powered by Neon Auth with both username/password and Google OAuth support.