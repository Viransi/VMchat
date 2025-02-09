const pool = require("../config/db");
const bcrypt = require("bcryptjs");

class User {
  static async createUser(
    first_name,
    last_name,
    dob,
    email,
    phone_number,
    password
  ) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO users (first_name, last_name, dob, email, phone_number, password) VALUES (?, ?, ?, ?, ?, ?)`;
    return pool.query(sql, [
      first_name,
      last_name,
      dob,
      email,
      phone_number,
      hashedPassword,
    ]);
  }

  static async findByEmail(email) {
    const [rows] = await pool.query(`SELECT * FROM users WHERE email = ?`, [
      email,
    ]);
    return rows[0];
  }
}

module.exports = User;
