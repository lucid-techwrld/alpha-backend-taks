from fastapi.testclient import TestClient
from app.main import app

def test_create_briefing() -> None:
    client = TestClient(app)
    payload = {
        "companyName": "Apple Inc",
        "ticker": "AAPL",
        "sector": "Technology",
        "analystName": "John Doe",
        "summary": "Strong product ecosystem and recurring revenue.",
        "recommendation": "Buy",
        "keyPoints": [
            "iPhone sales remain strong",
            "Services revenue continues to grow"
        ],
        "risks": [
            "Regulatory pressure",
            "Supply chain dependency"
        ],
        "metrics": [
            {"name": "Revenue Growth", "value": "8%"},
            {"name": "Gross Margin", "value": "44%"}
        ]
    }

    response = client.post("/briefings", json=payload)

    assert response.status_code == 201
    data = response.json()

    assert data["company_name"] == "Apple Inc"
    assert data["ticker"] == "AAPL"
    assert data["sector"] == "Technology"


def test_get_briefing() -> None:
    client = TestClient(app)

    payload = {
        "companyName": "Tesla",
        "ticker": "TSLA",
        "sector": "Automotive",
        "analystName": "Jane Analyst",
        "summary": "EV leader with strong brand.",
        "recommendation": "Hold",
        "keyPoints": ["Strong delivery growth"],
        "risks": ["High valuation"],
        "metrics": []
    }

    create = client.post("/briefings", json=payload)
    briefing_id = create.json()["id"]

    response = client.get(f"/briefings/{briefing_id}")

    assert response.status_code == 200
    data = response.json()

    assert data["company_name"] == "Tesla"
    assert data["ticker"] == "TSLA"


def test_generate_report() -> None:
    client = TestClient(app)

    payload = {
        "companyName": "Microsoft",
        "ticker": "MSFT",
        "sector": "Technology",
        "analystName": "Analyst Smith",
        "summary": "Cloud growth driving revenue.",
        "recommendation": "Buy",
        "keyPoints": ["Azure growth accelerating"],
        "risks": ["Competition from AWS"],
        "metrics": [
            {"name": "Cloud Revenue", "value": "$100B"}
        ]
    }

    create = client.post("/briefings", json=payload)
    briefing_id = create.json()["id"]

    response = client.post(f"/briefings/{briefing_id}/generate")

    assert response.status_code == 200
    data = response.json()

    assert data["generated"] is True


def test_get_generated_report_html() -> None:
    client = TestClient(app)

    payload = {
        "companyName": "Nvidia",
        "ticker": "NVDA",
        "sector": "Semiconductors",
        "analystName": "Chip Analyst",
        "summary": "AI demand driving growth.",
        "recommendation": "Buy",
        "keyPoints": ["AI chips dominate market"],
        "risks": ["Supply constraints"],
        "metrics": []
    }

    create = client.post("/briefings", json=payload)
    briefing_id = create.json()["id"]

    client.post(f"/briefings/{briefing_id}/generate")

    response = client.get(f"/briefings/{briefing_id}/report")

    assert response.status_code == 200

    html = response.text

    assert "<html" in html
    assert "Nvidia" in html

def test_generate_nonexistent_briefing() -> None:
    client = TestClient(app)

    response = client.post("/briefings/999/generate")
    assert response.status_code == 404