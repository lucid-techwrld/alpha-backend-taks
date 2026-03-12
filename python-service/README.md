# Python Service – Briefings API

This service provides endpoints to manage and generate company briefings. Built with **FastAPI** and **SQLAlchemy**, it supports creating, retrieving, and generating reports for company briefings.  

---

## Features

- Create a company briefing with metadata, key points, risks, and metrics.  
- Retrieve an existing briefing by ID.  
- Generate a report (HTML) for a briefing.  
- Get the generated HTML report.  

---

## Tech Stack

- **FastAPI** – API framework  
- **SQLAlchemy** – ORM for database operations  
- **SQLite / PostgreSQL** – Database support  
- **Pydantic** – Request validation and schema management  
- **pytest** – Unit and integration tests  

---

## API Endpoints

| Method | Endpoint                  | Description                       |
|--------|---------------------------|-----------------------------------|
| POST   | `/briefings`              | Create a new briefing             |
| GET    | `/briefings/{id}`         | Get briefing by ID                |
| POST   | `/briefings/{id}/generate`| Generate HTML report for briefing |
| GET    | `/briefings/{id}/html`    | Retrieve generated HTML report    |

---

## Getting Started

1. Clone the repo:  
```bash
git clone <repo_url>
cd python-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

---

## Future Improvements

 - Add authentication & authorization for secure access.

 - Implement better error handling for report generation failures.

 - Add logging & monitoring for easier debugging in production.

 - Support pagination and filtering for briefings.

 - Improve report templates and export options (PDF, DOCX).
