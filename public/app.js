const app = document.querySelector('#app');

const toast = document.querySelector('#toast');

const state = {
    token: localStorage.getItem('ayuressence_token'),
    user: JSON.parse(localStorage.getItem('ayuressence_user') || 'null'),
    patients: [],
    assessments: [],
    questions: [],
    selectedPatient: null,
    currentAssessment: null
};

const esc = (value) =>
    String(value ?? '').replace(
        /[&<>"']/g,
        (char) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char])
    );

function notify(message, success = false) {
    toast.textContent = message;

    toast.className = `toast ${success ? 'success' : 'show'}`;

    setTimeout(() => {
        toast.className = 'toast';
    }, 3500);
}

async function api(url, options = {}) {
    const response = await fetch(url, {
        ...options,

        headers: {
            'Content-Type': 'application/json',

            ...(state.token
                ? {
                    Authorization: `Bearer ${state.token}`
                }
                : {}),

            ...(options.headers || {})
        }
    });

    const data = await response
        .json()
        .catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.error || 'Something went wrong.'
        );
    }

    return data;
}

function saveSession(data) {
    state.token = data.token;

    state.user = data.user;

    localStorage.setItem(
        'ayuressence_token',
        data.token
    );

    localStorage.setItem(
        'ayuressence_user',
        JSON.stringify(data.user)
    );
}

function authView(mode = 'login', error = '') {
    app.innerHTML = `
        <div class="auth-wrap">

            <section class="auth-hero">

                <div class="eyebrow">
                    AyurEssence / HPL
                </div>

                <h1>
                    Listen to the whole person.
                </h1>

                <p>
                    A structured workspace for Ayurvedic practitioners and students to document Prakriti observations with clarity and care.
                </p>

                <p class="eyebrow">
                    Assessment support, not diagnosis.
                </p>

            </section>

            <section class="auth-form">

                <div class="auth-card">

                    <div class="eyebrow">
                        Prakriti assessment platform
                    </div>

                    <h2 class="title">
                        ${
                            mode === 'login'
                                ? 'Welcome back.'
                                : 'Begin your practice.'
                        }
                    </h2>

                    <p class="subtitle">
                        ${
                            mode === 'login'
                                ? 'Sign in to continue your patient work.'
                                : 'Create a practitioner workspace in under a minute.'
                        }
                    </p>

                    <div class="tabs">

                        <button
                            class="${mode === 'login' ? 'active' : ''}"
                            data-auth="login"
                        >
                            Sign in
                        </button>

                        <button
                            class="${mode === 'register' ? 'active' : ''}"
                            data-auth="register"
                        >
                            Register
                        </button>

                    </div>

                    ${
                        error
                            ? `<div class="message">${esc(error)}</div>`
                            : ''
                    }

                    <form id="auth-form">

                        ${
                            mode === 'register'
                                ? `
                                    <div class="field">
                                        <label>Full name</label>

                                        <input
                                            name="name"
                                            required
                                            autocomplete="name"
                                        >
                                    </div>
                                `
                                : ''
                        }

                        <div class="field">

                            <label>Email</label>

                            <input
                                name="email"
                                type="email"
                                required
                                autocomplete="email"
                            >

                        </div>

                        <div class="field">

                            <label>
                                Password

                                <small>
                                    ${
                                        mode === 'register'
                                            ? '(8+ characters)'
                                            : ''
                                    }
                                </small>

                            </label>

                            <input
                                name="password"
                                type="password"
                                required
                                autocomplete="current-password"
                            >

                        </div>

                        ${
                            mode === 'register'
                                ? `
                                    <div class="field">

                                        <label>Role</label>

                                        <select name="role">

                                            <option value="doctor">
                                                Doctor / practitioner
                                            </option>

                                            <option value="student">
                                                Student
                                            </option>

                                        </select>

                                    </div>
                                `
                                : ''
                        }

                        <button
                            class="btn"
                            type="submit"
                        >
                            ${
                                mode === 'login'
                                    ? 'Sign in'
                                    : 'Create account'
                            }
                        </button>

                    </form>

                </div>

            </section>

        </div>
    `;

    document
        .querySelectorAll('[data-auth]')
        .forEach((button) => {

            button.onclick = () =>
                authView(button.dataset.auth);

        });

    document
        .querySelector('#auth-form')
        .onsubmit = async (event) => {

            event.preventDefault();

            const body =
                Object.fromEntries(
                    new FormData(event.target)
                );

            try {

                const data = await api(
                    `/api/${mode}`,
                    {
                        method: 'POST',

                        body: JSON.stringify(body)
                    }
                );

                saveSession(data);

                renderShell('dashboard');

            } catch (err) {

                authView(
                    mode,
                    err.message
                );

            }

        };
}

function renderShell(view = 'dashboard') {
    app.innerHTML = `
        <div class="shell">
            <aside class="sidebar">
                <div class="brand">Ayur<span>Essence</span></div>
                <div>
                    <div class="eyebrow">Workspace</div>
                    <nav class="nav">
                        <button data-view="dashboard">Overview</button>
                        <button data-view="patients">Patients</button>
                        <button data-view="new-patient">New patient</button>
                        <button data-view="history">Assessment history</button>
                    </nav>
                </div>
                <div class="sidebar-note">
                    A structured educational record of constitutional patterns.<br><br>
                    Not a diagnostic or treatment tool.
                </div>
                <button id="logout" class="btn ghost">Sign out</button>
            </aside>
            <section class="main"><div id="view"></div></section>
        </div>
    `;

    document.querySelectorAll('[data-view]').forEach((button) => {
        button.onclick = () => showView(button.dataset.view);
    });

    document.querySelector('#logout').onclick = () => {
        localStorage.clear();
        state.token = null;
        state.user = null;
        authView();
    };

    showView(view);
}

async function showView(view) {
    const target = document.querySelector('#view');
    document.querySelectorAll('[data-view]').forEach((button) => {
        button.classList.toggle('active', button.dataset.view === view);
    });

    if (view === 'dashboard') return dashboard(target);
    if (view === 'patients') return patientsView(target);
    if (view === 'new-patient') return patientForm(target);
    if (view === 'assessment') return assessmentView(target);
    if (view === 'history') return historyView(target);
    if (view === 'report') return reportView(target);
}

function header(title, subtitle) {
    return `
        <div class="topbar">
            <div>
                <div class="eyebrow">${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                <h1 class="title">${title}</h1>
                <p class="subtitle">${subtitle}</p>
            </div>
            <div class="user-chip">
                <span class="avatar">${esc((state.user?.name || 'A').slice(0, 1).toUpperCase())}</span>
                ${esc(state.user?.name || '')} · ${esc(state.user?.role || '')}
            </div>
        </div>
    `;
}

async function loadPatients() {
    state.patients = (await api('/api/patients')).patients;
    return state.patients;
}

async function loadAssessments() {
    state.assessments = (await api('/api/assessments')).assessments;
    return state.assessments;
}

async function dashboard(target) {
    try {
        await Promise.all([loadPatients(), loadAssessments()]);
        target.innerHTML = `
            ${header(`Good day, ${esc(state.user.name.split(' ')[0])}.`, 'A calm, auditable place to hold the person behind the responses.')}
            <div class="grid grid-3">
                <div class="card metric"><div class="eyebrow">Patient panel</div><div class="value">${state.patients.length}</div><div class="caption">patient profiles created</div></div>
                <div class="card metric"><div class="eyebrow">Practice record</div><div class="value">${state.assessments.length}</div><div class="caption">completed assessments</div></div>
                <div class="card metric"><div class="eyebrow">Current role</div><div class="value" style="font-size:28px">${esc(state.user.role)}</div><div class="caption">with private records</div></div>
            </div>
            <div class="grid grid-2" style="margin-top:18px">
                <div class="card"><h2 class="section-title">Start an assessment</h2><p class="subtitle">Choose a patient, move through the baseline questions, then add your practitioner observations.</p><div class="actions" style="margin-top:20px"><button class="btn" data-view="new-patient">Create patient</button><button class="btn secondary" data-view="patients">Select patient</button></div></div>
                <div class="card"><h2 class="section-title">Methodology note</h2><p class="subtitle">This demo uses an editable, transparent weighted response model. It is a learning and documentation aid, not a clinically validated instrument.</p></div>
            </div>
        `;
        target.querySelectorAll('[data-view]').forEach((button) => button.onclick = () => showView(button.dataset.view));
    } catch (error) {
        target.innerHTML = `<div class="message">${esc(error.message)}</div>`;
    }
}

async function patientsView(target) {
    try {
        await loadPatients();
        target.innerHTML = `
            ${header('Patients', 'Keep each person\'s profile close to the assessment record.')}
            <div class="card">
                <div class="actions" style="justify-content:space-between"><h2 class="section-title">Patient profiles</h2><button class="btn" data-view="new-patient">+ New patient</button></div>
                ${state.patients.length ? state.patients.map((patient) => `
                    <div class="patient-row"><div><strong>${esc(patient.name)}</strong><div class="patient-meta">${esc(patient.age)} years · ${esc(patient.gender)}${patient.phone ? ` · ${esc(patient.phone)}` : ''}</div></div><button class="btn secondary" data-assess="${patient.id}">Start assessment</button></div>
                `).join('') : '<div class="empty">No patients yet. Create the first profile to begin.</div>'}
            </div>
        `;
        target.querySelector('[data-view]')?.addEventListener('click', () => showView('new-patient'));
        target.querySelectorAll('[data-assess]').forEach((button) => button.onclick = () => {
            state.selectedPatient = state.patients.find((patient) => patient.id === Number(button.dataset.assess));
            showView('assessment');
        });
    } catch (error) {
        target.innerHTML = `<div class="message">${esc(error.message)}</div>`;
    }
}

function patientForm(target) {
    target.innerHTML = `
        ${header('New patient', 'Capture only the basics needed for a thoughtful assessment record.')}
        <div class="card"><form id="patient-form"><div class="form-grid">
            <div class="field"><label>Patient name</label><input name="name" required></div>
            <div class="field"><label>Age</label><input name="age" type="number" min="0" max="130" required></div>
            <div class="field"><label>Gender</label><select name="gender" required><option value="">Select...</option><option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option></select></div>
            <div class="field"><label>Phone</label><input name="phone" type="tel"></div>
            <div class="field full"><label>Basic notes</label><textarea name="notes" placeholder="Context the practitioner has permission to record..."></textarea></div>
        </div><div class="actions"><button class="btn" type="submit">Save patient</button><button class="btn ghost" type="button" data-view="patients">Cancel</button></div></form></div>
    `;
    target.querySelector('[data-view]').onclick = () => showView('patients');
    target.querySelector('form').onsubmit = async (event) => {
        event.preventDefault();
        try {
            const data = await api('/api/patients', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.target))) });
            state.selectedPatient = data.patient;
            notify('Patient profile created.', true);
            showView('assessment');
        } catch (error) {
            notify(error.message);
        }
    };
}

async function assessmentView(target) {
    try {
        if (!state.selectedPatient) {
            await loadPatients();
            state.selectedPatient = state.patients[0];
        }
        if (!state.selectedPatient) return showView('patients');
        if (!state.questions.length) state.questions = (await api('/api/questions')).questions;
        target.innerHTML = `
            ${header('Baseline questionnaire', esc(state.selectedPatient.name))}
            <form id="assessment-form"><div class="card"><div class="eyebrow">${state.questions.length} prompts · 1 to 5 response scale</div><h2 class="section-title">Observe patterns, not symptoms</h2><p class="subtitle">Select the response that best represents the person\'s usual pattern. There are no right or wrong answers.</p>
            ${state.questions.map((question, index) => `<div class="question"><h3>${index + 1}. ${esc(question.prompt)}</h3><div class="scale ${question.scale.length === 3 ? 'three' : ''}">${question.scale.map((label, value) => `<label><input type="radio" name="${question.id}" value="${value + 1}" required><span>${esc(label)}</span></label>`).join('')}</div><div class="eyebrow" style="margin-top:8px">${esc(question.category)}</div></div>`).join('')}
            </div><div class="card" style="margin-top:18px"><h2 class="section-title">Practitioner observations</h2><p class="subtitle">Record context and observations in your own words. Avoid diagnostic conclusions or treatment instructions.</p><div class="field" style="margin-top:16px"><textarea name="observations" maxlength="5000" placeholder="Posture, voice, gait, visible qualities, interaction notes..."></textarea></div><div class="actions"><button class="btn" type="submit">Calculate constitution</button><button class="btn ghost" type="button" data-view="patients">Exit</button></div></div></form>
        `;
        target.querySelector('[data-view]').onclick = () => showView('patients');
        target.querySelector('form').onsubmit = async (event) => {
            event.preventDefault();
            const form = new FormData(event.target);
            const answers = Object.fromEntries(state.questions.map((question) => [question.id, form.get(question.id)]));
            try {
                const data = await api('/api/assessments', { method: 'POST', body: JSON.stringify({ patientId: state.selectedPatient.id, answers, observations: form.get('observations') }) });
                state.currentAssessment = data.assessment;
                notify('Assessment saved.', true);
                showView('report');
            } catch (error) {
                notify(error.message);
            }
        };
    } catch (error) {
        target.innerHTML = `<div class="message">${esc(error.message)}</div>`;
    }
}

async function historyView(target) {
    try {
        await loadAssessments();
        target.innerHTML = `${header('Assessment history', 'A private timeline of completed constitutional assessments.')}<div class="card">${state.assessments.length ? state.assessments.map((assessment) => `<div class="history-row"><div><strong>${esc(assessment.patient_name)}</strong><div class="patient-meta">${new Date(assessment.created_at).toLocaleDateString()} · Dominant ${esc(assessment.dominant_dosha)}</div></div><button class="btn secondary" data-report="${assessment.id}">View report</button></div>`).join('') : '<div class="empty">Completed assessments will appear here.</div>'}</div>`;
        target.querySelectorAll('[data-report]').forEach((button) => button.onclick = async () => {
            state.currentAssessment = (await api(`/api/assessments/${button.dataset.report}`)).assessment;
            showView('report');
        });
    } catch (error) {
        target.innerHTML = `<div class="message">${esc(error.message)}</div>`;
    }
}

async function reportView(target) {
    if (!state.currentAssessment) return showView('history');
    const assessment = state.currentAssessment;
    const percentages = assessment.percentages || { Vata: assessment.vata_pct, Pitta: assessment.pitta_pct, Kapha: assessment.kapha_pct };
    target.innerHTML = `
        ${header('Assessment report', 'A structured record for practitioner review and discussion.')}
        <div class="actions print-hide" style="margin-bottom:18px"><button class="btn" onclick="window.print()">Print / Save as PDF</button><button class="btn ghost" data-view="history">Back to history</button></div>
        <article class="card report"><div class="report-head"><div class="eyebrow">AyurEssence constitutional assessment</div><h2 class="title" style="font-size:36px">${esc(assessment.patient_name || assessment.patient?.name)}</h2><p class="subtitle">Prepared ${new Date(assessment.created_at || Date.now()).toLocaleString()}</p></div>
        <div class="report-grid"><div><small>Patient demographics</small>${esc(assessment.age)} years · ${esc(assessment.gender)}<br>${esc(assessment.phone || 'No phone recorded')}</div><div><small>Assessor</small>${esc(assessment.assessor_name || state.user.name)}<br>${esc(assessment.assessor_role || state.user.role)}</div></div>
        <div class="dominant"><div><div class="eyebrow">Dominant constitution</div><strong>${esc(assessment.dominant || assessment.dominant_dosha)}</strong></div><span>Highest proportion in this questionnaire model.</span></div>
        <div style="margin-top:24px">${[['Vata', 'vata'], ['Pitta', 'pitta'], ['Kapha', 'kapha']].map(([name, className]) => `<div class="bar-wrap"><div class="bar-label"><span>${name}</span><span>${percentages[name]}%</span></div><div class="bar"><i class="${className}" style="width:${percentages[name]}%"></i></div></div>`).join('')}</div>
        <section style="margin-top:28px"><h2 class="section-title">Practitioner observations</h2><p>${esc(assessment.observations || 'No observations recorded.')}</p></section>
        <section class="disclaimer"><strong>Methodology and reference</strong><p>This report uses the AyurEssence demo questionnaire and a transparent weighted response model. This demo formula is not clinically validated and does not diagnose disease, prescribe medicines, recommend treatment, or replace an Ayurvedic practitioner or medical professional.</p></section></article>
    `;
    target.querySelector('[data-view]')?.addEventListener('click', () => showView('history'));
}

if (state.token) {
    api('/api/me').then(() => renderShell()).catch(() => {
        localStorage.clear();
        authView();
    });
} else {
    authView();
}