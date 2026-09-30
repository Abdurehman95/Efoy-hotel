import { pool, query } from '../config/db.js';
import { emitPmsEvent } from '../socket.js';

export const getInventory = async (req, res, next) => {
  try {
    const { category, status } = req.query;

    let sql = `
      SELECT 
        i.id,
        i.name,
        i.category,
        i.quantity::FLOAT AS quantity,
        i.unit,
        i.min_stock::FLOAT AS "minStock",
        i.cost_per_unit::FLOAT AS "costPerUnit",
        i.status,
        i.linked_menu_item_id AS "linkedMenuItemId",
        m.name AS "linkedMenuItemName",
        m.in_stock AS "linkedMenuItemInStock",
        TO_CHAR(i.updated_at, 'Mon DD, HH12:MI AM') AS "updatedAt"
      FROM inventory_items i
      LEFT JOIN menu_items m ON i.linked_menu_item_id = m.id
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== 'All') {
      params.push(category);
      sql += ` AND i.category ILIKE $${params.length}`;
    }

    if (status && status !== 'all') {
      params.push(status.toUpperCase());
      sql += ` AND i.status = $${params.length}`;
    }

    sql += ` ORDER BY (i.status = 'OUT_OF_STOCK') DESC, (i.status = 'LOW_STOCK') DESC, i.name ASC`;

    const result = await query(sql, params);

    return res.status(200).json({
      success: true,
      count: result.rowCount,
      items: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const createInventoryItem = async (req, res, next) => {
  try {
    const { name, category = 'Kitchen', quantity, unit = 'units', minStock = 5, costPerUnit = 0, linkedMenuItemId } = req.body;

    if (!name || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Name and quantity are required.' });
    }

    const qty = parseFloat(quantity);
    const min = parseFloat(minStock);
    const status = qty <= 0 ? 'OUT_OF_STOCK' : qty <= min ? 'LOW_STOCK' : 'IN_STOCK';

    const result = await query(
      `INSERT INTO inventory_items (name, category, quantity, unit, min_stock, cost_per_unit, status, linked_menu_item_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING 
        id,
        name,
        category,
        quantity::FLOAT AS quantity,
        unit,
        min_stock::FLOAT AS "minStock",
        cost_per_unit::FLOAT AS "costPerUnit",
        status,
        linked_menu_item_id AS "linkedMenuItemId"`,
      [name.trim(), category.trim(), qty, unit.trim(), min, parseFloat(costPerUnit) || 0, status, linkedMenuItemId || null]
    );

    emitPmsEvent('PMS_INVENTORY_UPDATED', result.rows[0]);

    return res.status(201).json({
      success: true,
      message: `Inventory item "${name}" created.`,
      item: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const updateInventoryItem = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { name, category, quantity, unit, minStock, costPerUnit, linkedMenuItemId, autoSyncMenu = true } = req.body;

    const existingRes = await client.query('SELECT * FROM inventory_items WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Inventory item not found.' });
    }
    const existing = existingRes.rows[0];

    const newQty = quantity !== undefined ? parseFloat(quantity) : parseFloat(existing.quantity);
    const newMin = minStock !== undefined ? parseFloat(minStock) : parseFloat(existing.min_stock);
    const newStatus = newQty <= 0 ? 'OUT_OF_STOCK' : newQty <= newMin ? 'LOW_STOCK' : 'IN_STOCK';

    const result = await client.query(
      `UPDATE inventory_items 
       SET 
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        quantity = $3,
        unit = COALESCE($4, unit),
        min_stock = $5,
        cost_per_unit = COALESCE($6, cost_per_unit),
        status = $7,
        linked_menu_item_id = COALESCE($8, linked_menu_item_id),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING 
        id,
        name,
        category,
        quantity::FLOAT AS quantity,
        unit,
        min_stock::FLOAT AS "minStock",
        cost_per_unit::FLOAT AS "costPerUnit",
        status,
        linked_menu_item_id AS "linkedMenuItemId"`,
      [
        name,
        category,
        newQty,
        unit,
        newMin,
        costPerUnit !== undefined ? parseFloat(costPerUnit) : null,
        newStatus,
        linkedMenuItemId !== undefined ? linkedMenuItemId : null,
        id,
      ]
    );

    const updatedItem = result.rows[0];

    // If out of stock and linked to menu item, mark menu item 86
    const targetMenuId = linkedMenuItemId || existing.linked_menu_item_id;
    if (targetMenuId && autoSyncMenu && newStatus === 'OUT_OF_STOCK') {
      await client.query(
        `UPDATE menu_items SET in_stock = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [targetMenuId]
      );
      emitPmsEvent('PMS_MENU_STOCK_CHANGED', { id: targetMenuId, inStock: false });
    }

    await client.query('COMMIT');

    emitPmsEvent('PMS_INVENTORY_UPDATED', updatedItem);

    return res.status(200).json({
      success: true,
      message: `Inventory item updated (Status: ${newStatus}).`,
      item: updatedItem,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export const deleteInventoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM inventory_items WHERE id = $1 RETURNING name', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Inventory item not found.' });
    }
    return res.status(200).json({
      success: true,
      message: `Item "${result.rows[0].name}" removed from inventory.`,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
};
