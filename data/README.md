# Pharmacy datasets (sanitized)

Este diretório contém versões sanitizadas de bases públicas usadas no MVP.

- Origem: bases públicas da Receita Federal e enriquecimento geográfico (lat/lon) por geocoding.
- Remoções aplicadas: contatos diretos (`email`, `telefone`, `telefone_1`, `telefone_2`) e identificadores empresariais (`cnpj`, `cnpj_basico`).
- Objetivo: permitir demonstração de mapa e roteirização sem expor campos sensíveis desnecessários para o MVP.

Arquivos:
- `public/farmacias_unicas_base_2026_02_com_latlon_sanitized.csv`
- `public/farmacias_rf_ativas_2026_02_com_latlon_sanitized.csv`
