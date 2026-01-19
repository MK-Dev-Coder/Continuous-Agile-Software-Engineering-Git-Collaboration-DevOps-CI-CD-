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


@app.route('/api/students', methods=['GET'])
def get_students():
    """Return the full list of students as JSON.

    This endpoint returns a JSON array of student objects. For large
    datasets, a paginated approach would be preferred; this simplistic
    design keeps the example accessible in teaching scenarios.
    """
    return jsonify(students)


@app.route('/api/students', methods=['POST'])
def add_student():
    """Add a new student record.

    Expected JSON payload: {"name": str, "email": str, "phone": str}

    Behaviour:
    - Returns HTTP 201 and the created resource on success.
    - Returns HTTP 400 with an error message when required fields are
      missing. This illustrates client error reporting.
    """
    data = request.get_json()

    # Minimal required-field checks: serve as a clear example of
    # returning HTTP 400 for invalid client input.
    if not data or 'name' not in data or not data['name']:
        return jsonify({'error': 'Name is required'}), 400
    if 'email' not in data or not data['email']:
        return jsonify({'error': 'Email is required'}), 400
    if 'phone' not in data or not data['phone']:
        return jsonify({'error': 'Phone number is required'}), 400

    # Deterministic id allocation for the in-memory list. Production
    # systems should use database-generated identifiers or UUIDs.
    new_id = max([s['id'] for s in students], default=0) + 1
    student = {
        "id": new_id,
        "name": data['name'],
        "email": data['email'],
        "phone": data['phone']
    }
    students.append(student)
    return jsonify(student), 201


if __name__ == '__main__':
    # Bind to all interfaces so the container can be accessed from the
    # host or other containers when running with Docker Compose.
    app.run(host='0.0.0.0', port=5000)