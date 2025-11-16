# Database & AI Setup Guide

## Prerequisites

Before you can use the document generation features, you need to set up:

1. **PostgreSQL Database**
2. **OpenAI API Key**

## Step 1: Set up PostgreSQL Database

### Option A: Local PostgreSQL

1. Install PostgreSQL on your machine:
   - **macOS**: `brew install postgresql@16`
   - **Windows**: Download from https://www.postgresql.org/download/
   - **Linux**: `sudo apt-get install postgresql`

2. Start PostgreSQL service:
   ```bash
   # macOS
   brew services start postgresql@16
   
   # Linux
   sudo systemctl start postgresql
   ```

3. Create a database:
   ```bash
   createdb largence
   ```

4. Your connection string will be:
   ```
   postgresql://localhost:5432/largence
   ```

### Option B: Cloud PostgreSQL (Recommended)

**Neon (Free tier available)**
1. Go to https://neon.tech
2. Sign up for free
3. Create a new project
4. Copy the connection string

**Supabase (Free tier available)**
1. Go to https://supabase.com
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string (use "Connection pooling" for better performance)

**Vercel Postgres**
1. Go to your Vercel dashboard
2. Select your project
3. Go to Storage > Create Database > Postgres
4. Copy the `POSTGRES_PRISMA_URL` value

## Step 2: Get OpenAI API Key

1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)
6. **Important**: Store it securely, you won't see it again!

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your credentials to `.env.local`:
   ```bash
   # Database
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   
   # OpenAI
   OPENAI_API_KEY="sk-your-api-key-here"
   ```

## Step 4: Initialize Database

Run these commands to set up your database:

```bash
# Generate Prisma Client
pnpm prisma generate

# Create database tables
pnpm prisma migrate dev --name init

# (Optional) Open Prisma Studio to view your database
pnpm prisma studio
```

## Step 5: Verify Setup

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Navigate to `/documents`

3. Click "Generate Document" button

4. Complete the wizard and generate a document

5. If successful, you should see your document saved!

## Troubleshooting

### "PrismaClient is not generated"
- Run: `pnpm prisma generate`

### "Can't reach database server"
- Check your DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check firewall settings for cloud databases

### "OpenAI API Error"
- Verify OPENAI_API_KEY is correct
- Check you have credits in your OpenAI account
- Ensure no extra spaces in the key

### Database Migration Issues
- Try: `pnpm prisma migrate reset` (⚠️ This will delete all data!)
- Or: `pnpm prisma db push` for development

## Cost Considerations

**OpenAI Costs:**
- Model: gpt-4o-mini
- ~$0.015 per 1K input tokens
- ~$0.060 per 1K output tokens
- Average document: ~$0.05-0.10

**Database Costs:**
- Neon: Free tier includes 1 project, 3GB storage
- Supabase: Free tier includes 500MB database, 2GB bandwidth
- Vercel Postgres: Pay as you go, ~$0.10/GB

## Next Steps

Once setup is complete:
- Generate documents using the AI wizard
- Edit documents in the rich text editor
- Export documents as HTML
- Organize documents by status (Draft, Final, Archived)
- Share documents with your organization team

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure Prisma client is generated
4. Check database connection with `pnpm prisma studio`
