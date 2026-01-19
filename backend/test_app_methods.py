import unittest
from app import app

class StudentApiMethodTestCase(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_post_not_allowed(self):
        response = self.client.post('/api/students', json={"id": 4, "name": "David"})
        self.assertIn(response.status_code, [404, 405])

    def test_put_not_allowed(self):
        response = self.client.put('/api/students', json={"id": 1, "name": "Alice Updated"})
        self.assertIn(response.status_code, [404, 405])

    def test_delete_not_allowed(self):
        response = self.client.delete('/api/students/1')
        self.assertIn(response.status_code, [404, 405])

if __name__ == '__main__':
    unittest.main()
