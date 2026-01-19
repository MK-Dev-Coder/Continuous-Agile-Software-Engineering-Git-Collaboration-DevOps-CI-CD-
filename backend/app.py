from flask import Flask, jsonify, request

app = Flask(__name__)

# Dummy data for demonstration
students = [
    {"id": 1, "name": "Alice", "email": "alice@example.com", "phone": "123-456-7890"},
    {"id": 2, "name": "Bob", "email": "bob@example.com", "phone": "234-567-8901"},
    {"id": 3, "name": "Charlie", "email": "charlie@example.com", "phone": "345-678-9012"}
]


@app.route('/api/students', methods=['GET', 'POST'])
def students_handler():
    if request.method == 'GET':
        return jsonify(students)

    # POST - add a new student
    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')

    if not name or not email:
        return jsonify({'error': 'fields "name" and "email" are required'}), 400

    new_id = max((s['id'] for s in students), default=0) + 1
    new_student = {'id': new_id, 'name': name, 'email': email, 'phone': phone}
    students.append(new_student)
    return jsonify(new_student), 201

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)