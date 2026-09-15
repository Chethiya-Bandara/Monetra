# Monetra

Monetra is a full-stack personal-finance tracker. Each authenticated user can record income and expenses, manage recurring transactions, view financial analytics, and ask an AI assistant for general spending observations.

> Monetra is for personal finance tracking only; it does not provide professional financial, investment, or legal advice.

## Features

- Supabase-backed account registration and sign-in.
- Create, list, and delete dated income and expense transactions.
- Create, view, edit, and delete daily, weekly, or monthly recurring transactions with optional end dates.
- Dashboard totals for balance, income, expenses, transaction history, and recurring activity.
- Analytics for savings rate, average expense, seven-day cash flow, monthly trends, and expense categories.
- Gemini-powered financial guide for questions about the user’s transaction history.
- Responsive dark mode and an in-app privacy policy.

## Architecture

| Layer | Implementation |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend | FastAPI, Pydantic, SlowAPI |
| Authentication and database | Supabase Auth and Postgres |
| Charts | Recharts |
| AI insights | Google Gemini (`gemini-2.5-flash`) |

The web client sends a Supabase bearer token to the FastAPI service. The API verifies it with Supabase and scopes data requests to the authenticated user ID.

## Security implementations

### Authentication and data isolation

- Protected API routes require a bearer token and use Supabase `get_user` verification. Invalid or missing authentication receives `401`.
- Transaction and recurring-transaction reads are filtered by the authenticated `user_id`. Updates and deletes filter by both the record ID and that user ID.
- Passwords are handled by Supabase Auth; Monetra does not implement password storage.

### Validation and abuse resistance

- Pydantic schemas reject unexpected fields (`extra="forbid"`).
- Amounts must be greater than zero and no more than 10,000,000; descriptions, categories, passwords, names, and messages have length limits.
- Transaction type and recurrence frequency only accept explicit allowed values.
- Recurring date ranges prevent an end date before the start date.
- Rate limits protect the API, including registration (3/minute), login (5/minute), transaction changes (30/minute), and AI chat (10/minute) per client IP.
- CORS permits one configured frontend origin, supplied through `FRONTEND_ORIGIN`.
- Database and AI failures return generic client-facing errors; AI failures are logged server-side.

### AI safety and data minimization

- The AI endpoint requires authentication and only loads the signed-in user's transactions.
- At most the latest 100 transactions are included in an AI request; descriptions are truncated to 200 characters.
- The server explicitly treats transaction content and questions as untrusted data and instructs the model not to follow embedded instructions or disclose its prompt.
- AI responses use a restricted custom Markdown renderer. Links are limited to `http` and `https` and use `rel="noreferrer"`.

## Production security checklist

Application-level ownership checks should be backed by database policies. Enable Supabase Row Level Security (RLS) for both tables before production:

```sql
alter table public.transactions enable row level security;
alter table public.recurring_transactions enable row level security;

create policy "Users manage their transactions"
on public.transactions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage their recurring transactions"
on public.recurring_transactions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

- Keep `SUPABASE_KEY` and `GOOGLE_API_KEY` server-side. Never expose them in the browser. Prefer a Supabase anon key for a client-facing data API; do not use a service-role key unless the server-side authorization model is deliberately designed for it.
- Use HTTPS in production and configure exact production values for `FRONTEND_ORIGIN` and `NEXT_PUBLIC_API_URL`.
- The current frontend stores its bearer token in `localStorage`. Enforce a strong Content Security Policy and prevent XSS; for higher assurance, consider secure, `HttpOnly`, `SameSite` cookies.
- Chat sends the user's question plus relevant transaction details to Gemini. Do not enter credentials, card numbers, or similarly sensitive data in descriptions or chat messages.

## Getting started

### Prerequisites

- Node.js 20+
- Python 3.9+
- A Supabase project
- A Google AI Studio API key to enable the optional AI guide

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn main:app --reload
```

Set `backend/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-server-only-supabase-key
GOOGLE_API_KEY=your-gemini-api-key
FRONTEND_ORIGIN=http://localhost:3000
```

The API starts at `http://localhost:8000`.

### Frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

Use this local `frontend/.env.local` value:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Open `http://localhost:3000` and create an account.

## API overview

All endpoints below except registration and login require `Authorization: Bearer <Supabase access token>`.

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/register` | Create an account |
| `POST` | `/login` | Authenticate and return an access token |
| `GET` | `/auth/session` | Validate the current session |
| `GET`, `POST` | `/transactions` | List or create one-time transactions |
| `DELETE` | `/transactions/{id}` | Delete an owned transaction |
| `GET`, `POST` | `/recurring-transactions` | List or create recurring transactions |
| `PUT`, `DELETE` | `/recurring-transactions/{id}` | Update or delete an owned recurring transaction |
| `POST` | `/chat` | Request AI spending insights |

## Environment variables

| Variable | Used by | Description |
| --- | --- | --- |
| `SUPABASE_URL` | Backend | Supabase project URL |
| `SUPABASE_KEY` | Backend | Server-side Supabase key |
| `GOOGLE_API_KEY` | Backend | Gemini API key |
| `FRONTEND_ORIGIN` | Backend | Exact permitted frontend origin |
| `NEXT_PUBLIC_API_URL` | Frontend | FastAPI service URL |

## Repository layout

```text
backend/             FastAPI application, auth, Supabase integration, schemas
frontend/app/        Landing, authentication, dashboard, charts, and privacy pages
frontend/components/ Forms, dashboard, transaction, chat, theme, and auth UI
frontend/lib/        Shared API URL helper
```

## Verification

```powershell
cd frontend
npm run lint
npm run build
```

Start the backend with Uvicorn and exercise protected endpoints using a valid Supabase token.
