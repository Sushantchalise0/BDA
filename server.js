//require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('views'));

// Set view engine to EJS (to handle embedded JavaScript in HTML)
app.set('view engine', 'ejs');

// MySQL connection using environment variables
const connection = mysql.createConnection({
    host: 'ioe-pulchowk.cl2aoqwkgg4s.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: 'admin123',
    database: 'pulchowk'
});

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

// Serve the form page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Handle form submission and display results
app.post('/result', (req, res) => {

    const data = fs.readFileSync('D:/big data/photo.txt', 'utf-8');

    // Split the file content by new line to create an array
    const lines = data.split('\n').filter(line => line.trim() !== '');

    // Select a random line
    const randomValue = lines[Math.floor(Math.random() * lines.length)];
    const pic = 'https://mis.pcampus.edu.np/showfile.php?fileId='+randomValue;

    const rollNumber = req.body.rollNumber;

    connection.query('SELECT * FROM students_batch_80_facultycode_msdsa WHERE uniquerollno = ?', [rollNumber], (err, results1) => {
        if (err) {
            return res.status(500).send('Error querying the database contating Details');
        }
        else {
            connection.query('SELECT * FROM marks_batch_80_facultycode_msdsa WHERE uniquerollno = ?', [rollNumber], (err, results2) => {
                if (err) {
                    return res.status(500).send('Error querying the database contating marks');
                }
                if (results1.length > 0 && results2.length > 0) {
                    const info = results1.length ? results1[0] : null;
                    const marks = results2.length ? results2 : null;
                    //res.json(results);
                    res.render('result', { info, marks, pic });
                    //res.json(results[0]);  // Return the matching record
                } else {
                    res.status(404).send('No student found with that roll number.');
                }
            });
        }
    });
});


// app.post('/result', (req, res) => {
//     const rollNumberToFind = req.body.rollNumber;

//     // Query the database using the roll number
//     connection.query('SELECT * FROM students_batch_80_facultycode_msdsa WHERE uniquerollno = ?', [rollNumberToFind], (err, results) => {
//         if (err) {
//             return res.status(500).send('Error querying the database');
//         }

//         if (results.length > 0) {
//             const info = results.length ? results[0] : null;
//             // res.json(results[0]);  // Return the matching record
//             res.render('result', { info });
//         } else {
//             res.status(404).send('No student found with that roll number.');
//         }
//     });
// });

// app.post('/marks', (req, res) => {
//     const rollNumber = req.body.rollNumber;

//     connection.query('SELECT * FROM marks_batch_80_facultycode_msdsa ',(err, results) => {
//         if (err) {
//             return res.status(500).send('Error querying the database, No Roll Number');
//         }

//         res.send(results);
//     });
// });

app.post('/report', (req, res) => {
    const rollNumber = req.body.rollNumber;

    connection.query('SELECT * FROM marks_batch_80_facultycode_msdsa ',(err, results) => {
        if (err) {
            return res.status(500).send('Error querying the database, No Roll Number');
        }

        res.send(results);
    });
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

//mysql -h ioe-pulchowk.cl2aoqwkgg4s.us-east-1.rds.amazonaws.com -P 3306 -u admin -p "admin123"
