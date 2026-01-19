import unittest
from app import app

class StudentApiMethodTestCase(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_post_behavior(self):
        # missing required field -> 400
        response = self.client.post('/api/students', json={"id": 4, "name": "David"})
        self.assertEqual(response.status_code, 400)

        # valid payload -> created (201)
        response = self.client.post('/api/students', json={"name": "Eve", "email": "eve@example.com", "phone": "555-000-1111"})
        self.assertEqual(response.status_code, 201)

    def test_put_not_allowed(self):
        response = self.client.put('/api/students', json={"id": 1, "name": "Alice Updated"})
        self.assertIn(response.status_code, [404, 405])

    def test_delete_not_allowed(self):
        response = self.client.delete('/api/students/1')
        self.assertIn(response.status_code, [404, 405])

if __name__ == '__main__':
    unittest.main()
