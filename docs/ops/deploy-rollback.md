# Deploy and Rollback Runbook

## Frontend (Vercel)

### Deploy
```bash
vercel --cwd apps/frontend --prod --yes
```

### Rollback
1. Liste os deploys:
```bash
vercel ls pharmaroute-mvp-frontend
```
2. Promova um deploy estável anterior:
```bash
vercel promote <deployment-url-or-id>
```

## API (Render)

### Deploy
```bash
render deploys create <service-id>
```

### Rollback
1. Liste os deploys:
```bash
render deploys list <service-id>
```
2. No dashboard da Render, use o deploy anterior estável e selecione **Redeploy**.

## Supabase migrations

### Status
```bash
supabase migration list
```

### Aplicar novas migrations
```bash
supabase db push
```

### Nota de rollback
Para banco, preferir migration de correção (roll-forward) em vez de rollback destrutivo.
