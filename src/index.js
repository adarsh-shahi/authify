import pool from "./config/db.js";
import bcrypt from "bcryptjs";
import {
	QverifyAPI_KEY,
	QcreateUser,
	QverifyUser,
	QdeleteUser,
} from "./queries/userQuery.js";

/**
 * The Auth class represents a module for user authentication and authorization.
 * It provides functionality for creating, verifying, and deleting user accounts
 * using the provided API key for authentication.
 */

class Auth {
	#username;
	#email;
	#password;
	#API_KEY;

	/**
	 * Creates an instance of the Auth class.
	 * @param {string} API_KEY - The API key to use for authentication.
	 */

	constructor(API_KEY) {
		this.#API_KEY = API_KEY;
	}

	/**
	 * The #validAPI_KEYid method retrieves the API key's ID from the
	 * database using the QverifyAPI_KEY query.
	 */
	async #validAPI_KEYid() {
		const response = await pool.query(QverifyAPI_KEY(this.#API_KEY));
		return response.rows[0].id;
	}

	async createUser(user) {
		return await this.#userAction(user, QcreateUser, "CREATE_USER");
	}

	/**
	 * The verifyUser method takes an object representing the user's credentials
	 * and checks if the user exists in the database using the QverifyUser query.
	 * If the user is found, the method returns the user data.
	 */
	async verifyUser(user) {
		const userData = await this.#userAction(user, QverifyUser, "VERIFY_USER");
		return userData;
	}

	async deleteUser(user) {
		return await this.#userAction(user, QdeleteUser, "DELETE_USER");
	}

	/**
	 * The #userAction method is a helper method used by the createUser, verifyUser,
	 * and deleteUser methods. It checks the user's credentials, retrieves the API key's ID,
	 * and executes the appropriate query.
	 */
	async #userAction(user, queryString, action) {
		this.#checkUserCredentials(user);

		if (action === "CREATE_USER") {
			user.password = await bcrypt.hash(user.password, 8);
		}
		if (action === "DELETE_USER") {
			const response = await this.verifyUser(user);
			if (response.status === "fail") return response;
		}

		this.#email = user.email;
		this.#username = user.username;
		this.#password = user.password;

		try {
			const id = await this.#validAPI_KEYid();
			if (!id) throw new Error("API KEY Invalid");
			const user = {
				username: this.#username,
				password: this.#password,
				email: this.#email,
				apiKey_id: id,
			};
			const response = await pool.query(queryString(user));
			if (action === "VERIFY_USER") {
				if (response.rows.length === 0)
					return {
						status: "fail",
						message: "Account does'nt exist",
					};
				if (await bcrypt.compare(user.password, response.rows[0].password)) {
					const { email, username } = response.rows[0];
					return {
						status: "success",
						message: {
							email,
							username,
						},
					};
				}
				return {
					status: "fail",
					message: "Password dosent match",
				};
			}
			return {
				status: "success",
				message:
					"account " + (action === "CREATE_USER" ? "created" : "deleted"),
			};
		} catch (e) {
			throw new Error(`Failed to take action on user: ${e.message}`);
		}
	}

	/**
	 * The #checkUserCredentials method is a helper method used to validate the user's credentials.
	 */
	#checkUserCredentials(user) {
		if (
			!user ||
			typeof user !== "object" ||
			Array.isArray(user) ||
			user === null
		)
			throw new Error("User must be an object {}");

		if (!user.password) throw new Error("Password must be a present");

		user.password = user.password.toString();
		if (user.password.length === 0)
			throw new Error("Password must be a non-empty");

		if (!user.username && !user.email)
			throw new Error("User must have a username or email");

		if (
			user.username &&
			(typeof user.username !== "string" || user.username.length === 0)
		)
			throw new Error("Username must be a non-empty string");

		if (
			user.email &&
			(typeof user.email !== "string" || user.email.length === 0)
		)
			throw new Error("Email must be a non-empty string");
	}
}

export default Auth;

const user = new Auth("secret");
console.log(await user.createUser({ password: "1234", username: "sup" }));
