const db = require('../config/db');
const fs = require('fs');
const path = require('path');

class Event {
  static async create({ title, description, startDate, endDate, imagePath }) {
    const [result] = await db.query(
      'INSERT INTO events SET ?', 
      {
        title,
        description,
        start_date: startDate,
        end_date: endDate,
        image_path: imagePath
      }
    );
    return result.insertId;
  }
  
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM events ORDER BY start_date DESC');
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.query('SELECT * FROM events WHERE id = ?', [id]);
    return rows[0];
  }

  static async update(id, { title, description, startDate, endDate, image_path }) {
    const query = `
      UPDATE events 
      SET 
        title = ?,
        description = ?,
        start_date = ?,
        end_date = ?,
        image_path = ?
      WHERE id = ?
    `;
    await db.query(query, [
      title, 
      description, 
      startDate,
      endDate,
      image_path, 
      id
    ]);
  }

  static async delete(id) {
    await db.query('DELETE FROM events WHERE id = ?', [id]);
  }
}

module.exports = Event;