#!/usr/bin/env node
/**
 * Creates the initial manager and seller users in Supabase Auth.
 * Run once: node create-users.mjs
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import crypto from 'crypto';

dotenv.config({ path: resolve(process.cwd(), 'apps/api/.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MANAGER_PASSWORD = process.env.MANAGER_PASSWORD || crypto.randomBytes(16).toString('base64url');
const SELLER_PASSWORD = process.env.SELLER_PASSWORD || crypto.randomBytes(16).toString('base64url');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Faltando variáveis de ambiente no apps/api/.env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const USERS = [
  {
    email: 'gestor@pharmaroute.com',
    password: MANAGER_PASSWORD,
    name: 'Gestor Principal',
    role: 'manager',
    region: null,
    avatar: 'GP',
    phone: '(11) 99999-0001'
  },
  {
    email: 'agente@pharmaroute.com',
    password: SELLER_PASSWORD,
    name: 'Ana Paula (Agente)',
    role: 'seller',
    region: 'Sudeste',
    avatar: 'AP',
    phone: '(11) 99999-0002'
  }
];

async function createUser(u) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,
    user_metadata: { name: u.name, role: u.role }
  });

  if (error) {
    if (error.message.includes('already registered')) {
      console.log(`   ⚠️  ${u.email} já existe, pulando.`);
      return;
    }
    throw new Error(`Failed to create ${u.email}: ${error.message}`);
  }

  // Upsert profile with extra info
  await supabase.from('profiles').upsert({
    id: data.user.id,
    name: u.name,
    role: u.role,
    region: u.region,
    avatar: u.avatar,
    phone: u.phone,
  });

  console.log(`   ✅  ${u.role.toUpperCase()} criado: ${u.email}`);
}

async function main() {
  console.log('👤 Criando usuários no Supabase...\n');
  for (const user of USERS) {
    await createUser(user);
  }
  if (!process.env.MANAGER_PASSWORD || !process.env.SELLER_PASSWORD) {
    console.log('\n⚠️  Senhas foram geradas automaticamente para uso local. Defina MANAGER_PASSWORD e SELLER_PASSWORD para credenciais previsíveis.');
  }
  console.log('\n🎉 Pronto! Use as credenciais acima para logar no PharmaRoute.');
}

main().catch(console.error);
