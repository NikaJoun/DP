const Event = require('../models/eventModel');
const Task = require('../models/taskModel');
const db = require('../config/db');
const fs = require('fs');

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.getAll();
    res.json(events);
  } catch (error) {
    console.error('Ошибка при получении мероприятий:', error);
    res.status(500).json({ message: 'Ошибка при получении мероприятий' });
  }
};

exports.getEventWithTasks = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.getById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Мероприятие не найдено' });
    }

  const tasks = await Task.getByEventId(eventId);
    res.json({ ...event, tasks });
  } catch (error) {
    console.error('Ошибка при получении мероприятия:', error);
    res.status(500).json({ message: 'Ошибка при получении мероприятия' });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;
    const image = req.file;

    if (isNaN(new Date(startDate)) || isNaN(new Date(endDate))) {
      return res.status(400).json({ message: 'Неверный формат даты' });
    }

    if (!title || !description || !startDate || !endDate) {
      if (image) fs.unlinkSync(image.path);
      return res.status(400).json({ message: 'Все поля обязательны' });
    }

    if (new Date(endDate) < new Date(startDate)) {
      if (image) fs.unlinkSync(image.path);
      return res.status(400).json({ 
        message: 'Дата окончания не может быть раньше даты начала' 
      });
    }

    const [overlappingEvents] = await db.query(
      `SELECT id FROM events 
      WHERE (start_date <= ? AND end_date >= ?) 
      OR (start_date BETWEEN ? AND ?)
      OR (end_date BETWEEN ? AND ?)`,
      [endDate, startDate, startDate, endDate, startDate, endDate]
    );

    if (overlappingEvents.length > 0) {
      if (image) fs.unlinkSync(image.path);
      return res.status(400).json({ 
        message: 'Уже есть мероприятие в указанный период времени' 
      });
    }

    const imagePath = image ? `/uploads/events/${image.filename}` : null;

    const eventId = await Event.create({
      title,
      description,
      startDate,
      endDate,
      imagePath
    });

    res.status(201).json({ message: 'Мероприятие создано', eventId });
  } catch (error) {
    console.error('Ошибка при создании мероприятия:', error);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Ошибка при создании мероприятия' });
  }
};

exports.addTaskToEvent = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const { task_number, title, short_description, instructions, release_date } = req.body;
    const icon = req.file;

    if (!task_number || !title || !short_description || !instructions || !release_date || !icon) {
      return res.status(400).json({ message: 'Все поля задания обязательны' });
    }

    const taskId = await Task.create(eventId, {
      taskNumber: task_number, 
      title,
      shortDescription: short_description,
      instructions,
      iconPath: `/uploads/event-tasks/${icon.filename}`,
      releaseDate: release_date
    });

    res.status(201).json({ message: 'Задание добавлено', taskId });
  } catch (error) {
    console.error('Ошибка при добавлении задания:', error);
    res.status(500).json({ message: 'Ошибка при добавлении задания' });
  }
};

exports.getEventTasks = async (req, res) => {
    try {
      const eventId = req.params.id;
      const tasks = await Task.getByEventId(eventId);
      res.json(tasks);
    } catch (error) {
      console.error('Ошибка при получении заданий:', error);
      res.status(500).json({ message: 'Ошибка при получении заданий' });
    }
};

exports.updateTask = async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const taskId = parseInt(req.params.taskId);
    
    const existingTask = await Task.getById(taskId);
    if (!existingTask) {
      return res.status(404).json({ message: 'Задание не найдено' });
    }

    const { task_number, title, short_description, instructions, release_date } = req.body;
    const icon = req.file;

    if (!task_number || !title || !short_description || !instructions || !release_date) {
      return res.status(400).json({ message: 'Все поля обязательны' });
    }

    let iconPath = existingTask.icon_path;
    
    if (icon) {
      if (existingTask.icon_path) {
        const fs = require('fs');
        const path = require('path');
        const oldIconPath = path.join(__dirname, '../..', existingTask.icon_path);
        if (fs.existsSync(oldIconPath)) {
          fs.unlinkSync(oldIconPath);
        }
      }
      iconPath = `/uploads/event-tasks/${icon.filename}`;
    }

    const event = await Event.getById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Мероприятие не найдено' });
    }

    const releaseDate = new Date(release_date);
    const eventStart = new Date(event.start_date);
    const eventEnd = new Date(event.end_date);

    if (releaseDate < eventStart || releaseDate > eventEnd) {
      if (icon) fs.unlinkSync(icon.path);
      return res.status(400).json({ 
        message: 'Дата релиза задания должна быть в пределах дат мероприятия' 
      });
    }

    await Task.update(taskId, {
      taskNumber: task_number,
      title,
      shortDescription: short_description,
      instructions,
      iconPath,
      releaseDate: release_date
    });

    res.json({ 
      success: true,
      message: 'Задание успешно обновлено',
      task: await Task.getById(taskId)
    });
  } catch (error) {
    console.error('Ошибка при обновлении задания:', error);
    res.status(500).json({ 
      success: false,
      message: 'Ошибка при обновлении задания',
      error: error.message,
      ...(error.sqlMessage && { sqlMessage: error.sqlMessage })
    });
  }
};
  
exports.deleteTask = async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const taskId = parseInt(req.params.taskId);
  
      if (!eventId || !taskId) {
        return res.status(400).json({ message: 'Неверные параметры запроса' });
      }
  
      await Task.delete(taskId);
      res.json({ message: 'Задание успешно удалено' });
    } catch (error) {
      console.error('Ошибка при удалении задания:', error);
      res.status(500).json({ message: 'Ошибка при удалении задания' });
    }
};

exports.updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { title, description, startDate, endDate } = req.body;
    const image = req.file;

    const existingEvent = await Event.getById(eventId);
    if (!existingEvent) {
      if (image) fs.unlinkSync(image.path);
      return res.status(404).json({ message: 'Мероприятие не найдено' });
    }

    const newStartDate = startDate || existingEvent.start_date;
    const newEndDate = endDate || existingEvent.end_date;

    if (new Date(newEndDate) < new Date(newStartDate)) {
      if (image) fs.unlinkSync(image.path);
      return res.status(400).json({ 
        message: 'Дата окончания не может быть раньше даты начала' 
      });
    }

    const [overlappingEvents] = await db.query(
      `SELECT id FROM events 
      WHERE id != ? 
      AND (
        (start_date <= ? AND end_date >= ?) 
        OR (start_date BETWEEN ? AND ?)
        OR (end_date BETWEEN ? AND ?)
      )`,
      [eventId, newEndDate, newStartDate, newStartDate, newEndDate, newStartDate, newEndDate]
    );

    if (overlappingEvents.length > 0) {
      if (image) fs.unlinkSync(image.path);
      return res.status(400).json({ 
        message: 'Уже есть мероприятие в указанный период времени' 
      });
    }

    let imagePath = existingEvent.image_path;
    if (image) {
      if (existingEvent.image_path) {
        const oldImagePath = path.join(__dirname, '../..', existingEvent.image_path);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      imagePath = `/uploads/events/${image.filename}`;
    }

    await Event.update(eventId, {
      title: title || existingEvent.title,
      description: description || existingEvent.description,
      startDate: newStartDate,
      endDate: newEndDate, 
      image_path: imagePath
    });

    res.json({ message: 'Мероприятие успешно обновлено' });
  } catch (error) {
    console.error('Ошибка при обновлении мероприятия:', error);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Ошибка при обновлении мероприятия' });
  }
};
  
exports.deleteEvent = async (req, res) => {
    try {
      const eventId = req.params.id;
      
      const existingEvent = await Event.getById(eventId);
      if (!existingEvent) {
        return res.status(404).json({ message: 'Мероприятие не найдено' });
      }
  
      if (existingEvent.image_path) {
        const fs = require('fs');
        const path = require('path');
        const imagePath = path.join(__dirname, '../..', existingEvent.image_path);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
  
      await Event.delete(eventId);
      
      res.json({ message: 'Мероприятие успешно удалено' });
    } catch (error) {
      console.error('Ошибка при удалении мероприятия:', error);
      res.status(500).json({ message: 'Ошибка при удалении мероприятия' });
    }
};

exports.getTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const task = await Task.getById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Задание не найдено' });
    }

    res.json(task);
  } catch (error) {
    console.error('Ошибка при получении задания:', error);
    res.status(500).json({ message: 'Ошибка при получении задания' });
  }
};