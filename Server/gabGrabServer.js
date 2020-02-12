const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

const app = express();
app.use(cors());

// Setting up the SQL connection and query to fetch our groups
const SELECT_ALL_GROUPS_QUERY = 'SELECT * from groups';
const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'gab'
});
connection.connect((err) => {
	if (err) {
		return err;
	}
});

// Sending results back
app.get('/getAllGroups', (req, res) => {
	connection.query(SELECT_ALL_GROUPS_QUERY, (err, results) => {
		if (err) {
			return res.send(err);
		} else {
			return res.json({
				data: results
			});
		}
	});
});
// server is listening on localhost:4000
app.listen(4000, () => {
	console.log('group server listening');
});
