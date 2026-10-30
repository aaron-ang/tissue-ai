import pytest
from fastapi.testclient import TestClient

import main
from schema import create_mock_analysis


@pytest.fixture
def client():
    return TestClient(main.app)


def test_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


def test_health(client):
    assert client.get("/health").json() == {"service": "github-issue-analyzer"}


def test_cors_allows_frontend(client):
    response = client.options(
        "/analyze",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"


def test_analyze_rejects_invalid_url(client):
    assert client.post("/analyze", json={"github_url": "not a url"}).status_code == 422


def test_analyze_returns_agent_result(client, monkeypatch):
    mock = create_mock_analysis()
    monkeypatch.setattr(main, "analyze_gh_issue", lambda url: mock)

    response = client.post(
        "/analyze", json={"github_url": "https://github.com/octo/repo/issues/1"}
    )

    assert response.status_code == 200
    assert response.json()["issue_summary"]["title"] == mock.issue_summary.title


def test_analyze_maps_value_error_to_400(client, monkeypatch):
    def fail(url):
        raise ValueError("missing LETTA_API_KEY")

    monkeypatch.setattr(main, "analyze_gh_issue", fail)

    response = client.post(
        "/analyze", json={"github_url": "https://github.com/octo/repo/issues/1"}
    )

    assert response.status_code == 400
