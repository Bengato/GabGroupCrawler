const mysql = require('mysql');

module.exports = class DatabaseHandler {
	config = {
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'gab'
	};
	connection = '';
	constructor() {}

	// Parsing methos for text inside values to be saved in db
	mysql_real_escape_string = (str) => {
		return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function(char) {
			switch (char) {
				case '\0':
					return '\\0';
				case '\x08':
					return '\\b';
				case '\x09':
					return '\\t';
				case '\x1a':
					return '\\z';
				case '\n':
					return '\\n';
				case '\r':
					return '\\r';
				case '"':
				case "'":
				case '\\':
				case '%':
					return '\\' + char;
			}
		});
	};
	// Sending all values that can be problematic to be parsed
	parseAllGroupParameters = (group) => {
		group.groupImage = group.groupImage.split('-')[1];
		group.groupName = this.mysql_real_escape_string(group.groupName);
		group.groupDescription = this.mysql_real_escape_string(group.groupDescription);
		group.latestPostCreator = this.mysql_real_escape_string(group.latestPostCreator);
		group.latestPostContent = this.mysql_real_escape_string(group.latestPostContent);
		return group;
	};
	// Add a group to 'groups' table in db
	insertGroup = (group) => {
		// add group to database
		group = this.parseAllGroupParameters(group);
		let insertQuery = `INSERT INTO groups (groupURL, groupName, groupDescription, groupImage, latestPostCreator, latestPostDate, latestPostContent) VALUES ('${group.groupURL}', '${group.groupName}', '${group.groupDescription}', '${group.groupImage}', '${group.latestPostCreator}', '${group.latestPostDate}', '${group.latestPostContent}');`;
		this.connection = mysql.createConnection(this.config);
		this.connection.connect((err) => {
			if (err) throw err;
			this.connection.query(insertQuery, (err, res) => {
				if (err) {
					throw err;
				} else {
					console.log('Inserted group successfully!')
					this.connection.destroy();
				}
			});
		});
	};
	// Get index of latest added group
	getLatestIndex = async () => {
		let indexQuery = `IF EXISTS (SELECT groupIndex FROM groups ORDER BY groupIndex DESC LIMIT 1);`;
		this.connection = mysql.createConnection(this.config);
		this.connection.connect((err) => {
			if (err) throw err;
		});
		// Workaround async with a promise for our get
		return new Promise((resolve, reject) => {
			this.connection.query(indexQuery, (err, res) => {
				if (err) {
					// In case db is empty resolve 1 to start from 1st index
					resolve(1);
				} else {
					resolve(res[0].groupIndex + 1);
					this.connection.destroy();
				}
			});
		});
	};
};
