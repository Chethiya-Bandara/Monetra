# 🪙 Monetra

**Monetra** is a sleek, full-stack personal finance tracker designed to help users manage their income and expenses with real-time feedback and secure data persistence.

---

## 🚀 The Tech Stack

* **Frontend:** Next.js 15 (App Router), Tailwind CSS, Lucide React.
* **Backend:** FastAPI (Python), Pydantic validation.
* **Authentication:** Supabase Auth (JWT with ES256/HS256 support).
* **Database:** Supabase (Postgres): Row Level Security (RLS) disabled temporarily.

---

## ✨ Features

* **Secure Authentication:** User-specific data protected via JWT verification.
* **Transaction Management:** Add, track, and categorize expenses and income.
* **Real-time Totals:** Dynamic calculation of balances based on transaction history.
* **Robust Backend:** FastAPI middleware for CORS and Pydantic for strict data schema enforcement.
* **AI Insights:** Get insights from a personal AI chatbot into spending / income.
* **Spending/Income Visualization:** Charts displaying spending / income trends.
* **User Friendly UI:** UI that feels user friendly (Some components taken from https://reactbits.dev/).

---

## 🛠️ Installation & Setup

### 1. Prerequisites
* Node.js (v18+)
* Python (3.9+)
* Supabase Account

### 2. Backend Setup
1.  Navigate to the `backend` folder.
2.  Create a virtual environment:
    ```bash
    python -m venv .venv
    source .venv/bin/activate  # Windows: .venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Create a `.env` file:
    ```env
    SUPABASE_URL=your_supabase_url
    SUPABASE_KEY=your_service_role_key
    SUPABASE_JWT_SECRET=your_jwt_secret
    GOOGLE_API_KEY=your_gemini_api_key
    ```
5.  Start the server:
    ```bash
    uvicorn main:app --reload
    ```

### 3. Frontend Setup
1.  Navigate to the `frontend` folder.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

---

## 🔒 Security & Troubleshooting

### JWT Algorithm Support
The backend is configured to handle both **HS256** and **ES256** algorithms. This ensures compatibility with Supabase's evolving security standards, particularly when dealing with asymmetric keys.

### Row Level Security (RLS)
To allow the application to save data, the following PostgreSQL policy must be enabled in the Supabase SQL Editor:
```sql
-- Enable Insert for Users
CREATE POLICY "Allow individual insert" ON transactions 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable Select for Users
CREATE POLICY "Allow individual select" ON transactions 
FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
