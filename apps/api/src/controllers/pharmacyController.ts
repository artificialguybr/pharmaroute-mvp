import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { z } from 'zod';

const PharmacySchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  phone: z.string().optional().default(''),
  email: z.string().optional().default(''),
  region: z.string().min(1),
  notes: z.string().optional().default(''),
  contact_person: z.string().optional().default(''),
});

// GET /api/pharmacies?bbox=lat1,lng1,lat2,lng2&region=x&status=y
export const listPharmacies = async (req: Request, res: Response) => {
  const querySchema = z.object({
    bbox: z.string().optional(),
    region: z.string().optional(),
    status: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(500).default(200),
    offset: z.coerce.number().int().min(0).default(0),
  });
  const parsedQuery = querySchema.safeParse(req.query);
  if (!parsedQuery.success) return res.status(400).json({ error: parsedQuery.error.flatten() });

  const { bbox, region, status, limit, offset } = parsedQuery.data;

  if (bbox) {
    const [lat1, lng1, lat2, lng2] = String(bbox).split(',').map(Number);
    if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) {
      return res.status(400).json({ error: 'Invalid bbox format. Expected lat1,lng1,lat2,lng2' });
    }
  }
  let query = supabaseAdmin
    .from('pharmacies')
    .select(`
      id, name, address, lat, lng, phone, email,
      region, notes, contact_person, status, last_visit, created_at
    `)
    .order('name');

  if (bbox) {
    const [lat1, lng1, lat2, lng2] = String(bbox).split(',').map(Number);
    const latMin = Math.min(lat1, lat2);
    const latMax = Math.max(lat1, lat2);
    const lngMin = Math.min(lng1, lng2);
    const lngMax = Math.max(lng1, lng2);
    query = query
      .gte('lat', latMin).lte('lat', latMax)
      .gte('lng', lngMin).lte('lng', lngMax);
  }
  if (region && region !== 'all') query = query.eq('region', region);
  if (status && status !== 'all') query = query.eq('status', status);
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
};

// POST /api/pharmacies (manager only)
export const createPharmacy = async (req: Request, res: Response) => {
  const parsed = PharmacySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { data, error } = await supabaseAdmin
    .from('pharmacies')
    .insert(parsed.data)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
};

// PATCH /api/pharmacies/:id (manager only)
export const updatePharmacy = async (req: Request, res: Response) => {
  const { id } = req.params;
  const parsed = PharmacySchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { data, error } = await supabaseAdmin
    .from('pharmacies')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
};

// DELETE /api/pharmacies/:id (manager only)
export const deletePharmacy = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabaseAdmin.from('pharmacies').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
};
