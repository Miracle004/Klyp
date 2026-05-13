import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../db/index';

export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query('SELECT retention_days, ask_each_time FROM users WHERE id = $1', [req.userId]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  const { retention_days, ask_each_time } = req.body;
  try {
    const result = await query(
      'UPDATE users SET retention_days = $1, ask_each_time = $2 WHERE id = $3 RETURNING retention_days, ask_each_time',
      [retention_days, ask_each_time, req.userId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDevices = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query('SELECT id, device_name, last_seen FROM devices WHERE user_id = $1 ORDER BY last_seen DESC', [req.userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteDevice = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM devices WHERE id = $1 AND user_id = $2', [id, req.userId]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAllItems = async (req: AuthRequest, res: Response) => {
  try {
    await query('DELETE FROM items WHERE user_id = $1', [req.userId]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
