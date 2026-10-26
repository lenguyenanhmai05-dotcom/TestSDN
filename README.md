# ExpenseTrail - SDN302 Practical Exam

**Student Code:** QE190151  
**Project:** ExpenseTrail  
**Framework:** Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL (Supabase)

## Features
- **Authentication:** Custom JWT-based auth via HttpOnly cookie `session_token`
- **CRUD Operations:** Add expenses, view expenses, toggle star, delete expense
- **Live Summary & Category Breakdown:** Real-time metrics and breakdown calculation
- **Filters:** Search keyword, category filter, starred filter, clear filters
- **Design:** Midnight Ocean Blue palette responsive at 375px and 1280px

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```env
DATABASE_URL="postgresql://postgres.ipuizzawiilvzggzgkhl:lenguyenanhmai0609@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.ipuizzawiilvzggzgkhl:lenguyenanhmai0609@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
AUTH_SECRET="sdn302_expensetrail_secret_qe190151_fall2026"
```

3. Run migrations:
```bash
npx prisma migrate deploy
```

4. Start development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.
