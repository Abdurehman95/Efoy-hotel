import { query } from '../config/db.js';

export const getLogs = async (req, res, next) => {
  try {
    const { limit = 50, category } = req.query;

    let sql = `
      SELECT 
        id,
        title,
        category,
        description,
        tag,
        TO_CHAR(created_at, 'Mon DD, HH12:MI AM') AS "time",
        created_at AS "createdAt"
      FROM activity_logs
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== 'All') {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    params.push(parseInt(limit, 10));
    sql += ` ORDER BY created_at DESC LIMIT $${params.length}`;

    const result = await query(sql, params);

    return res.status(200).json({
      success: true,
      count: result.rowCount,
      logs: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const createLog = async (req, res, next) => {
  try {
    const { title, category, description, tag } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, and description are required.',
      });
    }

    const result = await query(
      `INSERT INTO activity_logs (title, category, description, tag)
       VALUES ($1, $2, $3, $4)
       RETURNING 
        id,
        title,
        category,
        description,
        tag,
        TO_CHAR(created_at, 'Mon DD, HH12:MI AM') AS "time",
        created_at AS "createdAt"`,
      [title, category, description, tag || category]
    );

    return res.status(201).json({
      success: true,
      log: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getLogs,
  createLog,
};
