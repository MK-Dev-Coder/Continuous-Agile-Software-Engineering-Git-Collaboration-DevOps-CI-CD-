from flask import Flask, jsonify, request

app = Flask(__name__)

# Dummy data for demonstration
students = [
    {"id": 1, "name": "Alice", "email": "alice@example.com", "phone": "123-456-7890"},
    {"id": 2, "name": "Bob", "email": "bob@example.com", "phone": "234-567-8901"},
    {"id": 3, "name": "Charlie", "email": "charlie@example.com", "phone": "345-678-9012"}
]


@app.route('/api/students', methods=['GET'])
def get_students():
    return jsonify(students)

@app.route('/api/students', methods=['POST'])
def add_student():
    data = request.get_json()
    if not data or 'name' not in data or not data['name']:
        return jsonify({'error': 'Name is required'}), 400
    if 'email' not in data or not data['email']:
        return jsonify({'error': 'Email is required'}), 400
    if 'phone' not in data or not data['phone']:
        return jsonify({'error': 'Phone number is required'}), 400
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
    app.run(host='0.0.0.0', port=5000)