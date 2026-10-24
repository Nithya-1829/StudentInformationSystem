
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

let students = [
  { id: 1, name: 'Rahul', rollNo: '101', course: 'MCA' },
  { id: 2, name: 'Priya', rollNo: '102', course: 'MCA' }
];

// Home page

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Student Information System</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <div class="container">
        <header class="header">
          <h1>Student Information System</h1>
          <p>Manage student records easily</p>
        </header>

        <section class="card">
          <h2>Add New Student</h2>
          <form action="/students" method="POST">
            <input name="name" placeholder="Student Name" required>
            <input name="rollNo" placeholder="Roll Number" required>
            <input name="course" placeholder="Course" required>
            <button type="submit">+ Add Student</button>
          </form>
        </section>

        <section class="card">
          <h2>Student Records</h2>
          <p>Click below to view all registered students.</p>
          <a class="button" href="/students">View All Students</a>
        </section>
      </div>
    </body>
    </html>
  `);
});


// View all students

app.get('/students', (req, res) => {
  const rows = students.map(student => `
    <tr>
      <td>${student.id}</td>
      <td>${student.name}</td>
      <td>${student.rollNo}</td>
      <td>${student.course}</td>
      <td>
        <button onclick="deleteStudent(${student.id})">
          Delete
        </button>
      </td>
    </tr>
  `).join('');

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Registered Students</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <div class="container">
        <header class="header">
          <h1>Registered Students</h1>
          <p>View and manage student records</p>
        </header>

        <section class="card">
          <h2>Student List (${students.length})</h2>
          <div style="overflow-x:auto">
            <table style="width:100%; border-collapse:collapse; text-align:left">
              <thead>
                <tr>
                  <th style="padding:12px">ID</th>
                  <th style="padding:12px">Name</th>
                  <th style="padding:12px">Roll No</th>
                  <th style="padding:12px">Course</th>
                  <th style="padding:12px">Action</th>
                </tr>
              </thead>
              <tbody>
                ${rows || '<tr><td colspan="5" style="padding:15px">No students registered yet.</td></tr>'}
              </tbody>
            </table>
          </div>
          <p><a class="button" href="/">Back to Home</a></p>
        </section>
      </div>

      <script>
        async function deleteStudent(id) {
          if (!confirm('Are you sure you want to delete this student?')) return;

          const response = await fetch('/students/' + id, {
            method: 'DELETE'
          });

          if (response.ok) {
            window.location.reload();
          } else {
            alert('Could not delete student.');
          }
        }
      </script>
    </body>
    </html>
  `);
});

// Add a student
app.post('/students', (req, res) => {
  const { name, rollNo, course } = req.body;

  if (!name?.trim() || !rollNo?.trim() || !course?.trim()) {
    return res.status(400).send('Please enter all student details.');
  }

  if (students.some(s => s.rollNo === rollNo.trim())) {
    return res.status(409).send('Roll number already exists.');
  }

  const newStudent = {
    id: students.length
      ? Math.max(...students.map(s => s.id)) + 1
      : 1,
    name: name.trim(),
    rollNo: rollNo.trim(),
    course: course.trim()
  };

  students.push(newStudent);
  res.redirect('/');
});

// View one student by ID
app.get('/students/:id', (req, res) => {
  const student = students.find(s => s.id === Number(req.params.id));

  if (!student) {
    return res.status(404).send('Student not found.');
  }

  res.json(student);
});

// Delete a student
app.delete('/students/:id', (req, res) => {
  const id = Number(req.params.id);

  if (!students.some(s => s.id === id)) {
    return res.status(404).json({ message: 'Student not found.' });
  }

  students = students.filter(s => s.id !== id);
  res.json({ message: 'Student deleted successfully.' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
