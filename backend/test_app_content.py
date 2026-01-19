import unittest
from app import app

class StudentApiContentTestCase(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_students_content(self):
        response = self.client.get('/api/students')
        data = response.get_json()
        # Check that all students have id and name, and id is int, name is str
        for student in data:
            self.assertIn('id', student)
            self.assertIn('name', student)
            self.assertIsInstance(student['id'], int)
            self.assertIsInstance(student['name'], str)
            self.assertTrue(student['name'])  # name is not empty

    def test_students_unique_ids(self):
        response = self.client.get('/api/students')
        data = response.get_json()
        ids = [student['id'] for student in data]
        self.assertEqual(len(ids), len(set(ids)), "Student IDs should be unique")

if __name__ == '__main__':
    unittest.main()
