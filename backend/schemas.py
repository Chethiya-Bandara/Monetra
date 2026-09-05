from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Literal, Optional

class TransactionBase(BaseModel):
    text: str = Field(min_length=1, max_length=200)
    amount: float = Field(gt=0, le=10_000_000)
    type: Literal["income", "expense"]
    date: str
    category: str = Field(min_length=1, max_length=50)

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