import unittest
from app import app

class StudentApiEdgeCaseTestCase(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_students_not_empty(self):
        response = self.client.get('/api/students')
        data = response.get_json()
        self.assertTrue(len(data) > 0, "Student list should not be empty by default")

    def test_invalid_route(self):
        response = self.client.get('/api/invalid')
        self.assertEqual(response.status_code, 404)

if __name__ == '__main__':
    unittest.main()
