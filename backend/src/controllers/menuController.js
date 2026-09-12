import { query } from '../config/db.js';

export const getMenu = async (req, res, next) => {
  try {
    const { category } = req.query;

    let sql = `
      SELECT 
        id,
        name,
        category,
        price::FLOAT AS price,
        prep_time AS "prepTime",
        in_stock AS "inStock",
        description,
        calories,
        image_url AS "image"
      FROM menu_items
    `;
    const params = [];

    if (category && category !== 'All') {
      params.push(category);
      sql += ` WHERE category = $1`;
    }

    sql += ` ORDER BY id ASC`;

    const result = await query(sql, params);

    return res.status(200).json({
      success: true,
      count: result.rowCount,
      menu: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const createMenuItem = async (req, res, next) => {
  try {
    const { name, category, price, prepTime, inStock, description, calories, image } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, and price are required.',
      });
    }

    const result = await query(
      `INSERT INTO menu_items (name, category, price, prep_time, in_stock, description, calories, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING 
        id,
        name,
        category,
        price::FLOAT AS price,
        prep_time AS "prepTime",
        in_stock AS "inStock",
        description,
        calories,
        image_url AS "image"`,
      [
        name.trim(),
        category.trim(),
        parseFloat(price),
        prepTime || '15-20 mins',
        inStock !== undefined ? inStock : true,
        description || '',
        calories || '',
        image || '',
      ]
    );

    await query(
      `INSERT INTO activity_logs (title, category, description, tag)
       VALUES ($1, 'Kitchen', $2, 'Menu')`,
      [`New Menu Item: ${name}`, `Added ${name} to ${category} section at $${price}.`]
    );

    return res.status(201).json({
      success: true,
      message: `${name} added to menu catalog.`,
      item: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, price, prepTime, inStock, description, calories, image } = req.body;

    const result = await query(
      `UPDATE menu_items 
       SET 
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        price = COALESCE($3, price),
        prep_time = COALESCE($4, prep_time),
        in_stock = COALESCE($5, in_stock),
        description = COALESCE($6, description),
        calories = COALESCE($7, calories),
        image_url = COALESCE($8, image_url),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING 
        id,
        name,
        category,
        price::FLOAT AS price,
        prep_time AS "prepTime",
        in_stock AS "inStock",
        description,
        calories,
        image_url AS "image"`,
      [
        name,
        category,
        price !== undefined ? parseFloat(price) : null,
        prepTime,
        inStock,
        description,
        calories,
        image,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Menu item ${id} not found.` });
    }

    return res.status(200).json({
      success: true,
      message: 'Menu item updated successfully.',
      item: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const toggleStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const itemRes = await query('SELECT in_stock, name FROM menu_items WHERE id = $1', [id]);

    if (itemRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Menu item ${id} not found.` });
    }

    const currentStock = itemRes.rows[0].in_stock;
    const newStock = !currentStock;

    const result = await query(
      `UPDATE menu_items 
       SET in_stock = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2
       RETURNING 
        id,
        name,
        category,
        price::FLOAT AS price,
        prep_time AS "prepTime",
        in_stock AS "inStock",
        description,
        calories,
        image_url AS "image"`,
      [newStock, id]
    );

    await query(
      `INSERT INTO activity_logs (title, category, description, tag)
       VALUES ($1, 'Kitchen', $2, 'Inventory')`,
      [
        `Dish Stock Changed: ${itemRes.rows[0].name}`,
        `${itemRes.rows[0].name} marked as ${newStock ? 'In Stock' : '86ed / Out of Stock'}.`,
      ]
    );

    return res.status(200).json({
      success: true,
      message: `${itemRes.rows[0].name} is now ${newStock ? 'in stock' : 'out of stock'}.`,
      item: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM menu_items WHERE id = $1 RETURNING name', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Menu item ${id} not found.` });
    }

    return res.status(200).json({
      success: true,
      message: `${result.rows[0].name} deleted from menu catalog.`,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getMenu,
  createMenuItem,
  updateMenuItem,
  toggleStock,
  deleteMenuItem,
};
