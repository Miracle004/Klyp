import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../db/index';
import { getSupabase } from '../services/supabase';

export const getItems = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM items WHERE user_id = $1 ORDER BY is_pinned DESC, created_at DESC',
      [req.userId]
    );

    // Delete burn after read items that were just fetched
    const burnItemIds = result.rows.filter(item => item.burn_after_read).map(item => item.id);
    if (burnItemIds.length > 0) {
      await query('DELETE FROM items WHERE id = ANY($1::int[])', [burnItemIds]);
    }

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createItem = async (req: AuthRequest, res: Response) => {
  const { type, title, content, burn_after_read, retention_days } = req.body;
  
  try {
    // Calculate expiration date
    const retention = retention_days || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + retention);

    const result = await query(
      `INSERT INTO items (user_id, type, title, content, burn_after_read, expires_at) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.userId, type, title, content, burn_after_read || false, expiresAt]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteItem = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM items WHERE id = $1 AND user_id = $2', [id, req.userId]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const togglePin = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const result = await query(
      'UPDATE items SET is_pinned = NOT is_pinned WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.userId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const uploadItem = async (req: AuthRequest, res: Response) => {
  const uploadRequest = req as AuthRequest & { file?: Express.Multer.File };
  const file = uploadRequest.file;

  if (!file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  try {
    const bucket = process.env.SUPABASE_BUCKET || 'klip-files';
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
    const path = `${req.userId}/${Date.now()}-${safeName}`;

    const supabase = getSupabase();
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      return res.status(500).json({ error: 'Failed to upload file' });
    }

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
    const publicUrl = publicData.publicUrl;
    const retentionDays = Number(req.body.retention_days || 7);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + retentionDays);

    const itemType = file.mimetype.startsWith('image/') ? 'image' : 'file';

    const result = await query(
      `INSERT INTO items (user_id, type, title, content, filename, file_path, file_size, burn_after_read, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        req.userId,
        itemType,
        file.originalname,
        publicUrl,
        file.originalname,
        path,
        file.size,
        req.body.burn_after_read === 'true',
        expiresAt,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
