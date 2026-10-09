import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Demo authentication check
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ error: 'Invalid demo credentials. Use admin@aquasense.demo / demo123' });
    }

    // Return authenticated user profile and mock bearer token
    return res.json({
      token: 'demo-aquasense-session-token-' + user.id,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ error: 'Failed to retrieve current user profile' });
  }
};
