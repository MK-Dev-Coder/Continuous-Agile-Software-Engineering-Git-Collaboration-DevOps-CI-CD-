import unittest
from app import app

class StudentApiTypeTestCase(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_students_response_type(self):
        response = self.client.get('/api/students')
        self.assertEqual(response.content_type, 'application/json')

    def test_students_status_code(self):
        response = self.client.get('/api/students')
        self.assertEqual(response.status_code, 200)

    def test_students_list_type(self):
        response = self.client.get('/api/students')
        data = response.get_json()
        self.assertIsInstance(data, list)

if __name__ == '__main__':
    unittest.main()
