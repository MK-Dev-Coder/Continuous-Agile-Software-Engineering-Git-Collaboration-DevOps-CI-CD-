/*
  Frontend logic for the student-directory demo.

  This script performs two core responsibilities:
  - Fetch the student collection from the backend and render it in the DOM.
  - Handle the add-student form, POSTing JSON to the backend and refreshing
    the list on success.

  Pedagogical notes:
  - The frontend assumes the backend API is reachable at `/api/students`.
  - No advanced error recovery or input sanitisation is included here so
    the example remains compact and easy to follow for coursework.
*/

function loadStudents() {
  // GET the collection of students and render as a simple unordered list.
  fetch('/api/students')
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('student-list');
      // Render each student with basic contact fields. Keep markup simple
      // to make it easy to inspect in browser devtools during exercises.
      list.innerHTML = '<ul>' + data.map(s =>
        `<li><strong>${s.name}</strong> (${s.id})<br><strong>Email:</strong> ${s.email}<br><strong>Phone:</strong> ${s.phone}</li>`
      ).join('') + '</ul>';
    })
    .catch(() => {
      // Graceful degradation: show a compact error message if the
      // backend is unreachable. Useful when teaching network failure
      // scenarios in class.
      document.getElementById('student-list').innerText = 'Could not load students.';
    });
}


// Form submission handler: collect fields, validate minimally, then POST.
document.getElementById('add-student-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('student-name').value.trim();
  const email = document.getElementById('student-email').value.trim();
  const phone = document.getElementById('student-phone').value.trim();

  // Minimal client-side validation to avoid sending empty values.
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
      // Clear the form and refresh the list to show the newly added
      // record. This simple refresh pattern is easy for students to
      // understand before introducing optimistic UI updates.
      document.getElementById('student-name').value = '';
      document.getElementById('student-email').value = '';
      document.getElementById('student-phone').value = '';
      loadStudents();
    })
    .catch(() => alert('Could not add student.'));
});


// Initial load when the page is displayed.
loadStudents();