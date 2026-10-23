"""Guards the planned endpoint list so the skeleton and the README never drift apart."""


def test_openapi_lists_planned_endpoints(client):
    paths = client.get("/openapi.json").json()["paths"]
    for expected in [
        "/api/auth/register", "/api/auth/login", "/api/vehicles", "/api/vehicles/search",
        "/api/vehicles/{vehicle_id}", "/api/vehicles/{vehicle_id}/purchase",
        "/api/vehicles/{vehicle_id}/restock",
    ]:
        assert expected in paths
