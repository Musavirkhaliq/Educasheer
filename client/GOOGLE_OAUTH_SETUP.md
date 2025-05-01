# Setting Up Google OAuth for Educasheer

This guide will help you set up Google OAuth for the Educasheer application.

## Creating a Google OAuth Client ID

1. **Go to the Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable the Google OAuth API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google OAuth2 API" and enable it

3. **Create OAuth Client ID**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application" as the application type
   - Add a name for your OAuth client (e.g., "Educasheer Web Client")

4. **Add Authorized JavaScript Origins**
   - Add the following JavaScript origins:
     - `http://localhost:5174` (for local development)
     - `https://learn.sukoonsphere.org` (for production)
   - You don't need to add redirect URIs as we're using the implicit flow

5. **Create the Client ID**
   - Click "Create"
   - You'll receive a Client ID and Client Secret
   - Copy the Client ID (you don't need the Client Secret for this implementation)

## Configuring the Application

1. **Create a .env.local file**
   - Copy the `.env.local.example` file to `.env.local`
   - Add your Google Client ID to the `VITE_GOOGLE_CLIENT_ID` variable

```
# .env.local
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

   **Note**: In Vite, environment variables must be prefixed with `VITE_` to be accessible in the client-side code.

2. **Restart the Development Server**
   - If you're running the development server, restart it to apply the changes

## Troubleshooting

If you encounter issues with Google OAuth:

1. **Check JavaScript Origins**
   - Make sure the JavaScript origins in your Google Cloud Console match exactly with the URLs you're using to access your application.

2. **Check for Typos**
   - Ensure there are no typos in your Client ID.

3. **Verify Project Status**
   - Make sure your Google Cloud project is active and not suspended.

4. **Enable OAuth API**
   - Ensure you've enabled the "Google OAuth2 API" in your Google Cloud project.

5. **Clear Browser Cache**
   - Sometimes browser caching can cause issues with OAuth. Try clearing your browser cache or using an incognito window.

6. **Check Console Errors**
   - Look for any additional error messages in your browser's developer console that might provide more details.

7. **Verify Domain Ownership**
   - For production domains, you might need to verify domain ownership in the Google Cloud Console.

8. **Check OAuth Consent Screen**
   - Make sure you've configured the OAuth consent screen properly.
