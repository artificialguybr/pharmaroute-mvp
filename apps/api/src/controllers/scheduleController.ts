import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { z } from 'zod';

const ScheduleSchema = z.object({
  seller_id: z.string().uuid(),
  pharmacy_id: z.string().uuid(),
  date: z.string().datetime(),
  notes: z.string().default(''),
  status: z.enum(['pending', 'completed', 'cancelled']).default('pending'),
});

// GET /api/schedules?sellerId=x&date=2024-03-12
// Sellers get their own; managers get all (or filtered by sellerId)
export const listSchedules = async (req: Request, res: Response) => {
  const userRole = req.userRole;
  const isSeller = userRole === 'seller';

  let query = supabaseAdmin
    .from('schedules')
    .select(`
      id, date, notes, status, created_at,
      seller:profiles(id, name, avatar, region),
      pharmacy:pharmacies(id, name, address, lat, lng, region)
    `)
    .order('date');

  // Seller sees only their own schedules; manager can filter by seller_id
  if (isSeller) {
    query = query.eq('seller_id', req.user.id);
  } else if (req.query.sellerId) {
    query = query.eq('seller_id', String(req.query.sellerId));
  }

  // Date filter: filter by calendar day
  if (req.query.date) {
    const day = String(req.query.date).split('T')[0]; // strip time
    query = query
      .gte('date', `${day}T00:00:00.000Z`)
      .lte('date', `${day}T23:59:59.999Z`);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
};

// POST /api/schedules (manager only)
export const createSchedule = async (req: Request, res: Response) => {
  const parsed = ScheduleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { data, error } = await supabaseAdmin
    .from('schedules')
    .insert(parsed.data)
    .select(`
      id, date, notes, status,
      seller:profiles(id, name, avatar),
      pharmacy:pharmacies(id, name, address)
    `)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
};

// PATCH /api/schedules/:id
export const updateSchedule = async (req: Request, res: Response) => {
  const { id } = req.params;
  const schema = z.object({
    status: z.enum(['pending', 'completed', 'cancelled']).optional(),
    notes: z.string().optional(),
    date: z.string().datetime().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  if (req.userRole !== 'manager') {
    const { data: existing, error: readError } = await supabaseAdmin
      .from('schedules')
      .select('id, seller_id')
      .eq('id', id)
      .single();

    if (readError || !existing) return res.status(404).json({ error: 'Schedule not found' });
    if (existing.seller_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: cannot update another seller schedule' });
    }
  }

  let updateQuery = supabaseAdmin
    .from('schedules')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (req.userRole !== 'manager') {
    updateQuery = updateQuery.eq('seller_id', req.user.id);
  }

  const { data, error } = await updateQuery.select().single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
};

// DELETE /api/schedules/:id (manager only)
export const deleteSchedule = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabaseAdmin.from('schedules').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
};
