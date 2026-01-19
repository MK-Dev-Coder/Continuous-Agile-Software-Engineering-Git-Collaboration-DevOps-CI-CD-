"""
student-directory backend (Flask)

This module implements a deliberately minimal REST API for an
educational student-directory application. The implementation focuses on
clarity and pedagogy rather than production readiness: data is kept in
memory, validation is lightweight, and there is no authentication.

Educational objectives demonstrated here:
- Basic Flask routing and request/response semantics.
- HTTP status code usage for success (201) and client errors (400).
- How simple in-memory state can be used for unit/integration tests.

Notes for students:
- The in-memory `students` list is reset each time the process restarts;
  replace it with a database layer for persistence in real projects.
- Input validation is intentionally minimal to keep the example
  approachable. Real-world APIs require stricter validation, error
  handling, and logging.
"""

from flask import Flask, jsonify, request

app = Flask(__name__)

# ---------------------------------------------------------------------------
# In-memory dataset (ephemeral)
# ---------------------------------------------------------------------------
# Each record is a simple mapping with fields: `id`, `name`, `email`, `phone`.
students = [
    {"id": 1, "name": "Alice", "email": "alice@example.com", "phone": "123-456-7890"},
    {"id": 2, "name": "Bob", "email": "bob@example.com", "phone": "234-567-8901"},
    {"id": 3, "name": "Charlie", "email": "charlie@example.com", "phone": "345-678-9012"}
]


@app.route('/api/students', methods=['GET', 'POST'])
def students_handler():
    """Handle collection-level operations for students.

    Methods supported:
    - GET: return the list of students.
    - POST: append a new student. Required fields: `name`, `email`.

    Phone is optional in this handler to keep the frontend flexible and
    to match existing tests that only require `name` and `email`.
    """

    if request.method == 'GET':
        return jsonify(students)

    # POST - add a new student
    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')

    # Validate required fields: name and email must be present.
    if not name or not email:
        return jsonify({'error': 'fields "name" and "email" are required'}), 400

    new_id = max((s['id'] for s in students), default=0) + 1
    new_student = {'id': new_id, 'name': name, 'email': email, 'phone': phone}
    students.append(new_student)
    return jsonify(new_student), 201


if __name__ == '__main__':
    # Bind to all interfaces so the container can be accessed from the
    # host or other containers when running with Docker Compose.
    app.run(host='0.0.0.0', port=5000)