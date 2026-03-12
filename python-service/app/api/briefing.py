from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.responses import HTMLResponse

from app.services.report_service import generate_report, get_generated_html
from app.db.session import get_db
from app.schemas.briefing_schema import BriefingCreate
from app.services.briefing_service import create_briefing, get_briefing

router = APIRouter(prefix="/briefings", tags=["briefings"])


@router.post("", status_code=status.HTTP_201_CREATED)
def create(payload: BriefingCreate, db: Annotated[Session, Depends(get_db)]):
    briefing = create_briefing(db, payload)
    return {"id": briefing.id}


@router.get("/{briefing_id}")
def get_one(briefing_id: int, db: Annotated[Session, Depends(get_db)]):
    briefing = get_briefing(db, briefing_id)
    if not briefing:
        raise HTTPException(status_code=404, detail="Briefing not found")
    return briefing


@router.post("/{briefing_id}/generate")
def generate(briefing_id: int, db: Annotated[Session, Depends(get_db)]):
    try:
        html = generate_report(db, briefing_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Briefing not found")
    return {"status": "generated", "html_length": len(html)}


@router.get("/{briefing_id}/html", response_class=HTMLResponse)
def get_html(briefing_id: int, db: Annotated[Session, Depends(get_db)]):
    html = get_generated_html(db, briefing_id)
    if not html:
        raise HTTPException(status_code=404, detail="Report not generated")
    return html