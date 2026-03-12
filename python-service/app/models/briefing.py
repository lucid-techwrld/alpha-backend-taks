from datetime import datetime
from sqlalchemy import DateTime, String, Text, Boolean, Integer, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Briefing(Base):
    __tablename__ = "briefings"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    ticker: Mapped[str] = mapped_column(String(20), nullable=False)
    sector: Mapped[str | None] = mapped_column(String(255))
    analyst_name: Mapped[str | None] = mapped_column(String(255))

    summary: Mapped[str] = mapped_column(Text, nullable=False)
    recommendation: Mapped[str] = mapped_column(Text, nullable=False)

    generated: Mapped[bool] = mapped_column(Boolean, default=False)
    generated_html: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    points = relationship("BriefingPoint", back_populates="briefing")
    metrics = relationship("BriefingMetric", back_populates="briefing")


class BriefingPoint(Base):
    __tablename__ = "briefing_points"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    briefing_id: Mapped[int] = mapped_column(
        ForeignKey("briefings.id", ondelete="CASCADE")
    )

    type: Mapped[str] = mapped_column(String(20))
    content: Mapped[str] = mapped_column(Text)
    display_order: Mapped[int] = mapped_column(Integer)

    briefing = relationship("Briefing", back_populates="points")


class BriefingMetric(Base):
    __tablename__ = "briefing_metrics"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    briefing_id: Mapped[int] = mapped_column(
        ForeignKey("briefings.id", ondelete="CASCADE")
    )

    name: Mapped[str] = mapped_column(String(255))
    value: Mapped[str] = mapped_column(String(255))

    briefing = relationship("Briefing", back_populates="metrics")