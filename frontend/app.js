// Placeholder for fetching and displaying students
fetch('/api/students')
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById('student-list');
    list.innerHTML = '<ul>' + data.map(s => `<li>${s.name} (${s.id})</li>`).join('') + '</ul>';
  })
  .catch(() => {
    document.getElementById('student-list').innerText = 'Could not load students.';
  });