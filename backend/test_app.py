import unittest
from app import app

class StudentApiTestCase(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_get_students(self):
        response = self.client.get('/api/students')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 1)
        self.assertIn('name', data[0])
        self.assertIn('id', data[0])

if __name__ == '__main__':
    unittest.main()
