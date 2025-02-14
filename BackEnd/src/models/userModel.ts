import { Pool } from "mysql2/promise";
import pool from "../config/db";

class User {
  // ✅ Find a user by email
  static async findByEmail(email: string): Promise<any> {
    const [rows]: any = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    return rows[0];
  }

  // ✅ Find a user by ID (fix for findById error)
  static async findById(id: number): Promise<any> {
    const [rows]: any = await pool.query("SELECT * FROM users WHERE id = ?", [
      id,
    ]);
    return rows[0]; // Return the user or null if not found
  }

  // ✅ Update user details (fix for update error)
  static async updateUser(id: number, updatedData: any): Promise<any> {
    const fields = Object.keys(updatedData)
      .map((key) => `${key} = ?`)
      .join(", ");

    const values = Object.values(updatedData);
    values.push(id); // Add ID as last parameter for WHERE clause

    const [result]: any = await pool.query(
      `UPDATE users SET ${fields} WHERE id = ?`,
      values
    );

    return result;
  }

  // ✅ Create a new user
  static async createUser(
    firstName: string,
    lastName: string,
    dob: string,
    email: string,
    phoneNumber: string,
    password: string
  ): Promise<any> {
    const [result]: any = await pool.query(
      "INSERT INTO users (firstName, lastName, dob, email, phoneNumber, password) VALUES (?, ?, ?, ?, ?, ?)",
      [firstName, lastName, dob, email, phoneNumber, password]
    );
    return result;
  }

  // ✅ Get all active users (Excludes inactive or deleted users)
  static async getAllUsers(): Promise<any> {
    const [rows]: any = await pool.query(
      "SELECT id, firstName, lastName, email, phoneNumber, createdAt, updatedAt FROM users WHERE isDeleted = false AND isActive = true"
    );
    return rows;
  }

  // ✅ Store OTP in Database
  static async storeOTP(
    email: string,
    otp: string,
    expiresAt: Date
  ): Promise<any> {
    const [result]: any = await pool.query(
      "UPDATE users SET otp = ?, OtpExpiresAt = ? WHERE email = ?",
      [otp, expiresAt, email]
    );
    return result;
  }

  // ✅ Update User Password
  static async updatePassword(
    email: string,
    newPassword: string
  ): Promise<any> {
    const [result]: any = await pool.query(
      "UPDATE users SET password = ? WHERE email = ?",
      [newPassword, email]
    );
    return result;
  }

  // ✅ Clear OTP After Reset
  static async clearOTP(email: string): Promise<any> {
    const [result]: any = await pool.query(
      "UPDATE users SET otp = NULL, OtpExpiresAt = NULL WHERE email = ?",
      [email]
    );
    return result;
  }
}

export default User;
