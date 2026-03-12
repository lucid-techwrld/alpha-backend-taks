from pydantic import BaseModel, field_validator
from typing import List, Optional


class Metric(BaseModel):
    name: str
    value: str


class BriefingCreate(BaseModel):
    companyName: str
    ticker: str
    sector: Optional[str] = None
    analystName: Optional[str] = None
    summary: str
    recommendation: str
    keyPoints: List[str]
    risks: List[str]
    metrics: Optional[List[Metric]] = None

    @field_validator("ticker")
    @classmethod
    def normalize_ticker(cls, v: str) -> str:
        return v.upper()

    @field_validator("keyPoints")
    @classmethod
    def validate_key_points(cls, v):
        if len(v) < 2:
            raise ValueError("At least 2 key points required")
        return v

    @field_validator("risks")
    @classmethod
    def validate_risks(cls, v):
        if len(v) < 1:
            raise ValueError("At least 1 risk required")
        return v


class BriefingRead(BaseModel):
    id: int
    company_name: str
    ticker: str
    summary: str
    recommendation: str