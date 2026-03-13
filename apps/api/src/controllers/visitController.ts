import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { z } from 'zod';

const VisitSchema = z.object({
  pharmacy_id: z.string().uuid(),
  notes: z.string().min(1),
  status: z.enum(['completed', 'issue', 'rescheduled']).default('completed'),
  products_presented: z.string().optional(),
  next_steps: z.string().optional(),
  date: z.string().datetime().optional(),
});

// GET /api/visits/pharmacy/:pharmacyId — visit history for a pharmacy
export const getPharmacyVisits = async (req: Request, res: Response) => {
  const querySchema = z.object({
    pharmacyId: z.string().uuid(),
    limit: z.coerce.number().int().min(1).max(200).default(100),
    offset: z.coerce.number().int().min(0).default(0),
  });
  const parsed = querySchema.safeParse({
    pharmacyId: req.params.pharmacyId,
    limit: req.query.limit,
    offset: req.query.offset,
  });
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { pharmacyId, limit, offset } = parsed.data;

  const { data, error } = await supabaseAdmin
    .from('visits')
    .select(`
      id, date, notes, status, products_presented, next_steps, created_at,
      seller:profiles(id, name, avatar)
    `)
    .eq('pharmacy_id', pharmacyId)
    .order('date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
};

// POST /api/visits — log a new visit (seller)
export const createVisit = async (req: Request, res: Response) => {
  const parsed = VisitSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sellerId = req.user.id;

  const { data, error } = await supabaseAdmin
    .from('visits')
    .insert({
      ...parsed.data,
      seller_id: sellerId,
      date: parsed.data.date || new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Mark any pending schedule for this pharmacy+seller as completed
  await supabaseAdmin
    .from('schedules')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .eq('pharmacy_id', parsed.data.pharmacy_id)
    .eq('seller_id', sellerId)
    .eq('status', 'pending');

  return res.status(201).json(data);
};
