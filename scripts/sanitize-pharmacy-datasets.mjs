#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const INPUTS = [
  '/Users/joaovitoramaral/Downloads/farmacias_unicas_base_2026_02_com_latlon.csv',
  '/Users/joaovitoramaral/Downloads/farmacias_rf_ativas_2026_02_com_latlon.csv',
];

const OUT_DIR = '/Users/joaovitoramaral/Downloads/pharmaroute/data/public';

const FIELD_MAP = {
  common: [
    'razao_social',
    'nome_fantasia',
    'logradouro',
    'numero',
    'complemento',
    'bairro',
    'cep',
    'municipio',
    'municipio_nome',
    'municipio_codigo',
    'uf',
    'cnae_principal',
    'situacao_cadastral_rf',
    'situacao_cadastral',
    'data_inicio_atividade_rf',
    'data_inicio_atividade',
    'lat',
    'lon',
  ],
};

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function csvEscape(value) {
  const v = value ?? '';
  if (/[,"\n\r]/.test(v)) return '"' + String(v).replace(/"/g, '""') + '"';
  return String(v);
}

async function sanitizeFile(inputPath) {
  const baseName = path.basename(inputPath, '.csv');
  const outputPath = path.join(OUT_DIR, `${baseName}_sanitized.csv`);

  const rl = readline.createInterface({
    input: fs.createReadStream(inputPath, { encoding: 'utf-8' }),
    crlfDelay: Infinity,
  });

  let headers = [];
  let headerIndex = new Map();
  let lineNo = 0;
  let kept = 0;
  let skipped = 0;

  const ws = fs.createWriteStream(outputPath, { encoding: 'utf-8' });

  for await (const line of rl) {
    lineNo += 1;
    if (!line.trim()) continue;

    const cols = parseCsvLine(line);

    if (lineNo === 1) {
      headers = cols;
      headerIndex = new Map(headers.map((h, i) => [h, i]));
      const selected = FIELD_MAP.common.filter((h) => headerIndex.has(h));
      ws.write([...selected, 'source_dataset'].map(csvEscape).join(',') + '\n');
      continue;
    }

    const get = (name) => {
      const idx = headerIndex.get(name);
      return idx === undefined ? '' : (cols[idx] ?? '').trim();
    };

    const lat = get('lat');
    const lon = get('lon');
    if (!lat || !lon) {
      skipped += 1;
      continue;
    }

    const row = FIELD_MAP.common
      .filter((h) => headerIndex.has(h))
      .map((h) => get(h));

    row.push(baseName);
    ws.write(row.map(csvEscape).join(',') + '\n');
    kept += 1;
  }

  ws.end();
  await new Promise((resolve) => ws.on('finish', resolve));

  return { outputPath, kept, skipped };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const input of INPUTS) {
    if (!fs.existsSync(input)) {
      console.error(`Arquivo não encontrado: ${input}`);
      process.exitCode = 1;
      continue;
    }

    const res = await sanitizeFile(input);
    console.log(`Sanitizado: ${path.basename(res.outputPath)} | linhas: ${res.kept} | descartadas sem lat/lon: ${res.skipped}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
