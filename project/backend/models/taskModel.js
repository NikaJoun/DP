const db = require('../config/db');

class Task {
  static async create(eventId, taskData) {
    const { taskNumber, title, shortDescription, instructions, iconPath, releaseDate } = taskData;
    const query = `
      INSERT INTO tasks (event_id, task_number, title, short_description, instructions, icon_path, release_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      eventId, 
      taskNumber, 
      title, 
      shortDescription, 
      instructions,  
      iconPath, 
      releaseDate
    ]);
    return result.insertId;
  }

  static async getByEventId(eventId) {
    const [rows] = await db.execute('SELECT * FROM tasks WHERE event_id = ? ORDER BY task_number', [eventId]);
    return rows;
  }

  static async getById(taskId) {
    const [rows] = await db.execute('SELECT * FROM tasks WHERE id = ?', [taskId]);
    return rows[0];
  }

  static async update(taskId, taskData) {
    const { taskNumber, title, shortDescription, instructions, iconPath, releaseDate } = taskData;
    const query = `
      UPDATE tasks 
      SET 
        task_number = ?,
        title = ?,
        short_description = ?,
        instructions = ?,
        icon_path = ?,
        release_date = ?
      WHERE id = ?
    `;
    const params = [
      taskNumber, 
      title, 
      shortDescription, 
      instructions, 
      iconPath || null,
      new Date(releaseDate),
      taskId
    ];
    
    await db.execute(query, params);
  }

  static async delete(taskId) {
    await db.execute('DELETE FROM tasks WHERE id = ?', [taskId]);
  }
}

module.exports = Task;