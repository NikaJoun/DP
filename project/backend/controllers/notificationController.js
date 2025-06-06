const Notification = require('../models/notificationModel');

class NotificationController {
  static async createNotification(req, res) {
    try {
      const { userId, senderId, type, postId = null } = req.body;
      
      if (!userId || !senderId || !type) {
        return res.status(400).json({ 
          success: false,
          error: 'Missing required fields: userId, senderId, type' 
        });
      }

      const notificationId = await Notification.create(userId, senderId, type, postId);
      
      res.status(201).json({
        success: true,
        notificationId,
        message: 'Notification created successfully'
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  }

  static async getUserNotifications(req, res) {
    try {
      const userId = req.userId;
      const { limit = 20, offset = 0, unreadOnly = false } = req.query;

      const notifications = await Notification.getByUserId(userId, { 
        limit: parseInt(limit),
        offset: parseInt(offset),
        unreadOnly: unreadOnly === 'true'
      });

      res.json({
        success: true,
        notifications,
        count: notifications.length
      });
    } catch (error) {
      console.error('Error getting notifications:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to get notifications' 
      });
    }
  }

  static async getUnreadCount(req, res) {
    try {
      const userId = req.userId;
      const count = await Notification.getUnreadCount(userId);
      
      res.json({
        success: true,
        count
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to get unread count' 
      });
    }
  }

  static async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.userId;

      const affectedRows = await Notification.markAsRead(notificationId, userId);
      
      if (affectedRows === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'Notification not found or already read' 
        });
      }

      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to mark notification as read' 
      });
    }
  }

  static async markAllAsRead(req, res) {
    try {
      const userId = req.userId;
      const affectedRows = await Notification.markAllAsRead(userId);
      
      res.json({
        success: true,
        message: `Marked ${affectedRows} notifications as read`
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to mark all notifications as read' 
      });
    }
  }

  static async checkNewNotifications(req, res) {
    try {
      const userId = req.userId;
      const lastChecked = new Date(req.query.lastChecked || 0);
      
      const hasNew = await Notification.checkNewNotifications(userId, lastChecked);
      
      res.json({
        success: true,
        hasNew
      });
    } catch (error) {
      console.error('Error checking new notifications:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to check new notifications' 
      });
    }
  }

  static async cleanOldNotifications(req, res) {
    try {
      const { days = 30 } = req.query;
      const deletedCount = await Notification.deleteOldNotifications(days);
      
      res.json({
        success: true,
        message: `Deleted ${deletedCount} old notifications`
      });
    } catch (error) {
      console.error('Error cleaning old notifications:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to clean old notifications' 
      });
    }
  }
}

module.exports = NotificationController;