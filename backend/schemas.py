from pydantic import BaseModel, ConfigDict, Field, model_validator
from datetime import date as Date
from typing import Literal, Optional

class TransactionBase(BaseModel):
    model_config = ConfigDict(extra="forbid")
    text: str = Field(min_length=1, max_length=200)
    amount: float = Field(gt=0, le=10_000_000)
    type: Literal["income", "expense"]
    date: Date
    category: str = Field(min_length=1, max_length=50)

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: str
    user_id: str
    date: Date

    class Config:
        from_attributes = True


class RecurringTransactionBase(BaseModel):
    model_config = ConfigDict(extra="forbid")
    amount: float = Field(gt=0, le=10_000_000)
    type: Literal['income', 'expense']
    frequency: Literal['daily', 'weekly', 'monthly']
    category: str = Field(default="General", min_length=1, max_length=50)
    description: Optional[str] = Field(default=None, min_length=1, max_length=200)
    start_date: Date
    end_date: Optional[Date] = None

    @model_validator(mode="after")
    def validate_date_range(self):
        if self.end_date and self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        return self

class RecurringTransaction(RecurringTransactionBase):
    id: str
    user_id: str
