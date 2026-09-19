# HPL Round 2 YouTube Demonstration Script

Target length: 4 to 6 minutes.

## 0:00 - 0:25 | Opening

"Welcome to AyurEssence, an intelligent Ayurvedic Prakriti assessment platform for doctors and students. This is an educational documentation workflow. It does not diagnose disease, prescribe medicines, recommend treatment, or replace a practitioner."

## 0:25 - 0:55 | Account and role

Open `http://localhost:5000`. Register as `Dr. Anika Rao`, choose Doctor, and sign in. Mention JWT-protected sessions and bcrypt password hashing. Point out the visible practitioner role in the workspace.

## 0:55 - 1:35 | Patient management

Open New patient. Create Maya Example, age 29, choose a gender, add a phone number and a short note. Show Patients and explain that records are scoped to the signed-in user.

## 1:35 - 2:55 | Questionnaire

Select Start assessment. Scroll through the twelve baseline prompts. Identify the eight covered domains. Choose one response per prompt on the 1-to-5 scale. Explain that response labels and internal weights are maintained in `scoring-config.js`, separate from application logic.

## 2:55 - 3:30 | Practitioner observations

Enter a concise observation such as posture, voice, gait, or interaction notes. State that this is intentionally free text and not an automated diagnosis. Submit Calculate constitution.

## 3:30 - 4:20 | Results and report

Show the Vata, Pitta, and Kapha percentage bars and the dominant constitution. Explain that the displayed formula is transparent but not clinically validated. Click Print / Save as PDF and show the demographics, assessment date, assessor, proportions, observations, methodology, and disclaimer.

## 4:20 - 4:55 | History and API

Open Assessment history and revisit the report. Optionally show `/api/health` and explain the MySQL-backed deployment path. Mention `schema.sql`, the four requested tables, and that the no-MySQL memory mode is only for a local demo.

## Closing

"AyurEssence turns a structured constitutional questionnaire and practitioner observation into a clear, reviewable record while keeping clinical interpretation with qualified professionals."
