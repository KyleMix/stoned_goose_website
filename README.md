# Stoned Goose Website

This project is a Vite + React single-page app backed by a lightweight Express server for API proxying.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create an `.env.local` file at the repo root with your Eventbrite credentials (do **not** commit this file):

   ```bash
   EVENTBRITE_TOKEN=your_private_token
   EVENTBRITE_ORGANIZER_ID=your_organizer_id
   PORT=3000 # optional, defaults to 3000
   ```

3. Run the API server:

   ```bash
   npm run dev
   ```

4. In a separate terminal, start the Vite dev server (proxies `/api` to the Express server):

   ```bash
   npm run dev:client
   ```

Open http://localhost:5000 to view the site in development.

## Building

The Vite build outputs the client to `dist/public`. The Express server also serves static assets from this folder in production.
