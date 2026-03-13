#!/usr/bin/env node
/**
 * PharmaRoute — Demo Seed Data
 * Creates realistic visits and schedules so the dashboard looks lived-in.
 * Run: node scripts/seed-demo.mjs
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load env from the API folder
dotenv.config({ path: resolve(process.cwd(), 'apps/api/.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Faltando SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no apps/api/.env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0);
  return d.toISOString();
}

const visitNotes = [
  'Reunião muito produtiva. Farmacêutico receptivo aos produtos de alta margem.',
  'Apresentei o catálogo completo. Interesse em antibióticos de nova geração.',
  'Cliente solicitou amostras grátis para avaliação interna.',
  'Fechamos pedido de R$ 4.800 em vitaminas e suplementos.',
  'Gerente ausente. Deixei material e agendei retorno.',
  'Demonstração dos novos dermocosméticos. Muito interesse.',
  'Pedido de urgência para linha de oncologia. Processando.',
  'Visita de relacionamento. Aproveitei para apresentar novidades do trimestre.',
  'Farmácia expandindo setor de manipulação. Oportunidade para insumos.',
  'Retorno após problema com entrega anterior — resolvido e fidelizado.',
  'Primeira visita. Boa receptividade, mapeamento de potencial feito.',
  'Apresentação de programa de fidelidade para grandes compradores.',
  'Negociação de contrato anual com desconto progressivo.',
  'Gerente pediu comparativo de preços. Enviei por e-mail.',
  'Visita técnica sobre controle de temperatura para oncológicos.',
];

const products = [
  'Antibióticos — linha completa', 'Vitaminas A-Z e suplementos',
  'Dermocosméticos premium', 'Insumos para manipulação',
  'Linha oncológica', 'Genéricos de alta rotatividade',
  'Probióticos e saúde intestinal', 'Fitoterápicos regulamentados',
];

const nextSteps = [
  'Enviar proposta formal até sexta-feira.',
  'Agendar visita de follow-up em 15 dias.',
  'Processar pedido de amostras grátis.',
  'Apresentar novo catálogo do trimestre.',
  'Confirmar entrega do pedido fechado hoje.',
];

async function main() {
  console.log('🌱 Iniciando seed de dados demo...\n');

  // Get seller profile
  const { data: profiles } = await supabase.from('profiles').select('id, name, role');
  const seller = profiles.find(p => p.role === 'seller');
  const manager = profiles.find(p => p.role === 'manager');

  if (!seller) { console.error('❌ Nenhum seller encontrado. Rode create-users.mjs primeiro.'); process.exit(1); }

  console.log(`   Seller: ${seller.name} (${seller.id})`);
  console.log(`   Manager: ${manager?.name ?? 'N/A'}\n`);

  // Get 20 random pharmacies from SP region
  const { data: pharmacies } = await supabase
    .from('pharmacies')
    .select('id, name')
    .eq('region', 'Sudeste')
    .limit(20);

  if (!pharmacies || pharmacies.length < 10) {
    console.error('❌ Poucas farmácias encontradas. Certifique-se de rodar o import primeiro.');
    process.exit(1);
  }

  console.log(`   Usando ${pharmacies.length} farmácias para seed\n`);

  // ----- VISITS -----
  const visits = [];
  for (let i = 0; i < 15; i++) {
    const pharmacy = pharmacies[i % pharmacies.length];
    const daysBack = i < 5 ? 0 : i < 10 ? Math.floor(Math.random() * 6) + 1 : Math.floor(Math.random() * 20) + 7;
    const status = i < 12 ? 'completed' : i === 12 ? 'issue' : 'rescheduled';
    visits.push({
      seller_id: seller.id,
      pharmacy_id: pharmacy.id,
      date: daysAgo(daysBack),
      notes: visitNotes[i % visitNotes.length],
      status,
      products_presented: status !== 'issue' ? products[i % products.length] : null,
      next_steps: nextSteps[i % nextSteps.length],
    });
  }

  const { error: visitError } = await supabase.from('visits').insert(visits);
  if (visitError) console.error('❌ Visits error:', visitError.message);
  else console.log(`   ✅ ${visits.length} visitas criadas (5 de hoje, resto dos últimos 20 dias)`);

  // ----- SCHEDULES -----
  const schedulePharmacies = pharmacies.slice(0, 6);
  const schedules = schedulePharmacies.map((pharmacy, i) => ({
    seller_id: seller.id,
    pharmacy_id: pharmacy.id,
    date: daysFromNow(i < 2 ? 1 : i < 4 ? 3 : 7),
    notes: `Visita programada — ${['follow-up de proposta', 'apresentação de novos produtos', 'renovação de contrato', 'visita de relacionamento', 'entrega de amostras', 'reunião com gerência'][i]}`,
    status: 'pending',
  }));

  const { error: schedError } = await supabase.from('schedules').insert(schedules);
  if (schedError) console.error('❌ Schedules error:', schedError.message);
  else console.log(`   ✅ ${schedules.length} agendamentos criados (próximos 7 dias)`);

  // Update a few pharmacies to visited_recently
  const visitedIds = pharmacies.slice(0, 10).map(p => p.id);
  await supabase.from('pharmacies').update({ status: 'visited_recently', last_visit: daysAgo(0) }).in('id', visitedIds.slice(0, 8));
  await supabase.from('pharmacies').update({ status: 'scheduled' }).in('id', visitedIds.slice(8, 10));
  console.log(`   ✅ Status de 10 farmácias atualizado (8 visitadas, 2 agendadas)`);

  console.log('\n🎉 Seed concluído! O dashboard agora tem dados realistas para a demo.');
}

main().catch(console.error);
