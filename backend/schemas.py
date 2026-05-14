from pydantic import BaseModel
from datetime import datetime, date
from typing import Literal, Optional

class TransactionBase(BaseModel):
    text: str
    amount: float
    type: Literal['income', 'expense']
    date: str
    category: str

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: str
    user_id: str
    date: datetime

    class Config:
        from_attributes = True


class RecurringTransactionBase(BaseModel):
    amount: float
    type: Literal['income', 'expense']
    frequency: Literal['daily', 'weekly', 'monthly']
    category: str = "General"
    description: Optional[str] = None
    start_date: str
    end_date: Optional[str] = None

class RecurringTransaction(RecurringTransactionBase):
    id: str
    user_id: str