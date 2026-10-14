# Fieldnotes blog API and React app

A small Express API backed by an in-memory array of sample blog posts, with a React/Vite client.

## Run locally

1. From the project root, run `npm ci`, `npm ci --prefix server`, and `npm ci --prefix client`.
2. Run `npm run dev` to start the API and React client together.
3. Open the local URL printed by Vite, enter any non-empty bearer token, and press Enter (or select Continue). Then select a story to open it.

The API listens on port `3001` by default. Vite proxies `/posts` requests to the API during local development.

## Deploy on Render

The included `render.yaml` configures a single Render web service to build the client and run the API, which also serves the built React app. In Render, create a new Blueprint from this repository and deploy it. The `/health` endpoint is used for deployment health checks.

## API

- `GET /health` — returns `{ "status": "ok" }`.
- `GET /posts` — returns the sample post list; no authentication required.
- `GET /posts/:slug` — returns one post and requires a non-empty `Authorization: Bearer <token>` header. The token value is not checked.

This demo intentionally accepts any non-empty bearer token. It is not authentication and must not be used to protect private data or exposed as a secure API.

A global logger middleware writes each request's timestamp, method, and path to the API console. Posts are in memory and reset when the server restarts.
