#!/usr/bin/env node
/**
 * PharmaRoute — CSV to Supabase Pharmacy Importer
 * 
 * Reads farmacias_unicas_base_2026_02_com_latlon.csv and bulk-inserts
 * pharmacies into Supabase in batches of 500 rows.
 * 
 * Usage: node import-pharmacies.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { resolve } from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: resolve(process.cwd(), 'apps/api/.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Faltando variáveis de ambiente no apps/api/.env');
  process.exit(1);
}

const CSV_FILE = resolve('/Users/joaovitoramaral/Downloads/farmacias_unicas_base_2026_02_com_latlon.csv');
const BATCH_SIZE = 500;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Map UF to region label
const regionMap = {
  SP: 'Sudeste', RJ: 'Sudeste', MG: 'Sudeste', ES: 'Sudeste',
  RS: 'Sul', SC: 'Sul', PR: 'Sul',
  BA: 'Nordeste', CE: 'Nordeste', PE: 'Nordeste', MA: 'Nordeste',
  PB: 'Nordeste', RN: 'Nordeste', AL: 'Nordeste', SE: 'Nordeste', PI: 'Nordeste',
  PA: 'Norte', AM: 'Norte', TO: 'Norte', RR: 'Norte', AP: 'Norte', AC: 'Norte', RO: 'Norte',
  GO: 'Centro-Oeste', MT: 'Centro-Oeste', MS: 'Centro-Oeste', DF: 'Centro-Oeste',
};

function parseLine(headers, values) {
  const row = {};
  headers.forEach((h, i) => { row[h] = values[i] ?? ''; });
  return row;
}

function rowToPharmacy(row) {
  const lat = parseFloat(row.lat || row.latitude);
  const lon = parseFloat(row.lon || row.longitude);
  if (isNaN(lat) || isNaN(lon)) return null;

  const address = [
    row.logradouro, row.numero, row.complemento, row.bairro,
    row.municipio, row.uf, row.cep
  ].filter(Boolean).join(', ');

  const name = (row.nome_fantasia || row.razao_social || 'Farmácia').trim().slice(0, 200);

  return {
    name,
    address: address.slice(0, 500),
    lat,
    lng: lon,
    phone: (row.telefone || '').slice(0, 30),
    email: (row.email || '').slice(0, 200),
    region: regionMap[row.uf] || row.uf || 'Outros',
    notes: '',
    contact_person: '',
    status: 'needs_visit',
  };
}

async function importBatch(batch) {
  const { error } = await supabase.from('pharmacies').insert(batch);
  if (error) {
    console.error('Batch error:', error.message);
    return 0;
  }
  return batch.length;
}

async function main() {
  console.log('🚀 Starting pharmacy import...');

  const rl = createInterface({
    input: createReadStream(CSV_FILE),
    crlfDelay: Infinity,
  });

  let headers = null;
  let batch = [];
  let totalInserted = 0;
  let totalSkipped = 0;
  let lineNum = 0;

  for await (const line of rl) {
    lineNum++;
    if (!line.trim()) continue;

    // Parse CSV respecting quoted fields
    const values = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|(?<=,)$|^(?=,))/g)
      ?.map(v => v.replace(/^"|"$/g, '').trim()) ?? line.split(',');

    if (lineNum === 1) {
      headers = values;
      continue;
    }

    const row = parseLine(headers, values);
    const pharmacy = rowToPharmacy(row);

    if (!pharmacy) {
      totalSkipped++;
      continue;
    }

    batch.push(pharmacy);

    if (batch.length >= BATCH_SIZE) {
      const inserted = await importBatch(batch);
      totalInserted += inserted;
      batch = [];
      process.stdout.write(`\r   Inseridas: ${totalInserted.toLocaleString()} | Ignoradas: ${totalSkipped.toLocaleString()} | Linha: ${lineNum.toLocaleString()}`);
    }
  }

  // Final batch
  if (batch.length > 0) {
    const inserted = await importBatch(batch);
    totalInserted += inserted;
  }

  console.log(`\n\n✅ Import concluído!`);
  console.log(`   Farmácias inseridas: ${totalInserted.toLocaleString()}`);
  console.log(`   Linhas ignoradas (sem lat/lon): ${totalSkipped.toLocaleString()}`);
}

main().catch(console.error);
