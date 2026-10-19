"""Offline API tests. Supabase and Gemini are replaced; no real data is touched."""
import os
from types import SimpleNamespace

# Set dummy configuration before importing application modules, even if a .env exists.
os.environ["SUPABASE_URL"] = "https://example.supabase.co"
os.environ["SUPABASE_KEY"] = "test-key"
os.environ["GOOGLE_API_KEY"] = "test-key"

import pytest
from fastapi.testclient import TestClient
from fastapi.security import HTTPAuthorizationCredentials

import auth
import main

USER = "user-one"
OTHER = "user-two"
TODAY = "2026-10-19"
TRANSACTION = {"text": "Lunch", "amount": 250, "type": "expense", "date": TODAY, "category": "Food"}
PLAN = {"amount": 1200, "type": "expense", "frequency": "monthly", "category": "Food", "description": "Subscription", "start_date": TODAY, "end_date": None}


class FakeDB:
    def __init__(self):
        self.tables = {"transactions": [], "recurring_transactions": [], "category_budgets": []}
        self.calls = []
        self.fail_rpc = None
        self.fail_table = None
        self.counter = 0

    def table(self, name):
        return Query(self, name)

    def rpc(self, name, params):
        self.calls.append(("rpc", name, params))
        if name == self.fail_rpc:
            raise RuntimeError("secret database detail")
        if name == "create_recurring_with_transaction":
            plan = {"id": "new-plan", "user_id": USER, "amount": params["p_amount"]}
            entry = {"id": "new-entry", "user_id": USER, "amount": params["p_amount"]}
            return SimpleNamespace(execute=lambda: SimpleNamespace(data={"recurring": plan, "transaction": entry}))
        return SimpleNamespace(execute=lambda: SimpleNamespace(data=None))


class Query:
    def __init__(self, db, table):
        self.db, self.name = db, table
        self.action, self.filters, self.payload = "select", {}, None

    def select(self, *args): return self
    def order(self, *args, **kwargs): return self
    def eq(self, key, value):
        self.filters[key] = value
        return self
    def insert(self, payload):
        self.action, self.payload = "insert", payload
        return self
    def upsert(self, payload, on_conflict):
        assert on_conflict == "user_id,category"
        self.action, self.payload = "upsert", payload
        return self
    def update(self, payload):
        self.action, self.payload = "update", payload
        return self
    def delete(self):
        self.action = "delete"
        return self

    def execute(self):
        self.db.calls.append((self.action, self.name, dict(self.filters)))
        if self.name == self.db.fail_table:
            raise RuntimeError("secret database detail")
        rows = self.db.tables[self.name]
        matches = [r for r in rows if all(r.get(k) == v for k, v in self.filters.items())]
        if self.action == "insert":
            self.db.counter += 1
            row = {"id": f"new-{self.db.counter}", **self.payload}
            rows.append(row)
            matches = [row]
        elif self.action == "upsert":
            row = next((r for r in rows if r["user_id"] == self.payload["user_id"] and r["category"] == self.payload["category"]), None)
            if row is None:
                self.db.counter += 1
                row = {"id": f"new-{self.db.counter}", **self.payload}
                rows.append(row)
            else:
                row.update(self.payload)
            matches = [row]
        elif self.action == "update":
            for row in matches: row.update(self.payload)
        elif self.action == "delete":
            self.db.tables[self.name] = [r for r in rows if r not in matches]
        return SimpleNamespace(data=[dict(r) for r in matches])


@pytest.fixture
def db(): return FakeDB()


@pytest.fixture
def client(db, monkeypatch):
    # Rate-limiting has its own tests; disable shared counters for other cases.
    monkeypatch.setattr(main.limiter, "enabled", False)
    main.app.dependency_overrides[auth.get_current_user] = lambda: USER
    main.app.dependency_overrides[auth.get_authenticated_supabase_client] = lambda: db
    with TestClient(main.app) as test_client:
        yield test_client
    main.app.dependency_overrides.clear()


def test_protected_routes_reject_missing_bearer_token(monkeypatch):
    monkeypatch.setattr(main.limiter, "enabled", False)
    main.app.dependency_overrides.clear()
    with TestClient(main.app) as client:
        for path in ("/auth/session", "/transactions", "/budgets", "/recurring-transactions"):
            assert client.get(path).status_code in (401, 403)


def test_invalid_token_is_rejected(monkeypatch):
    monkeypatch.setattr(auth, "supabase", SimpleNamespace(auth=SimpleNamespace(get_user=lambda token: (_ for _ in ()).throw(ValueError("bad token")))))
    with pytest.raises(Exception) as error:
        auth.get_current_user(HTTPAuthorizationCredentials(scheme="Bearer", credentials="invalid"))
    assert error.value.status_code == 401


def test_session_returns_authenticated_user(client):
    assert client.get("/auth/session").json() == {"user_id": USER}


def test_transactions_scoped_and_sync_before_read(client, db):
    db.tables["transactions"] = [{"id": "mine", "user_id": USER}, {"id": "theirs", "user_id": OTHER}]
    response = client.get(f"/transactions?today={TODAY}")
    assert response.status_code == 200
    assert [row["id"] for row in response.json()] == ["mine"]
    assert db.calls[0] == ("rpc", "sync_recurring_transactions", {"p_through": TODAY})


def test_transaction_create_maps_description_and_owner(client, db):
    response = client.post("/transactions", json=TRANSACTION)
    assert response.status_code == 200
    assert response.json()["description"] == "Lunch"
    assert response.json()["user_id"] == USER
    assert response.json()["date"] == TODAY


@pytest.mark.parametrize("change", [
    {"amount": 0}, {"amount": -1}, {"amount": 10_000_001}, {"type": "transfer"},
    {"text": ""}, {"date": "not-a-date"}, {"category": ""}, {"user_id": OTHER},
])
def test_invalid_transactions_are_rejected(client, change):
    assert client.post("/transactions", json={**TRANSACTION, **change}).status_code == 422


def test_deleting_transaction_does_not_delete_other_users_data(client, db):
    db.tables["transactions"] = [{"id": "mine", "user_id": USER}, {"id": "theirs", "user_id": OTHER}]
    assert client.delete("/transactions/theirs").status_code == 200
    assert len(db.tables["transactions"]) == 2
    assert client.delete("/transactions/mine").status_code == 200
    assert [row["id"] for row in db.tables["transactions"]] == ["theirs"]


def test_budget_create_update_and_delete_are_user_scoped(client, db):
    db.tables["category_budgets"].append({"id": "other-budget", "user_id": OTHER, "category": "Food", "amount": 10})
    assert client.get("/budgets").json() == []
    assert client.put("/budgets", json={"category": "Food", "amount": 100}).status_code == 200
    result = client.put("/budgets", json={"category": "Food", "amount": 200}).json()
    assert result["amount"] == 200
    assert len(client.get("/budgets").json()) == 1
    assert client.delete("/budgets/other-budget").status_code == 404
    assert client.delete(f"/budgets/{result['id']}").status_code == 200
    assert db.tables["category_budgets"][0]["user_id"] == OTHER


@pytest.mark.parametrize("payload", [
    {"category": "Food", "amount": 0}, {"category": "Food", "amount": -2},
    {"category": "Food", "amount": 10_000_001}, {"category": "Unknown", "amount": 1},
    {"category": "Food", "amount": 1, "user_id": OTHER},
])
def test_invalid_budgets_are_rejected(client, payload):
    assert client.put("/budgets", json=payload).status_code == 422


def test_recurring_creation_uses_one_atomic_rpc(client, db):
    response = client.post("/recurring-transactions", json=PLAN)
    assert response.status_code == 200
    assert response.json()["recurring"]["id"] == "new-plan"
    assert response.json()["transaction"]["id"] == "new-entry"
    assert [call[0] for call in db.calls] == ["rpc"]
    assert db.calls[0][1] == "create_recurring_with_transaction"
    assert db.calls[0][2]["p_start_date"] == TODAY


@pytest.mark.parametrize("changes", [
    {"frequency": "yearly"}, {"amount": 0}, {"type": "transfer"},
    {"end_date": "2026-10-18"}, {"start_date": "not-a-date"}, {"user_id": OTHER},
])
def test_invalid_recurring_plans_are_rejected(client, changes):
    assert client.post("/recurring-transactions", json={**PLAN, **changes}).status_code == 422


def test_recurring_list_update_delete_and_ownership(client, db):
    db.tables["recurring_transactions"] = [
        {"id": "mine", "user_id": USER, **PLAN}, {"id": "theirs", "user_id": OTHER, **PLAN},
    ]
    assert [r["id"] for r in client.get("/recurring-transactions").json()] == ["mine"]
    assert client.put(f"/recurring-transactions/theirs?today={TODAY}", json=PLAN).status_code == 404
    db.calls.clear()
    result = client.put(f"/recurring-transactions/mine?today={TODAY}", json={**PLAN, "amount": 1500})
    assert result.status_code == 200 and result.json()["amount"] == 1500
    assert db.calls[0][1] == "sync_recurring_transactions"
    assert client.delete(f"/recurring-transactions/theirs?today={TODAY}").status_code == 404
    assert client.delete(f"/recurring-transactions/mine?today={TODAY}").status_code == 200
    assert db.tables["recurring_transactions"][0]["id"] == "theirs"


def test_sync_failure_returns_error_without_exposing_database_details(client, db):
    db.fail_rpc = "sync_recurring_transactions"
    response = client.get(f"/transactions?today={TODAY}")
    assert response.status_code == 500
    assert "secret database detail" not in response.text
    assert not any(call[0] == "table" for call in db.calls)


def test_recurring_save_failure_returns_error(client, db):
    db.fail_rpc = "create_recurring_with_transaction"
    response = client.post("/recurring-transactions", json=PLAN)
    assert response.status_code == 500
    assert "secret database detail" not in response.text


def test_chat_empty_history_does_not_call_model(client, monkeypatch):
    monkeypatch.setattr(main.model, "generate_content", lambda *args: pytest.fail("Model should not be called"))
    response = client.post("/chat", json={"message": "How am I doing?"})
    assert response.status_code == 200 and "don't see any transactions" in response.json()["reply"]


def test_chat_only_uses_owned_data_and_truncates_description(client, db, monkeypatch):
    db.tables["transactions"] = [
        {"user_id": USER, "amount": 10, "category": "Food", "type": "expense", "date": TODAY, "description": "x" * 250},
        {"user_id": OTHER, "amount": 500, "category": "Food", "type": "expense", "date": TODAY, "description": "OTHER_USERS_SECRET"},
    ]
    prompts = []
    monkeypatch.setattr(main.model, "generate_content", lambda prompt: (prompts.append(prompt), SimpleNamespace(text="A helpful reply"))[1])
    response = client.post("/chat", json={"message": "Summarize"})
    assert response.json()["reply"] == "A helpful reply"
    assert "OTHER_USERS_SECRET" not in prompts[0]
    assert "x" * 200 in prompts[0] and "x" * 201 not in prompts[0]


@pytest.mark.parametrize("message", ["", "x" * 1001])
def test_chat_rejects_invalid_messages(client, message):
    assert client.post("/chat", json={"message": message}).status_code == 422


def test_login_failure_returns_401(client, monkeypatch):
    monkeypatch.setattr(main, "auth_client", SimpleNamespace(auth=SimpleNamespace(sign_in_with_password=lambda *_: (_ for _ in ()).throw(ValueError("bad password")))))
    response = client.post("/login", json={"email": "user@example.com", "password": "wrong"})
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_registration_rejects_short_password(client):
    response = client.post("/register", json={"email": "user@example.com", "password": "short", "fullName": "Test"})
    assert response.status_code == 422


def test_login_success_returns_access_token(client, monkeypatch):
    session = SimpleNamespace(access_token="fake-token")
    monkeypatch.setattr(main, "auth_client", SimpleNamespace(auth=SimpleNamespace(sign_in_with_password=lambda *_: SimpleNamespace(session=session, user={"id": USER}))))
    response = client.post("/login", json={"email": "user@example.com", "password": "password"})
    assert response.status_code == 200
    assert response.json() == {"access_token": "fake-token", "token_type": "bearer", "user": {"id": USER}}


def test_login_rate_limit(monkeypatch):
    monkeypatch.setattr(main.limiter, "enabled", True)
    main.limiter.reset()
    monkeypatch.setattr(main, "auth_client", SimpleNamespace(auth=SimpleNamespace(sign_in_with_password=lambda *_: (_ for _ in ()).throw(ValueError("bad password")))))
    try:
        with TestClient(main.app) as client:
            codes = [client.post("/login", json={"email": "user@example.com", "password": "wrong"}).status_code for _ in range(6)]
        assert codes == [401, 401, 401, 401, 401, 429]
    finally:
        main.limiter.reset()
