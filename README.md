# Largence

**AI-Powered Legal Document Platform for African Enterprise**

Largence is an enterprise-grade platform that uses AI to generate legally compliant documents in seconds. Built with African jurisdictions in mind — Nigeria, South Africa, Kenya, Ghana — we understand the local legal requirements.

![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC)

## Features

### AI Document Generation
Generate jurisdiction-specific legal documents in seconds using GPT-4. Supports:
- Employment Agreements
- Non-Disclosure Agreements (NDAs)
- Service Agreements
- Partnership Agreements
- And more...

### Compliance Checking
Automated compliance checking against local regulations:
- GDPR (EU)
- NDPR (Nigeria)
- SA Employment Equity Act
- 50+ compliance rules

### Agentic Compliance
AI that doesn't just tell you what's wrong — it fixes it for you. Watch in real-time as AI rewrites your document to be fully compliant.

### Team Collaboration
- Organization management
- Role-based access control
- Full audit trails
- Team invitations

### Rich Document Editor
- Full rich text formatting with TipTap
- Multiple heading levels, lists, tables
- Real-time editing
- Dark mode support
- Export to Word/PDF

### Subscription Billing
- Stripe integration
- Multiple pricing tiers
- Usage-based limits
- Customer portal

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Payments**: Stripe
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI + shadcn/ui
- **Editor**: TipTap
- **Monorepo**: Turborepo + pnpm

## Project Structure

```
largence/
├── apps/
│   ├── app/          # Main application (dashboard, editor, API)
│   └── web/          # Marketing website
├── packages/
│   ├── ui/           # Shared UI components
│   └── fonts/        # Custom fonts (PolySans, General Sans, Satoshi)
├── turbo.json        # Turborepo configuration
└── package.json      # Root package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+
- PostgreSQL database
- Clerk account
- OpenAI API key
- Stripe account (optional, for billing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/geraldokereke/largence.git
   cd largence
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp apps/app/.env.example apps/app/.env.local
   ```

   Required environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://..."

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
   CLERK_SECRET_KEY=sk_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/signup

   # OpenAI
   OPENAI_API_KEY=sk-...

   # Stripe (optional)
   STRIPE_SECRET_KEY=sk_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_STARTER_PRICE_ID=price_...
   STRIPE_PROFESSIONAL_PRICE_ID=price_...
   ```

4. **Set up the database**
   ```bash
   pnpm app prisma:generate
   pnpm app prisma:migrate
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

   - App: http://localhost:3000
   - Web: http://localhost:3001

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm dev:app` | Start only the main app |
| `pnpm dev:web` | Start only the marketing site |
| `pnpm build` | Build all apps for production |
| `pnpm lint` | Run ESLint on all apps |
| `pnpm format` | Format code with Prettier |
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm clean` | Clean all build artifacts |
| `pnpm app prisma:studio` | Open Prisma Studio |

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/documents` | GET, POST | List/create documents |
| `/api/documents/[id]` | GET, PATCH, DELETE | Manage document |
| `/api/documents/[id]/compliance` | POST, GET | Run compliance check |
| `/api/documents/[id]/agentic-compliance` | POST | Run AI auto-fix |
| `/api/documents/generate` | POST | Generate new document |
| `/api/notifications` | GET, PATCH | Manage notifications |
| `/api/billing` | GET | Get billing status |
| `/api/billing/portal` | POST | Get Stripe portal URL |

## Pricing Tiers

| Plan | Price | Documents | Team Members |
|------|-------|-----------|--------------|
| Free | $0 | 2 | 1 |
| Starter | $299/mo | 100 | 5 |
| Professional | $799/mo | Unlimited | 20 |
| Enterprise | Custom | Unlimited | Unlimited |

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy

### Docker

```bash
docker build -t largence .
docker run -p 3000:3000 largence
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Proprietary - All rights reserved.

## Support

- Email: support@largence.com

