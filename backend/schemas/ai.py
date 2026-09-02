from pydantic import BaseModel
from typing import List, Literal
from datetime import datetime
import uuid

class ContributingFactor(BaseModel):
    factor: str
    value: float
    weight: float
    impact: str
    direction: Literal["positive", "negative", "neutral"]

class MineRiskScoreRead(BaseModel):
    mine_id: uuid.UUID
    score: float
    score_trend: Literal["improving", "worsening", "stable"]
    contributing_factors: List[ContributingFactor]
    model_version: str
    computed_at: datetime
