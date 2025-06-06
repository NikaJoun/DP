const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authenticateToken = require('../middleware/authMiddleware'); 
const authorizeRole = require('../middleware/roleMiddleware'); 
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const eventImageDir = path.join(__dirname, '../uploads/events');
const taskIconDir = path.join(__dirname, '../uploads/event-tasks');
fs.mkdirSync(eventImageDir, { recursive: true });
fs.mkdirSync(taskIconDir, { recursive: true });

const eventImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, eventImageDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const taskIconStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, taskIconDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const uploadEventImage = multer({ storage: eventImageStorage });
const uploadTaskIcon = multer({ storage: taskIconStorage });

router.get('/events', eventController.getAllEvents);
router.get('/events/:id', eventController.getEventWithTasks);
router.post('/events', authenticateToken, authorizeRole([1]), uploadEventImage.single('image'), eventController.createEvent);
router.post('/events/:id/tasks', authenticateToken, authorizeRole([1]), uploadTaskIcon.single('icon'), eventController.addTaskToEvent);
router.put('/events/:id', authenticateToken, authorizeRole([1]), uploadEventImage.single('image'), eventController.updateEvent);
router.delete('/events/:id', authenticateToken, authorizeRole([1]), eventController.deleteEvent);
router.get('/events/:id/tasks', authenticateToken, eventController.getEventTasks);
router.get('/events/:eventId/tasks/:taskId', authenticateToken, eventController.getTask);
router.put('/events/:eventId/tasks/:taskId', authenticateToken, authorizeRole([1]), uploadTaskIcon.single('icon'), eventController.updateTask);
router.delete('/events/:eventId/tasks/:taskId', authenticateToken, authorizeRole([1]), eventController.deleteTask);

module.exports = router;
