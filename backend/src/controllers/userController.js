import { query } from '../config/db.js';
import { hashPassword } from '../utils/password.js';

export const getUsers = async (req, res, next) => {
  try {
    const { role, q, page, limit } = req.query;

    let sql = `
      SELECT 
        id,
        name,
        email,
        role,
        phone,
        department,
        shift,
        status,
        avatar_url AS "avatarUrl",
        created_at AS "createdAt",
        updated_at AS "updatedAt",
        COUNT(*) OVER() AS total_count
      FROM users
      WHERE 1=1
    `;
    const params = [];

    if (role && role !== 'All') {
      params.push(role.toLowerCase());
      sql += ` AND LOWER(role) = $${params.length}`;
    }

    if (q && q.trim()) {
      params.push(`%${q.trim().toLowerCase()}%`);
      sql += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(email) LIKE $${params.length} OR LOWER(COALESCE(phone, '')) LIKE $${params.length} OR LOWER(COALESCE(department, '')) LIKE $${params.length})`;
    }

    sql += ` ORDER BY created_at DESC, id DESC`;

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
    const users = result.rows.map(({ total_count, ...u }) => u);

    return res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: pageNum,
      limit: limitNum || total,
      totalPages: limitNum ? Math.ceil(total / limitNum) : 1,
      users,
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role = 'guest', phone, department, shift, status } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    const validRoles = ['admin', 'receptionist', 'kitchen', 'housekeeping', 'guest'];
    if (!validRoles.includes(role.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid role "${role}". Allowed roles: ${validRoles.join(', ')}.`,
      });
    }

    const existing = await query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const hashedPassword = await hashPassword(password);

    const defaultDept = role.toLowerCase() === 'guest' ? 'Guest Services' :
      role.toLowerCase() === 'receptionist' ? 'Front Desk' :
      role.toLowerCase() === 'kitchen' ? 'Kitchen & Dining' :
      role.toLowerCase() === 'housekeeping' ? 'Housekeeping' : 'Management';

    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, phone, department, shift, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING 
        id,
        name,
        email,
        role,
        phone,
        department,
        shift,
        status,
        avatar_url AS "avatarUrl",
        created_at AS "createdAt",
        updated_at AS "updatedAt"`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        hashedPassword,
        role.toLowerCase(),
        phone || null,
        department || defaultDept,
        shift || 'Day Shift (08:00 - 16:30)',
        status || 'Active Duty'
      ]
    );

    const createdUser = result.rows[0];

    // Log admin activity
    await query(
      `INSERT INTO activity_logs (title, category, description, tag)
       VALUES ($1, 'Admin', $2, 'Users')`,
      [
        `New User Created: ${name}`,
        `Admin created ${role.toUpperCase()} account for ${name} (${email}).`,
      ]
    ).catch(() => {});

    return res.status(201).json({
      success: true,
      message: `User account for ${name} created successfully.`,
      user: createdUser,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, phone, password, department, shift, status } = req.body;

    const existingUser = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ success: false, message: `User #${id} not found.` });
    }

    if (email && email.trim().toLowerCase() !== existingUser.rows[0].email.toLowerCase()) {
      const emailCheck = await query(
        'SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND id != $2',
        [email.trim(), id]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Another user account already uses this email address.',
        });
      }
    }

    let passwordHash = existingUser.rows[0].password_hash;
    if (password && password.trim()) {
      passwordHash = await hashPassword(password.trim());
    }

    const validRoles = ['admin', 'receptionist', 'kitchen', 'housekeeping', 'guest'];
    const updatedRole = role ? role.toLowerCase() : existingUser.rows[0].role;
    if (role && !validRoles.includes(updatedRole)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role "${role}". Allowed roles: ${validRoles.join(', ')}.`,
      });
    }

    const result = await query(
      `UPDATE users
       SET 
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        password_hash = $3,
        role = COALESCE($4, role),
        phone = COALESCE($5, phone),
        department = COALESCE($6, department),
        shift = COALESCE($7, shift),
        status = COALESCE($8, status),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING 
        id,
        name,
        email,
        role,
        phone,
        department,
        shift,
        status,
        avatar_url AS "avatarUrl",
        created_at AS "createdAt",
        updated_at AS "updatedAt"`,
      [
        name ? name.trim() : null,
        email ? email.trim().toLowerCase() : null,
        passwordHash,
        updatedRole,
        phone !== undefined ? phone : null,
        department !== undefined ? department : null,
        shift !== undefined ? shift : null,
        status !== undefined ? status : null,
        id,
      ]
    );

    const updatedUser = result.rows[0];

    // Log admin activity
    await query(
      `INSERT INTO activity_logs (title, category, description, tag)
       VALUES ($1, 'Admin', $2, 'Users')`,
      [
        `User Account Updated: ${updatedUser.name}`,
        `Details and permissions updated for ${updatedUser.email} (Role: ${updatedUser.role}).`,
      ]
    ).catch(() => {});

    return res.status(200).json({
      success: true,
      message: `User ${updatedUser.name} updated successfully.`,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting their own logged-in account
    if (req.user && parseInt(req.user.id, 10) === parseInt(id, 10)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own active administrator account.',
      });
    }

    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id, name, email, role', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `User #${id} not found.` });
    }

    const deletedUser = result.rows[0];

    // Log admin activity
    await query(
      `INSERT INTO activity_logs (title, category, description, tag)
       VALUES ($1, 'Admin', $2, 'Users')`,
      [
        `User Account Deleted: ${deletedUser.name}`,
        `Deleted ${deletedUser.role.toUpperCase()} account for ${deletedUser.email}.`,
      ]
    ).catch(() => {});

    return res.status(200).json({
      success: true,
      message: `User account for ${deletedUser.name} (${deletedUser.email}) has been permanently deleted.`,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
