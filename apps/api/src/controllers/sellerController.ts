import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { z } from 'zod';
import crypto from 'crypto';

// GET /api/sellers — managers only
export const listSellers = async (req: Request, res: Response) => {
  const { data: sellers, error } = await supabaseAdmin
    .from('profiles')
    .select('id, name, role, region, avatar, phone')
    .eq('role', 'seller')
    .order('name');

  if (error) return res.status(500).json({ error: error.message });
  if (!sellers || sellers.length === 0) return res.json([]);

  const sellerIds = sellers.map((seller) => seller.id);

  const [completedVisitsRes, pendingSchedulesRes] = await Promise.all([
    supabaseAdmin
      .from('visits')
      .select('seller_id')
      .in('seller_id', sellerIds)
      .eq('status', 'completed'),
    supabaseAdmin
      .from('schedules')
      .select('seller_id')
      .in('seller_id', sellerIds)
      .eq('status', 'pending'),
  ]);

  const completedBySeller = new Map<string, number>();
  for (const row of completedVisitsRes.data ?? []) {
    completedBySeller.set(row.seller_id, (completedBySeller.get(row.seller_id) ?? 0) + 1);
  }

  const pendingBySeller = new Map<string, number>();
  for (const row of pendingSchedulesRes.data ?? []) {
    pendingBySeller.set(row.seller_id, (pendingBySeller.get(row.seller_id) ?? 0) + 1);
  }

  const enriched = sellers.map((seller) => {
    const completed = completedBySeller.get(seller.id) ?? 0;
    const pending = pendingBySeller.get(seller.id) ?? 0;
    const efficiency = completed + pending > 0
      ? Math.round((completed / (completed + pending)) * 100)
      : 0;

    return {
      ...seller,
      completedVisits: completed,
      pendingVisits: pending,
      efficiency,
      territory: { lat: -23.5505, lng: -46.6333, radius: 3000 }, // default; override per seller later
    };
  });

  return res.json(enriched);
};

const CreateSellerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  region: z.string().min(1),
  phone: z.string().optional().default(''),
});

// POST /api/sellers — manager invites new seller
export const createSeller = async (req: Request, res: Response) => {
  const parsed = CreateSellerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  // Create user in Supabase Auth with a temporary password (they'll reset via email)
  const tempPassword = crypto.randomBytes(16).toString('base64url');

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: parsed.data.email,
    password: tempPassword,
    user_metadata: { name: parsed.data.name, region: parsed.data.region },
    email_confirm: true,
  });

  if (authError) return res.status(500).json({ error: authError.message });

  // Profile is created automatically by the DB trigger, but let's ensure region + phone
  await supabaseAdmin
    .from('profiles')
    .update({
      role: 'seller',
      region: parsed.data.region,
      phone: parsed.data.phone,
      avatar: parsed.data.name.substring(0, 2).toUpperCase(),
    })
    .eq('id', authData.user.id);

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  return res.status(201).json({
    user: authData.user,
    profile,
    onboarding: 'User created with a temporary password. Trigger password reset by email.',
  });
};

// PATCH /api/sellers/:id — manager updates seller info
export const updateSeller = async (req: Request, res: Response) => {
  const { id } = req.params;
  const schema = z.object({
    name: z.string().optional(),
    region: z.string().optional(),
    phone: z.string().optional(),
    avatar: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
};
