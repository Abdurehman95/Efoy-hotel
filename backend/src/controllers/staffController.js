import { query } from '../config/db.js';

export const getStaff = async (req, res, next) => {
  try {
    const { department, status } = req.query;

    let sql = `
      SELECT 
        id,
        name,
        email,
        role,
        department,
        shift,
        status,
        avatar_bg AS "avatarBg"
      FROM staff
      WHERE 1=1
    `;
    const params = [];

    if (department && department !== 'All') {
      params.push(department);
      sql += ` AND department = $${params.length}`;
    }

    if (status && status !== 'All') {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }

    sql += ` ORDER BY id ASC`;

    const result = await query(sql, params);

    return res.status(200).json({
      success: true,
      count: result.rowCount,
      staff: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const createStaff = async (req, res, next) => {
  try {
    const { name, email, role, department, shift, status, avatarBg } = req.body;

    if (!name || !email || !role || !department || !shift) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, role, department, and shift are required.',
      });
    }

    const existing = await query('SELECT id FROM staff WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Staff member with this email already exists.',
      });
    }

    const result = await query(
      `INSERT INTO staff (name, email, role, department, shift, status, avatar_bg)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING 
        id,
        name,
        email,
        role,
        department,
        shift,
        status,
        avatar_bg AS "avatarBg"`,
      [
        name.trim(),
        email.trim(),
        role.trim(),
        department.trim(),
        shift.trim(),
        status || 'Active Duty',
        avatarBg || 'bg-amber-100 text-amber-800',
      ]
    );

    await query(
      `INSERT INTO activity_logs (title, category, description, tag)
       VALUES ($1, 'Admin', $2, 'Staff')`,
      [`New Staff Enrolled: ${name}`, `${name} joined as ${role} in ${department} department.`]
    );

    return res.status(201).json({
      success: true,
      message: `Staff member ${name} created successfully.`,
      staff: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const updateStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, department, shift, status, avatarBg } = req.body;

    const result = await query(
      `UPDATE staff 
       SET 
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        role = COALESCE($3, role),
        department = COALESCE($4, department),
        shift = COALESCE($5, shift),
        status = COALESCE($6, status),
        avatar_bg = COALESCE($7, avatar_bg),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING 
        id,
        name,
        email,
        role,
        department,
        shift,
        status,
        avatar_bg AS "avatarBg"`,
      [name, email, role, department, shift, status, avatarBg, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Staff member ${id} not found.` });
    }

    return res.status(200).json({
      success: true,
      message: 'Staff member updated successfully.',
      staff: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM staff WHERE id = $1 RETURNING name', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Staff member ${id} not found.` });
    }

    return res.status(200).json({
      success: true,
      message: `${result.rows[0].name} removed from staff directory.`,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
};
