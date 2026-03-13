import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

// GET /api/dashboard/stats
export const getDashboardStats = async (_req: Request, res: Response) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [
    visitsToday,
    totalPharmacies,
    needsVisit,
    activeSellers,
    recentVisits,
  ] = await Promise.all([
    // Visits today
    supabaseAdmin
      .from('visits')
      .select('id', { count: 'exact', head: true })
      .gte('date', todayStart.toISOString())
      .lte('date', todayEnd.toISOString()),
    // Total pharmacies
    supabaseAdmin
      .from('pharmacies')
      .select('id', { count: 'exact', head: true }),
    // Pharmacies needing visit
    supabaseAdmin
      .from('pharmacies')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'needs_visit'),
    // Active sellers
    supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'seller'),
    // Recent 10 visits for activity feed
    supabaseAdmin
      .from('visits')
      .select(`
        id, date, status, notes,
        seller:profiles(id, name, avatar),
        pharmacy:pharmacies(id, name, address, region)
      `)
      .order('date', { ascending: false })
      .limit(10),
  ]);

  // Weekly performance data (Mon-Sun of current week)
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const { data: weekVisits } = await supabaseAdmin
    .from('visits')
    .select('date, status')
    .gte('date', weekStart.toISOString())
    .lte('date', weekEnd.toISOString());

  // Group by day of week
  const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
  const performanceData = dayNames.map((name, i) => {
    const dayVisits = (weekVisits || []).filter(v => {
      const d = new Date(v.date);
      return d.getDay() === (i + 1) % 7; // Mon=1..Sun=0
    });
    return {
      name,
      'concluídas': dayVisits.filter(v => v.status === 'completed').length,
      'pendentes': dayVisits.filter(v => v.status !== 'completed').length,
    };
  });

  return res.json({
    stats: {
      visitsToday: visitsToday.count ?? 0,
      totalPharmacies: totalPharmacies.count ?? 0,
      needsVisit: needsVisit.count ?? 0,
      activeSellers: activeSellers.count ?? 0,
    },
    recentActivity: recentVisits.data ?? [],
    performanceData,
  });
};
