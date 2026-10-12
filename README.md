# Duas Colheres Pudim 🍮

Site institucional da Duas Colheres (pudins inteiros e kits para festas, com pedidos pelo WhatsApp) e o Clube Duas Colheres, cartão fidelidade das vendas de fatias: a cada **12 fatias** compradas, o cliente ganha **1 fatia grátis**.

- **`/`**: site institucional (história, pudins, kits e contato).
- **`/fidelidade`**: página do cliente do clube. Ele digita o celular e vê os selos, a validade e as fatias grátis.
- **`/fidelidade/balcao`**: área da loja (com senha). Lista de clientes, cadastro, registro de compras e entrega de fatias grátis.

## Regras

- Cada fatia comprada vale 1 selo. Com 12 selos, o cliente ganha 1 fatia grátis.
- Os selos valem por **6 meses** a partir do primeiro selo do cartão. Se o cartão não for completado nesse prazo, os selos zeram.
- O que sobrar de uma compra que completa o cartão já começa o cartão seguinte.
- Fatias grátis conquistadas **não vencem**.
- Um lançamento errado pode ser desfeito em até 30 minutos.

As regras ficam em `src/lib/fidelidade.ts` (`SELOS_POR_PREMIO` e `MESES_DE_VALIDADE`).

## Rodar no computador

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Sem banco configurado, o app usa um banco **em memória** (os dados somem ao reiniciar) e a senha do balcão é `pudim`.

Testes das regras: `npm test`.

## Publicar na Vercel (grátis)

1. Suba esta pasta para um repositório no GitHub.
2. Em https://vercel.com, clique em **Add New → Project** e importe o repositório.
3. Antes do deploy, em **Environment Variables**, crie `ADMIN_PASSWORD` com a senha do balcão.
4. Clique em **Deploy**.
5. No projeto, abra **Storage → Create Database → Neon (Postgres)**, escolha o plano gratuito e conecte ao projeto. A Vercel cria a variável `DATABASE_URL` sozinha.
6. Em **Deployments**, clique em **Redeploy** para o app enxergar o banco.

As tabelas são criadas automaticamente no primeiro acesso.

**Dica:** gere um QR Code com o endereço do site e deixe no balcão para o cliente consultar o cartão.

> O plano gratuito (Hobby) da Vercel é, pelos termos de uso, para projetos não comerciais.
