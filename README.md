# CRUD de Times - Expo + Supabase

Aplicativo React Native com Expo e TypeScript que realiza Create, Read, Update e Delete na tabela `times` do Supabase.

## 1. Preparar o banco

Abra o SQL Editor do Supabase e execute todo o conteúdo de `banco.sql`.

O script:
- adiciona `estadio`, `titulos` e `ativo` à tabela `times`;
- habilita RLS;
- cria políticas de SELECT, INSERT, UPDATE e DELETE para o papel `anon`;
- insere três registros de exemplo.

Depois, teste a API no navegador usando o modelo indicado no final de `banco.sql`.

## 2. Configurar as variáveis de ambiente

Crie um arquivo `.env` na raiz com:

```env
EXPO_PUBLIC_SUPABASE_URL=sua_url
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua_chave_sb_publishable
```

Use somente a chave publicável `sb_publishable_...`. Nunca coloque uma chave `sb_secret_...` no aplicativo.

O `.env` está no `.gitignore` e não deve ser enviado ao GitHub. O arquivo `.env.example` deve ser versionado.

## 3. Instalar e executar

```bash
npm install
npx expo start
```

Abra o projeto no Expo Go.

## 4. Antes do primeiro commit

Execute:

```bash
git status
```

Confira se `.env` não aparece na lista de arquivos a serem enviados. O repositório deve conter `banco.sql` e `.env.example`.
