# AyurEssence API

All private routes require `Authorization: Bearer <jwt>`.

## Public routes

- `POST /api/register` body: `{ name, email, password, role }`, where role is `doctor` or `student`.
- `POST /api/login` body: `{ email, password }`.
- `GET /api/health` returns service and database mode.

## Private routes

- `GET /api/me`
- `GET /api/questions` returns the active questionnaire without internal weights.
- `GET /api/patients`
- `POST /api/patients` body: `{ name, age, gender, phone, notes }`.
- `GET /api/patients/:id`
- `POST /api/assessments` body: `{ patientId, answers, observations }`.
- `GET /api/assessments` returns the signed-in user's history.
- `GET /api/assessments/:id` returns a report-ready assessment.

`answers` is an object keyed by the question IDs returned by `/api/questions`. Every question must have an integer response in its displayed scale. All patient and assessment queries are scoped by authenticated user ID.
