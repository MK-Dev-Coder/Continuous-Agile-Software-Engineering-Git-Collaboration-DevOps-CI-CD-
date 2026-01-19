function loadStudents() {
  fetch('/api/students')
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('student-list');
      list.innerHTML = '<ul>' + data.map(s => `<li><strong>${s.name}</strong> (${s.id})<br><strong>Email:</strong> ${s.email}<br><strong>Phone:</strong> ${s.phone}</li>`).join('') + '</ul>';
    })
    .catch(() => {
      document.getElementById('student-list').innerText = 'Could not load students.';
    });
}

document.getElementById('add-student-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('student-name').value.trim();
  const email = document.getElementById('student-email').value.trim();
  const phone = document.getElementById('student-phone').value.trim();
  if (!name || !email || !phone) return;
  fetch('/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone })
  })
    .then(res => {
      if (!res.ok) throw new Error('Failed to add student');
      return res.json();
    })
    .then(() => {
      document.getElementById('student-name').value = '';
      document.getElementById('student-email').value = '';
      document.getElementById('student-phone').value = '';
      loadStudents();
    })
    .catch(() => alert('Could not add student.'));
});

loadStudents();