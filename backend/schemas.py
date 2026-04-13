from pydantic import BaseModel
from datetime import datetime
from typing import Literal

class TransactionBase(BaseModel):
    text: str
    amount: float
    type: Literal['income', 'expense']
    date: str

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: str
    user_id: str
    date: datetime

    class Config:
        from_attributes = True