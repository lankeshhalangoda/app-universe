# GitHub Setup for Vercel Deployment

## Step 1: Create GitHub Personal Access Token

1. Go to GitHub.com and sign in
2. Click your profile picture (top right) → **Settings**
3. Scroll down to **Developer settings** (left sidebar, at the bottom)
4. Click **Personal access tokens** → **Tokens (classic)**
5. Click **Generate new token** → **Generate new token (classic)**
6. Give it a name: `App Universe Vercel`
7. Set expiration (recommend: 90 days or No expiration)
8. Select scopes:
   - ✅ **repo** (Full control of private repositories)
     - This includes: repo:status, repo_deployment, public_repo, repo:invite, security_events
9. Click **Generate token**
10. **IMPORTANT**: Copy the token immediately (you won't see it again!)
   - It looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Step 2: Find Your Repository Name

Your repository name format is: `owner/repo-name`

For example:
- If your GitHub username is `johndoe` and repo is `app-universe`
- Then it's: `johndoe/app-universe`

## Step 3: Add Environment Variables in Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Select your project (`app-universe`)
3. Go to **Settings** (top menu)
4. Click **Environment Variables** (left sidebar)
5. Add these three variables:

   **Variable 1:**
   - Name: `GITHUB_TOKEN`
   - Value: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (the token you copied)
   - Environment: Select all (Production, Preview, Development)
   - Click **Save**

   **Variable 2:**
   - Name: `GITHUB_REPO`
   - Value: `yourusername/app-universe` (replace with your actual username/repo)
   - Environment: Select all (Production, Preview, Development)
   - Click **Save**

   **Variable 3 (Optional):**
   - Name: `GITHUB_BRANCH`
   - Value: `main` (or `master` if that's your default branch)
   - Environment: Select all (Production, Preview, Development)
   - Click **Save**

## Step 4: Redeploy

After adding the environment variables:
1. Go to **Deployments** tab
2. Click the three dots (⋯) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger a new deployment

## Verification

After redeploying, try creating/updating an app in the admin panel. It should now work!

## Troubleshooting

- **Token not working?** Make sure you selected the `repo` scope
- **Repository not found?** Check that `GITHUB_REPO` is in format `owner/repo` (no spaces)
- **Still getting errors?** Check Vercel function logs for detailed error messages

