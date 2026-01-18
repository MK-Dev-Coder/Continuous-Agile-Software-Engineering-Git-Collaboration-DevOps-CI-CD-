from flask import Flask, jsonify, request

app = Flask(__name__)

# Dummy data for demonstration
students = [
    {"id": 1, "name": "Alice"},
    {"id": 2, "name": "Bob"},
    {"id": 3, "name": "Charlie"}
]


@app.route('/api/students', methods=['GET'])
def get_students():
    return jsonify(students)

@app.route('/api/students', methods=['POST'])
def add_student():
    data = request.get_json()
    if not data or 'name' not in data or not data['name']:
        return jsonify({'error': 'Name is required'}), 400
    new_id = max([s['id'] for s in students], default=0) + 1
    student = {"id": new_id, "name": data['name']}
    students.append(student)
    return jsonify(student), 201

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)