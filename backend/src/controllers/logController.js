import { query } from '../config/db.js';

export const getLogs = async (req, res, next) => {
  try {
    const { limit, page, category } = req.query;

    let sql = `
      SELECT 
        id,
        title,
        category,
        description,
        tag,
        TO_CHAR(created_at, 'Mon DD, HH12:MI AM') AS "time",
        created_at AS "createdAt",
        COUNT(*) OVER() AS total_count
      FROM activity_logs
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== 'All') {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    sql += ` ORDER BY created_at DESC`;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = limit ? parseInt(limit, 10) : null;

    if (limitNum && limitNum > 0) {
      params.push(limitNum);
      sql += ` LIMIT $${params.length}`;
      params.push((pageNum - 1) * limitNum);
      sql += ` OFFSET $${params.length}`;
    }

    const result = await query(sql, params);
    const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count, 10) : 0;
    const logs = result.rows.map(({ total_count, ...l }) => l);

    return res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: pageNum,
      limit: limitNum || total,
      totalPages: limitNum ? Math.ceil(total / limitNum) : 1,
      logs,
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
