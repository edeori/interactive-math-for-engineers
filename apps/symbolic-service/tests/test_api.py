from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    assert client.get("/health").status_code == 200


def test_equivalent_expressions() -> None:
    response = client.post(
        "/equivalence",
        json={
            "expected": "x**2 / 2",
            "actual": "0.5*x**2",
            "variables": ["x"],
            "domain": "real",
        },
    )
    assert response.status_code == 200
    assert response.json()["equivalent"] is True


def test_differentiate_and_integrate() -> None:
    derivative = client.post(
        "/differentiate", json={"expression": "x**3", "variable": "x"}
    )
    integral = client.post(
        "/integrate", json={"expression": "2*x", "variable": "x"}
    )
    assert derivative.json()["result"] == "3*x**2"
    assert integral.json()["result"] == "x**2"


def test_solve() -> None:
    response = client.post("/solve", json={"equation": "x**2=4", "variable": "x"})
    assert response.status_code == 200
    assert response.json()["solutions"] == ["-2", "2"]


def test_rejects_arbitrary_python() -> None:
    response = client.post(
        "/equivalence",
        json={
            "expected": "x",
            "actual": "__import__('os').system('id')",
            "variables": ["x"],
        },
    )
    assert response.status_code == 422


def test_domain_validation() -> None:
    valid = client.post("/validate-domain", json={"expression": "sqrt(x)", "values": {"x": 4}})
    invalid = client.post("/validate-domain", json={"expression": "sqrt(x)", "values": {"x": -1}})
    assert valid.json() == {"valid": True, "value": 2.0}
    assert invalid.json()["valid"] is False
