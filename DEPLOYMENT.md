# Deployment Guide

## Overview
This project uses a staging/production deployment workflow with Netlify:

- **Staging**: https://splendorous-taffy-cfab45.netlify.app/
- **Production**: Will be connected to your custom domain (everease.io)

## Branch Strategy

### Main Branch (Production)
- `main` branch deploys to production (custom domain)
- Only merge tested and approved changes from staging
- Automatic deployment on push to main

### Staging Branch
- `staging` branch deploys to staging URL
- All feature development should be merged here first
- Test thoroughly before promoting to production

## Setup Instructions

### 1. Create Staging Branch
```bash
# Create and switch to staging branch
git checkout -b staging
git push -u origin staging
```

### 2. Netlify Configuration

#### For Staging Site (Current):
1. Go to Netlify dashboard
2. Select your current site (splendorous-taffy-cfab45)
3. Go to Site settings > Build & deploy > Deploy contexts
4. Set branch deploys to "Deploy only the production branch and branch deploys"
5. Set production branch to `staging`

#### For Production Site (New):
1. Create a new Netlify site
2. Connect to your GitHub repository
3. Set production branch to `main`
4. Configure custom domain (everease.io)

### 3. Environment Variables
Make sure both sites have the same environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `EMAIL_SERVICE`
- `RESEND_API_KEY`
- `FROM_EMAIL`
- `APP_URL` (different for staging vs production)

### 4. GitHub Secrets (Optional)
For automated deployments, add these secrets to your GitHub repository:
- `NETLIFY_AUTH_TOKEN`: Your Netlify personal access token
- `NETLIFY_STAGING_SITE_ID`: Site ID for staging
- `NETLIFY_PRODUCTION_SITE_ID`: Site ID for production

## Workflow

### Development Process
1. Create feature branch from `staging`
2. Develop and test locally
3. Create PR to `staging` branch
4. Test on staging environment
5. Create PR from `staging` to `main` for production release

### Manual Deployment Commands
```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

### Automatic Deployments
- Push to `staging` → Deploys to staging URL
- Push to `main` → Deploys to production domain
- Pull requests → Deploy previews

## Testing Strategy

### Staging Environment
- Full feature testing
- User acceptance testing
- Performance testing
- Security testing

### Production Environment
- Smoke tests after deployment
- Monitor for errors
- Rollback plan if issues arise

## Monitoring

### Staging
- Test all new features thoroughly
- Check email functionality
- Verify database connections
- Test user flows

### Production
- Monitor error rates
- Check performance metrics
- Verify SSL certificates
- Monitor uptime

## Rollback Strategy

### Quick Rollback
1. Revert the problematic commit
2. Push to main branch
3. Netlify will auto-deploy the reverted version

### Emergency Rollback
1. Go to Netlify dashboard
2. Find previous successful deployment
3. Click "Publish deploy" on the working version

## Security Considerations

- Environment variables are different between staging/production
- Staging should use test data, not production data
- API keys should be separate for each environment
- Monitor both environments for security issues

## Domain Configuration

### Staging
- Uses Netlify subdomain: splendorous-taffy-cfab45.netlify.app
- No custom domain needed

### Production
- Custom domain: everease.io
- SSL certificate automatically provisioned
- DNS configuration required

## Supabase Configuration

### Staging Database
- Use separate Supabase project for staging (recommended)
- Or use same project with different environment variables

### Production Database
- Dedicated Supabase project
- Regular backups
- Monitoring and alerts

## Best Practices

1. **Never deploy directly to production**
   - Always test on staging first
   - Use pull requests for code review

2. **Environment Parity**
   - Keep staging as close to production as possible
   - Use same Node.js version
   - Same dependencies and configurations

3. **Testing**
   - Run full test suite before deployment
   - Manual testing on staging
   - Automated testing in CI/CD

4. **Monitoring**
   - Set up alerts for both environments
   - Monitor performance and errors
   - Regular health checks

5. **Documentation**
   - Keep deployment docs updated
   - Document any manual steps
   - Maintain runbooks for common issues