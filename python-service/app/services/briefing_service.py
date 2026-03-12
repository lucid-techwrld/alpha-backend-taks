from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.briefing import Briefing, BriefingPoint, BriefingMetric
from app.schemas.briefing_schema import BriefingCreate


def create_briefing(db: Session, payload: BriefingCreate) -> Briefing:

    briefing = Briefing(
        company_name=payload.companyName,
        ticker=payload.ticker,
        sector=payload.sector,
        analyst_name=payload.analystName,
        summary=payload.summary,
        recommendation=payload.recommendation,
    )

    db.add(briefing)
    db.flush()

    for index, point in enumerate(payload.keyPoints):
        db.add(
            BriefingPoint(
                briefing_id=briefing.id,
                type="key_point",
                content=point,
                display_order=index,
            )
        )

    for index, risk in enumerate(payload.risks):
        db.add(
            BriefingPoint(
                briefing_id=briefing.id,
                type="risk",
                content=risk,
                display_order=index,
            )
        )

    if payload.metrics:
        for metric in payload.metrics:
            db.add(
                BriefingMetric(
                    briefing_id=briefing.id,
                    name=metric.name,
                    value=metric.value,
                )
            )

    db.commit()
    db.refresh(briefing)

    return briefing


def get_briefing(db: Session, briefing_id: int) -> Briefing | None:
    query = select(Briefing).where(Briefing.id == briefing_id)
    return db.scalar(query)