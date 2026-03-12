from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.briefing import Briefing, BriefingPoint, BriefingMetric
from app.services.report_formatter import ReportFormatter


formatter = ReportFormatter()


def generate_report(db: Session, briefing_id: int) -> str:

    briefing = db.get(Briefing, briefing_id)

    if briefing is None:
        raise ValueError("Briefing not found")

    points_query = (
        select(BriefingPoint)
        .where(BriefingPoint.briefing_id == briefing_id)
        .order_by(BriefingPoint.display_order)
    )

    metrics_query = (
        select(BriefingMetric)
        .where(BriefingMetric.briefing_id == briefing_id)
    )

    points = list(db.scalars(points_query).all())
    metrics_rows = list(db.scalars(metrics_query).all())

    metrics = [
        {"name": m.name, "value": m.value}
        for m in metrics_rows
    ]

    key_points = [p.content for p in points if p.type == "key_point"]
    risks = [p.content for p in points if p.type == "risk"]

    template = formatter._env.get_template("report.html")

    body = template.render(
        report_title=f"{briefing.company_name} Analyst Briefing",
        company_name=briefing.company_name,
        ticker=briefing.ticker,
        sector=briefing.sector,
        analyst_name=briefing.analyst_name,
        summary=briefing.summary,
        recommendation=briefing.recommendation,
        key_points=key_points,
        risks=risks,
        metrics=metrics,
    )

    html = formatter.render_base(
        title=f"{briefing.company_name} Briefing",
        body=body,
    )

    briefing.generated = True
    briefing.generated_html = html

    db.commit()
    db.refresh(briefing)

    return html


def get_generated_html(db: Session, briefing_id: int) -> str | None:

    briefing = db.get(Briefing, briefing_id)

    if briefing is None:
        return None

    return briefing.generated_html