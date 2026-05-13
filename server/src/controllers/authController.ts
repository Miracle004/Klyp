import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import * as UAParser from 'ua-parser-js';
import { query } from '../db/index';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

export const signup = async (req: Request, res: Response) => {
  const { email, password, retention_days } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (email, password_hash, retention_days) VALUES ($1, $2, $3) RETURNING id, email, retention_days',
      [email, hashedPassword, retention_days || 7]
    );

    const user = result.rows[0];
    const sessionId = uuidv4();
    const token = jwt.sign({ userId: user.id, sessionId }, JWT_SECRET, { expiresIn: '7d' });

    // Parse User-Agent
    const parser = new UAParser.UAParser(req.headers['user-agent'] as string);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const deviceName = `${browser.name || 'Unknown Browser'} on ${os.name || 'Unknown OS'}`;

    await query(
      'INSERT INTO devices (user_id, device_name, token_hash) VALUES ($1, $2, $3)',
      [user.id, deviceName, sessionId]
    );

    res.status(201).json({ user, token });
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const sessionId = uuidv4();
    const token = jwt.sign({ userId: user.id, sessionId }, JWT_SECRET, { expiresIn: '7d' });

    // Parse User-Agent
    const parser = new UAParser.UAParser(req.headers['user-agent'] as string);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const deviceName = `${browser.name || 'Unknown Browser'} on ${os.name || 'Unknown OS'}`;

    await query(
      'INSERT INTO devices (user_id, device_name, token_hash) VALUES ($1, $2, $3)',
      [user.id, deviceName, sessionId]
    );

    res.json({
      user: { id: user.id, email: user.email, retention_days: user.retention_days },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
