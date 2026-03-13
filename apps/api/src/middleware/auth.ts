import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin, supabaseAnon } from '../config/supabase';

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
      userRole?: 'manager' | 'seller';
      requestId?: string;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabaseAnon.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.role) {
      return res.status(401).json({ error: 'Unauthorized: profile not found' });
    }

    req.user = user;
    req.userRole = profile.role;
    next();
  } catch {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
