const db = require('../config/db');
const PDFDocument = require('pdfkit');
const { Document, Paragraph, TextRun, Packer, Table, TableRow, TableCell } = require('docx');

class ReportController {
  static PERIODS = {
    TODAY: 'today',
    THIS_WEEK: 'this_week',
    THIS_MONTH: 'this_month',
    THIS_YEAR: 'this_year',
    CUSTOM: 'custom'
  };

  static async generateUserReports(req, res) {
    try {
      const { period = '', startDate = '', endDate = '' } = req.query;
      const reportData = await ReportController.getUserReportData(period, startDate, endDate);
      res.json(reportData);
    } catch (error) {
      console.error('Ошибка при генерации отчетов по участникам:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  static async generatePostReports(req, res) {
    try {
      const { period = '', startDate = '', endDate = '' } = req.query;
      const reportData = await ReportController.getPostReportData(period, startDate, endDate);
      res.json(reportData);
    } catch (error) {
      console.error('Ошибка при генерации отчетов по произведениям:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  static async exportReport(req, res) {
    try {
      const { type, format } = req.params;
      const { period = '', startDate = '', endDate = '' } = req.query;
      let reportData;

      if (type === 'users') {
        reportData = await ReportController.getUserReportData(period, startDate, endDate);
      } else if (type === 'posts') {
        reportData = await ReportController.getPostReportData(period, startDate, endDate);
      } else {
        return res.status(400).json({ error: 'Неверный тип отчета' });
      }

      if (format === 'pdf') {
        await ReportController.generatePDF(reportData, type, res);
      } else if (format === 'word') {
        await ReportController.generateWord(reportData, type, res);
      } else {
        return res.status(400).json({ error: 'Неверный формат экспорта' });
      }
    } catch (error) {
      console.error('Ошибка при экспорте отчета:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  static async getUserReportData(period = '', startDate = '', endDate = '') {
    const whereClause = ReportController.buildWhereClause(period, startDate, endDate, 'p');
    
    const [activeUsers] = await db.query(`
      SELECT COUNT(DISTINCT user_id) as active_users_count
      FROM posts p
      WHERE status = 'published' ${whereClause}
    `);

    const [avgRating] = await db.query(`
      SELECT AVG(p.rating) as avg_user_rating
      FROM posts p
      WHERE p.status = 'published' ${whereClause}
    `);

    const [mostActiveUsers] = await db.query(`
      SELECT 
        u.id, 
        u.username, 
        COUNT(p.id) as posts_count,
        AVG(p.rating) as avg_rating,
        SUM(p.views) as total_views
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id AND p.status = 'published' ${whereClause}
      GROUP BY u.id
      HAVING COUNT(p.id) > 0
      ORDER BY posts_count DESC, total_views DESC
      LIMIT 10
    `);

    return {
      activeUsersCount: activeUsers[0].active_users_count,
      averageUserRating: parseFloat(avgRating[0].avg_user_rating || 0).toFixed(2),
      mostActiveUsers: mostActiveUsers.map(user => ({
        ...user,
        avg_rating: parseFloat(user.avg_rating || 0).toFixed(2)
      })),
      period: ReportController.getPeriodDescription(period, startDate, endDate)
    };
  }

  static async getPostReportData(period = '', startDate = '', endDate = '') {
    const whereClause = ReportController.buildWhereClause(period, startDate, endDate, 'p');
    
    const [totalViews] = await db.query(`
      SELECT SUM(views) as total_views
      FROM posts p
      WHERE status = 'published' ${whereClause}
    `);

    const [avgRating] = await db.query(`
      SELECT AVG(rating) as avg_rating
      FROM posts p
      WHERE status = 'published' ${whereClause}
    `);

      const [popularPosts] = await db.query(`
        SELECT 
          p.id,
          p.title,
          p.views,
          p.rating,
          u.username as author,
          p.created_at
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE 
          p.status = 'published' 
          ${whereClause}
          AND p.views >= 5
          AND p.rating >= 1
        ORDER BY (LOG(1 + p.views) * 0.5 + p.rating * 0.5) DESC
        LIMIT 10
      `);

    return {
      totalViews: totalViews[0].total_views || 0,
      averagePostRating: parseFloat(avgRating[0].avg_rating || 0).toFixed(2),
      popularPosts: popularPosts.map(post => ({
        ...post,
        rating: parseFloat(post.rating || 0).toFixed(2)
      })),
      period: ReportController.getPeriodDescription(period, startDate, endDate)
    };
  }

  static buildWhereClause(period, startDate, endDate, tableAlias = '') {
    let whereClause = '';
    const alias = tableAlias ? `${tableAlias}.` : '';
    
    if (period === ReportController.PERIODS.TODAY) {
      whereClause = ` AND DATE(${alias}created_at) = CURDATE()`;
    } else if (period === ReportController.PERIODS.THIS_WEEK) {
      whereClause = ` AND YEARWEEK(${alias}created_at, 1) = YEARWEEK(CURDATE(), 1)`;
    } else if (period === ReportController.PERIODS.THIS_MONTH) {
      whereClause = ` AND MONTH(${alias}created_at) = MONTH(CURDATE()) AND YEAR(${alias}created_at) = YEAR(CURDATE())`;
    } else if (period === ReportController.PERIODS.THIS_YEAR) {
      whereClause = ` AND YEAR(${alias}created_at) = YEAR(CURDATE())`;
    } else if (period === ReportController.PERIODS.CUSTOM && startDate && endDate) {
      whereClause = ` AND DATE(${alias}created_at) BETWEEN '${startDate}' AND '${endDate}'`;
    }
    
    return whereClause;
  }

  static getPeriodDescription(period, startDate, endDate) {
    switch (period) {
      case ReportController.PERIODS.TODAY:
        return 'За сегодня';
      case ReportController.PERIODS.THIS_WEEK:
        return 'За текущую неделю';
      case ReportController.PERIODS.THIS_MONTH:
        return 'За текущий месяц';
      case ReportController.PERIODS.THIS_YEAR:
        return 'За текущий год';
      case ReportController.PERIODS.CUSTOM:
        return `За период с ${startDate} по ${endDate}`;
      default:
        return 'За все время';
    }
  }

  static async generatePDF(reportData, type, res) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const date = new Date().toLocaleDateString('ru-RU');
        const filename = `${type}_report_${date}.pdf`.replace(/ /g, '_');

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

        doc.registerFont('Roboto', 'fonts/Roboto-Regular.ttf');
        doc.font('Roboto');

        doc.pipe(res);

        doc.fontSize(20)
          .text(type === 'users' ? 'Отчет по участникам' : 'Отчет по произведениям', {
            align: 'center'
          });
        doc.moveDown();

        doc.fontSize(12)
          .text(`Период: ${reportData.period}`, { align: 'left' })
          .text(`Дата генерации: ${date}`, { align: 'right' });
        doc.moveDown(2);

        if (type === 'users') {
          doc.fontSize(16).text('Общая статистика:');
          doc.fontSize(12)
            .text(`Активных участников: ${reportData.activeUsersCount}`)
            .text(`Средний рейтинг: ${reportData.averageUserRating}`);
          doc.moveDown();

          doc.fontSize(16).text('Самые активные участники:');
          this.generateUserTable(doc, reportData.mostActiveUsers);
        } else {
          doc.fontSize(16).text('Общая статистика:');
          doc.fontSize(12)
            .text(`Всего просмотров: ${reportData.totalViews}`)
            .text(`Средний рейтинг: ${reportData.averagePostRating}`);
          doc.moveDown();

          doc.fontSize(16).text('Самые популярные произведения:');
          this.generatePostTable(doc, reportData.popularPosts);
        }

        doc.end();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  static generateUserTable(doc, users) {
    const tableTop = doc.y + 20;
    const col1 = 50;
    const col2 = 150;
    const col3 = 250;
    const col4 = 350;
    const col5 = 450;
    doc.registerFont('Roboto', 'fonts/Roboto-Regular.ttf');
    doc.registerFont('Roboto-Bold', 'fonts/Roboto-Bold.ttf');

    doc.font('Roboto-Bold')
      .fontSize(12)
      .text('ID', col1, tableTop)
      .text('Имя', col2, tableTop)
      .text('Публикации', col3, tableTop)
      .text('Рейтинг', col4, tableTop)
      .text('Просмотры', col5, tableTop);

    let y = tableTop + 25;
    doc.font('Roboto')
       .fontSize(10);

    users.forEach(user => {
      const safeToString = (val) => val !== null ? val.toString() : "N/A";

      doc.text(safeToString(user.id), col1, y)
         .text(safeToString(user.username), col2, y)
         .text(safeToString(user.posts_count), col3, y)
         .text(safeToString(user.avg_rating), col4, y)
         .text(safeToString(user.total_views), col5, y);
      y += 25;
    });
  }

  static generatePostTable(doc, posts) {
    const tableTop = doc.y + 20;
    const col1 = 50;
    const col2 = 100;
    const col3 = 250;
    const col4 = 350;
    const col5 = 400;
    const col6 = 450;

    doc.registerFont('Roboto', 'fonts/Roboto-Regular.ttf');
    doc.registerFont('Roboto-Bold', 'fonts/Roboto-Bold.ttf');

    doc.font('Roboto-Bold')
      .fontSize(10)
      .text('ID', col1, tableTop)
      .text('Название', col2, tableTop)
      .text('Автор', col3, tableTop)
      .text('Просмотры', col4, tableTop)
      .text('Рейтинг', col5, tableTop)
      .text('Дата', col6, tableTop);

    let y = tableTop + 25;
    doc.font('Roboto')
      .fontSize(10);

    posts.forEach(post => {
      doc.text(post.id.toString(), col1, y)
        .text(post.title, col2, y, { width: 140 })
        .text(post.author, col3, y, { width: 90 })
        .text(post.views.toString(), col4, y)
        .text(post.rating, col5, y)
        .text(new Date(post.created_at).toLocaleDateString(), col6, y);
      y += 25;
    });
  }

  static async generateWord(reportData, type, res) {
    try {
      const date = new Date().toLocaleDateString();
      const filename = `${type}_report_${date}.docx`.replace(/ /g, '_');

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${type === 'users' ? 'Отчет по участникам' : 'Отчет по произведениям'}`,
                  bold: true,
                  size: 28
                })
              ],
              alignment: "center"
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Период: ${reportData.period}`,
                  size: 22
                })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Дата генерации: ${date}`,
                  size: 22
                })
              ],
              alignment: "right"
            }),
            new Paragraph({ text: "", spacing: { after: 400 } }),
            ...ReportController.generateWordContent(reportData, type)
          ]
        }]
      });

      const buffer = await Packer.toBuffer(doc);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      throw error;
    }
  }

  static generateWordContent(reportData, type) {
    const content = [];

    if (type === 'users') {
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Общая статистика:",
              bold: true,
              size: 24
            })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Активных участников: ${reportData.activeUsersCount}`,
              size: 22
            })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Средний рейтинг: ${reportData.averageUserRating}`,
              size: 22
            })
          ]
        }),
        new Paragraph({ text: "", spacing: { after: 400 } }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Самые активные участники:",
              bold: true,
              size: 24
            })
          ]
        })
      );

      const userRows = reportData.mostActiveUsers.map(user => [
        user.id.toString(),
        user.username,
        user.posts_count.toString(),
        user.avg_rating,
        user.total_views.toString()
      ]);

      content.push(ReportController.generateWordTable(
        ["ID", "Имя", "Публикации", "Рейтинг", "Просмотры"],
        userRows
      )[0]);
    } else {
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Общая статистика:",
              bold: true,
              size: 24
            })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Всего просмотров: ${reportData.totalViews}`,
              size: 22
            })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Средний рейтинг: ${reportData.averagePostRating}`,
              size: 22
            })
          ]
        }),
        new Paragraph({ text: "", spacing: { after: 400 } }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Самые популярные произведения:",
              bold: true,
              size: 24
            })
          ]
        })
      );

      const postRows = reportData.popularPosts.map(post => [
        post.id.toString(),
        post.title,
        post.author,
        post.views.toString(),
        post.rating,
        new Date(post.created_at).toLocaleDateString()
      ]);

      content.push(ReportController.generateWordTable(
        ["ID", "Название", "Автор", "Просмотры", "Рейтинг", "Дата"],
        postRows
      )[0]);
    }

    return content;
  }

  static generateWordTable(headers, rows) {
    const { Table, TableRow, TableCell, Paragraph, TextRun } = require('docx');

    const tableRows = [
      new TableRow({
        children: headers.map(header => 
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({
                text: header,
                bold: true,
                size: 20
              })]
            })]
          })
        )
      }),
      ...rows.map(row => 
        new TableRow({
          children: row.map(cell => 
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({
                  text: cell,
                  size: 18
                })]
              })]
            })
          )
        })
      )
    ];

    return [
      new Table({
        rows: tableRows,
        width: {
          size: 100,
          type: 'pct'
        }
      })
    ];
  }
}

module.exports = ReportController;