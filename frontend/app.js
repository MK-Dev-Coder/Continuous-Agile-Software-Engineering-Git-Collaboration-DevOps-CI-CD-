function loadStudents() {
  fetch('/api/students')
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('student-list');
      list.innerHTML = '<ul>' + data.map(s => `<li>${s.name} (${s.id})</li>`).join('') + '</ul>';
    })
    .catch(() => {
      document.getElementById('student-list').innerText = 'Could not load students.';
    });
}

document.getElementById('add-student-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('student-name').value.trim();
  if (!name) return;
  fetch('/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  })
    .then(res => {
      if (!res.ok) throw new Error('Failed to add student');
      return res.json();
    })
    .then(() => {
      document.getElementById('student-name').value = '';
      loadStudents();
    })
    .catch(() => alert('Could not add student.'));
});

loadStudents();