# Google OAuth Error Fix - redirect_uri_mismatch

## Problem
You're getting "Error 400: redirect_uri_mismatch" when trying to sign in with Google on educasheer.in.

## Root Cause
Your Google OAuth client (ID: `258701645513-dicfbobfqmqbh1of6bcgfvb8cv3clcq2.apps.googleusercontent.com`) is not configured to accept requests from the `educasheer.in` domain.

## Solution Steps

### 1. Update Google Cloud Console (CRITICAL - Do this first!)

1. **Go to Google Cloud Console**:
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to "APIs & Services" > "Credentials"

2. **Find and Edit Your OAuth Client**:
   - Look for the OAuth Client ID: `258701645513-dicfbobfqmqbh1of6bcgfvb8cv3clcq2.apps.googleusercontent.com`
   - Click on it to edit

3. **Add Authorized JavaScript Origins**:
   Add these domains to the "Authorized JavaScript origins" section:
   ```
   https://educasheer.in
   https://www.educasheer.in
   http://localhost:5174
   https://learn.sukoonsphere.org
   ```

4. **IMPORTANT: Also Add Authorized Redirect URIs** (even for implicit flow):
   Add these to the "Authorized redirect URIs" section:
   ```
   https://educasheer.in
   https://www.educasheer.in
   http://localhost:5174
   https://learn.sukoonsphere.org
   ```

   **Note**: Recent versions of @react-oauth/google (v0.12.1) may require redirect URIs even for implicit flow.

5. **Save Changes**:
   - Click "Save"
   - Wait 5-10 minutes for changes to propagate

### 2. Verify Your Configuration

Your current setup:
- **Google Client ID**: `258701645513-dicfbobfqmqbh1of6bcgfvb8cv3clcq2.apps.googleusercontent.com`
- **Production Domain**: `educasheer.in`
- **API Endpoint**: `https://educasheer.in/api/v1`

### 3. Test the Fix

1. **Clear Browser Cache**: Clear your browser cache or use incognito mode
2. **Try OAuth Again**: Go to `https://educasheer.in` and try signing in with Google
3. **Check Console**: If it still fails, check browser developer console for additional errors

## Files Updated

I've updated the following files in your codebase:

1. **`client/GOOGLE_OAUTH_SETUP.md`**: Updated documentation with correct domains
2. **`client/.env.local.example`**: Updated example with all required domains
3. **`client/.env`**: Updated API URL to use production endpoint

## Verification Checklist

- [ ] Added `https://educasheer.in` to Google OAuth authorized JavaScript origins
- [ ] Added `https://www.educasheer.in` to Google OAuth authorized JavaScript origins
- [ ] Added `https://educasheer.in` to Google OAuth authorized redirect URIs
- [ ] Added `https://www.educasheer.in` to Google OAuth authorized redirect URIs
- [ ] Saved changes in Google Cloud Console
- [ ] Waited 5-10 minutes for propagation
- [ ] Cleared browser cache
- [ ] Tested OAuth login on educasheer.in
- [ ] If still failing, tried switching to 'auth-code' flow

## Alternative Solution: Switch to Authorization Code Flow

If the implicit flow continues to cause issues, try switching to authorization code flow:

1. **Update Login.jsx** - Change the flow type:
   ```javascript
   const handleGoogleLogin = useGoogleLogin({
     onSuccess: async (tokenResponse) => {
       // ... existing code ...
     },
     onError: (error) => {
       // ... existing error handling ...
     },
     flow: 'auth-code' // Change from 'implicit' to 'auth-code'
   });
   ```

2. **Update Signup.jsx** similarly if needed.

## If Still Not Working

If you continue to have issues:

1. **Double-check the Client ID**: Make sure the Client ID in Google Cloud Console matches exactly: `258701645513-dicfbobfqmqbh1of6bcgfvb8cv3clcq2.apps.googleusercontent.com`

2. **Check OAuth Consent Screen**: Make sure your OAuth consent screen is properly configured

3. **Verify Domain Ownership**: For production domains, you might need to verify domain ownership

4. **Check for Typos**: Ensure there are no typos in the authorized JavaScript origins AND redirect URIs

5. **Try Incognito Mode**: Test in an incognito/private browser window to rule out cache issues

## Next Steps

After fixing the OAuth configuration, you should be able to sign in with Google successfully on educasheer.in.
