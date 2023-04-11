/**
    Generates a SQL query to insert a new user into the 'devClients' table with the given user object
    @param {object} user - The user object containing properties 'apiKey_id', 'password', 'email', and/or 'username'
    @returns {string} The SQL query string to insert the user into the 'devClients' table
*/
const QcreateUser = (user) => {
	return `INSERT INTO devClients (apiKey_id, password, ${
		user.email ? "email" : ""
	}${user.email && user.username ? ", " : ""}${
		user.username ? "username" : ""
	}) VALUES (${user.apiKey_id}, '${user.password}', ${
		user.email ? `'${user.email}'` : ""
	}${user.email && user.username ? ", " : ""}${
		user.username ? `'${user.username}'` : ""
	})`;
};

const QverifyUser = (user) => {
	return `SELECT id, email, username, password FROM devClients WHERE apiKey_id = ${
		user.apiKey_id
	} AND ${
		user.email ? `email = '${user.email}'` : `username = '${user.username}'`
	}`;
};

const QdeleteUser = (user) => {
	return `DELETE FROM devClients WHERE apiKey_id = ${user.apiKey_id} AND ${
		user.email ? `email = '${user.email}'` : `username = '${user.username}'`
	}`;
};

const QverifyAPI_KEY = (key) => {
	return `SELECT id, developer_id, key FROM apiKeys WHERE key = '${key}'`;
};

export { QverifyAPI_KEY, QcreateUser, QverifyUser, QdeleteUser };
