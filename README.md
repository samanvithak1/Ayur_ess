# AyurEssence

AyurEssence is an educational/practitioner workflow for documenting an Ayurvedic Prakriti assessment. It supports doctor and student accounts, private patient profiles, a baseline questionnaire, practitioner observations, transparent Dosha proportions, history, and printable reports.

It does **not** diagnose disease, prescribe medicine, recommend treatment, make modern medical claims, or replace a qualified practitioner. The included demo scoring formula is not clinically validated.

## Run locally

1. Install Node.js 18+ and MySQL 8+.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and set MySQL credentials and a long `JWT_SECRET`.
4. Run `schema.sql` in MySQL.
5. Start with `node server.js`.
6. Open [http://localhost:5000](http://localhost:5000).

For a quick UI/API demo without MySQL, leave `ALLOW_MEMORY_FALLBACK=true`. The server reports `memory-demo` at `/api/health`; data is reset when the process restarts. Set it to `false` in a configured environment to require MySQL.

## Folder structure

- `server.js` - Express app, JWT middleware, validation, REST routes, MySQL adapter, and demo fallback.
- `scoring-config.js` - expert-editable questions, categories, Dosha mappings, and scoring engine.
- `public/index.html` - browser entry point.
- `public/styles.css` - responsive visual system and print styles.
- `public/app.js` - vanilla JavaScript auth, dashboard, patient, questionnaire, history, and report views.
- `schema.sql` - MySQL database and required tables.
- `API.md` - endpoint contract.
- `docs/HPL_ROUND_1.md` - implementation documentation.
- `docs/HPL_ROUND_2_YOUTUBE_SCRIPT.md` - demonstration script.

## Test/demo account

The app has no unsafe seeded password. Register a demo account in the UI, for example `demo@example.com` with an 8+ character password, then create a patient and complete the questionnaire. The memory fallback is suitable for a live demo; MySQL is required for persistence.

## Scoring notes

Each response maps to a visible configuration entry in `scoring-config.js`. The engine sums Dosha weights, converts each total into a percentage, and chooses the highest percentage as dominant. Experts can replace the questionnaire or mappings without changing Express routes or frontend code. This is a transparent demo methodology, not clinical validation.
