# HPL Round 1 Implementation Documentation

## Problem and boundaries

AyurEssence provides a structured digital workflow for Ayurvedic practitioners and students to record constitutional observations. It is intentionally an assessment documentation aid only. It does not diagnose, prescribe, recommend treatment, or substitute for an Ayurvedic or medical professional.

## Delivered capability

- Doctor/student registration and login with bcrypt-compatible password hashing and JWT sessions.
- User-scoped patient creation and patient selection.
- Baseline questionnaire across eight requested domains: physical characteristics, body structure, skin/hair, appetite/digestion, sleep, activity, behavioral characteristics, and physiological tendencies.
- Practitioner free-text observations.
- Transparent Vata/Pitta/Kapha percentage calculation and dominant constitution.
- Assessment history and print/save-to-PDF report.
- MySQL schema for `users`, `patients`, `assessments`, and `assessment_answers`.
- Development memory fallback for a no-setup hackathon demo; production persistence uses MySQL.

## Architecture

The browser client is plain HTML/CSS/JavaScript. Express serves static files and JSON REST endpoints. JWT middleware protects all private routes. The storage adapter chooses MySQL when it can connect and an explicit development fallback when `ALLOW_MEMORY_FALLBACK=true`.

The scoring contract is isolated in `scoring-config.js`. Its `QUESTIONS` array contains prompts, categories, response labels, and Dosha weights. `calculateScores()` is the only calculation entry point, allowing an expert to validate or replace the methodology without changing UI or persistence code.

## Security decisions

- Passwords are never stored directly; `bcryptjs` stores a salted hash.
- JWTs expire after eight hours.
- Patient and assessment queries include the authenticated user ID.
- Input is validated at the API boundary, including role, email, age, password length, observation length, and complete questionnaire answers.
- Report text is escaped before being inserted into the DOM.

## Known scope and next round

This first round does not include a questionnaire builder, version storage, multilingual content, analytics, or AI interpretation. Those should be designed with expert review and consent/privacy requirements before implementation.
