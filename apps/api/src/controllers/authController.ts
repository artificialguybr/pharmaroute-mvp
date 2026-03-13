import { Request, Response } from 'express';
import { supabaseAdmin, supabaseAnon } from '../config/supabase';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const login = async (req: Request, res: Response) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password } = parsed.data;
  const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: error.message });

  // Fetch profile to get role
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, name, role, region, avatar, phone')
    .eq('id', data.user.id)
    .single();

  return res.json({
    token: data.session.access_token,
    user: { ...data.user, profile },
  });
};

export const logout = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) await supabaseAnon.auth.signOut();
  return res.json({ success: true });
};

export const me = async (req: Request, res: Response) => {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('id, name, role, region, avatar, phone')
    .eq('id', req.user.id)
    .single();

  if (error) return res.status(404).json({ error: 'Profile not found' });
  return res.json({ user: req.user, profile });
};
