from flask import Flask, jsonify

app = Flask(__name__)

# Dummy data for demonstration
students = [
    {"id": 1, "name": "Alice"},
    {"id": 2, "name": "Bob"},
    {"id": 3, "name": "Charlie"}
]

@app.route('/api/students')
def get_students():
    return jsonify(students)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)