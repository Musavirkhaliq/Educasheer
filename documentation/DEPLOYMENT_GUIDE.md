# Deployment Guide for Educasheer

This guide will help you properly deploy your changes to the production server at learn.sukoonsphere.org.

## Local Development

When developing locally:

1. Make your changes to the codebase
2. Test locally using `npm run dev` in both client and backend directories
3. Commit your changes to Git
4. Push your changes to the remote repository

## Deploying to Production

### Option 1: Deploy from the Server

1. SSH into your server:
   ```bash
   ssh user@your-server-ip
   ```

2. Navigate to your project directory:
   ```bash
   cd /path/to/educasheer
   ```

3. Run the deployment script:
   ```bash
   ./deploy.sh
   ```

4. Check the deployment status:
   ```bash
   ./check-deployment.sh
   ```

### Option 2: Deploy from CI/CD (Future Enhancement)

For a more automated approach, consider setting up a CI/CD pipeline with GitHub Actions or similar tools.

## Troubleshooting Common Issues

### Changes Not Appearing After Deployment

1. **Clear Browser Cache**: Try hard-refreshing your browser (Ctrl+F5 or Cmd+Shift+R)

2. **Check Deployment Logs**: Look for any errors in the deployment process
   ```bash
   ./check-deployment.sh
   ```

3. **Verify File Permissions**: Ensure Nginx has permission to read the files
   ```bash
   sudo chown -R www-data:www-data /var/www/educasheer/client
   ```

4. **Check Nginx Configuration**: Make sure Nginx is properly configured
   ```bash
   sudo nginx -t
   ```

5. **Restart Services**: Try restarting both PM2 and Nginx
   ```bash
   pm2 restart all
   sudo systemctl restart nginx
   ```

### API Errors

1. **Check Backend Logs**: Look for errors in the backend logs
   ```bash
   pm2 logs educasheer-backend
   ```

2. **Verify Environment Variables**: Make sure the environment variables are correctly set
   ```bash
   pm2 env educasheer-backend
   ```

3. **Check CORS Settings**: Ensure CORS is properly configured for the production domain

## Maintenance

### Updating Dependencies

Periodically update your dependencies to keep the application secure:

```bash
npm update
cd client && npm update && cd ..
cd backend && npm update && cd ..
```

### Monitoring

Monitor your application's performance and errors:

```bash
pm2 monit
```

### Backup

Regularly backup your database:

```bash
mongodump --db educasheer --out /path/to/backup/directory
```

## Contact

If you encounter persistent issues, contact the development team for assistance.
