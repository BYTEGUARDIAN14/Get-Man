import pytest
import requests
import os
from pathlib import Path

# Backend API testing for APIPlayground
# Tests: health check, AI explain endpoint

# Read BASE_URL from frontend .env file
def get_backend_url():
    env_file = Path('/app/frontend/.env')
    if env_file.exists():
        with open(env_file) as f:
            for line in f:
                if line.startswith('EXPO_PUBLIC_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    return ''

BASE_URL = get_backend_url()

class TestHealthEndpoint:
    """Health check endpoint tests"""

    def test_health_check(self):
        """Test /api/health endpoint returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "status" in data, "Response should contain 'status' field"
        assert data["status"] == "healthy", f"Expected status 'healthy', got {data.get('status')}"
        print(f"✓ Health check passed: {data}")


class TestAIExplainEndpoint:
    """AI explain endpoint tests"""

    def test_ai_explain_success_response(self):
        """Test AI explain with 200 status response"""
        payload = {
            "method": "GET",
            "url": "https://jsonplaceholder.typicode.com/posts/1",
            "status": 200,
            "body": '{"userId": 1, "id": 1, "title": "test post", "body": "test body"}'
        }
        
        response = requests.post(f"{BASE_URL}/api/ai/explain", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "whatItMeans" in data, "Response should contain 'whatItMeans'"
        assert "whyItHappened" in data, "Response should contain 'whyItHappened'"
        assert "testCases" in data, "Response should contain 'testCases'"
        assert isinstance(data["testCases"], list), "testCases should be a list"
        print(f"✓ AI explain success response: whatItMeans={data['whatItMeans'][:50]}...")

    def test_ai_explain_error_response(self):
        """Test AI explain with 404 error response"""
        payload = {
            "method": "GET",
            "url": "https://jsonplaceholder.typicode.com/posts/999999",
            "status": 404,
            "body": '{}'
        }
        
        response = requests.post(f"{BASE_URL}/api/ai/explain", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "whatItMeans" in data
        assert "whyItHappened" in data
        assert "howToFix" in data
        assert data["howToFix"] != "", "howToFix should not be empty for 404 error"
        print(f"✓ AI explain error response: howToFix={data['howToFix'][:50]}...")

    def test_ai_explain_missing_fields(self):
        """Test AI explain with missing required fields"""
        payload = {
            "method": "GET",
            "url": "https://example.com"
            # Missing status and body
        }
        
        response = requests.post(f"{BASE_URL}/api/ai/explain", json=payload)
        # Should return 422 for validation error
        assert response.status_code == 422, f"Expected 422 for missing fields, got {response.status_code}"
        print(f"✓ AI explain validation error handled correctly")


@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session
