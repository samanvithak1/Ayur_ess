/*
 * Expert-editable questionnaire and scoring configuration.
 * The demo formula is educational and has not been clinically validated.
 */
const DOSHAS = ['Vata', 'Pitta', 'Kapha'];

const QUESTIONS = [
  { id: 'body_frame', category: 'Physical characteristics', prompt: 'How would you describe the person\'s natural body frame?', scale: ['Very slender / light', 'Slender', 'Moderate', 'Solid', 'Broad / sturdy'], weights: [
    { Vata: 5, Pitta: 2, Kapha: 1 }, { Vata: 4, Pitta: 2, Kapha: 1 }, { Vata: 2, Pitta: 3, Kapha: 2 }, { Vata: 1, Pitta: 3, Kapha: 4 }, { Vata: 1, Pitta: 2, Kapha: 5 }
  ] },
  { id: 'weight', category: 'Body structure', prompt: 'How does body weight tend to change?', scale: ['Changes easily; hard to gain', 'Usually light', 'Steady', 'Gains with effort', 'Gains easily; hard to lose'], weights: [
    { Vata: 5, Pitta: 3, Kapha: 1 }, { Vata: 4, Pitta: 2, Kapha: 1 }, { Vata: 2, Pitta: 3, Kapha: 3 }, { Vata: 1, Pitta: 3, Kapha: 4 }, { Vata: 1, Pitta: 2, Kapha: 5 }
  ] },
  { id: 'skin', category: 'Skin / hair characteristics', prompt: 'What is the usual skin quality?', scale: ['Dry / thin', 'Dry or variable', 'Balanced', 'Warm / sensitive', 'Smooth / moist / thick'], weights: [
    { Vata: 5, Pitta: 1, Kapha: 1 }, { Vata: 4, Pitta: 2, Kapha: 1 }, { Vata: 2, Pitta: 3, Kapha: 2 }, { Vata: 1, Pitta: 5, Kapha: 1 }, { Vata: 1, Pitta: 2, Kapha: 5 }
  ] },
  { id: 'hair', category: 'Skin / hair characteristics', prompt: 'What best describes the hair?', scale: ['Dry, thin, or frizzy', 'Fine and soft', 'Moderate texture', 'Fine, warm-toned, or early greying', 'Thick, lustrous, or oily'], weights: [
    { Vata: 5, Pitta: 2, Kapha: 1 }, { Vata: 4, Pitta: 2, Kapha: 1 }, { Vata: 2, Pitta: 3, Kapha: 2 }, { Vata: 1, Pitta: 5, Kapha: 1 }, { Vata: 1, Pitta: 2, Kapha: 5 }
  ] },
  { id: 'appetite', category: 'Appetite / digestion', prompt: 'How is appetite generally experienced?', scale: ['Irregular', 'Variable', 'Regular', 'Strong and punctual', 'Steady but slower'], weights: [
    { Vata: 5, Pitta: 1, Kapha: 1 }, { Vata: 4, Pitta: 2, Kapha: 1 }, { Vata: 2, Pitta: 3, Kapha: 2 }, { Vata: 1, Pitta: 5, Kapha: 1 }, { Vata: 1, Pitta: 2, Kapha: 5 }
  ] },
  { id: 'digestion', category: 'Appetite / digestion', prompt: 'How would you describe digestion after meals?', scale: ['Variable / sensitive', 'Usually quick', 'Comfortably regular', 'Very strong', 'Slow / heavy'], weights: [
    { Vata: 5, Pitta: 2, Kapha: 1 }, { Vata: 2, Pitta: 5, Kapha: 1 }, { Vata: 2, Pitta: 3, Kapha: 3 }, { Vata: 1, Pitta: 5, Kapha: 1 }, { Vata: 1, Pitta: 2, Kapha: 5 }
  ] },
  { id: 'sleep', category: 'Sleep patterns', prompt: 'What is the usual sleep pattern?', scale: ['Light / interrupted', 'Variable', 'Moderate', 'Deep but shorter', 'Deep and long'], weights: [
    { Vata: 5, Pitta: 2, Kapha: 1 }, { Vata: 4, Pitta: 2, Kapha: 1 }, { Vata: 2, Pitta: 3, Kapha: 3 }, { Vata: 1, Pitta: 4, Kapha: 2 }, { Vata: 1, Pitta: 2, Kapha: 5 }
  ] },
  { id: 'activity', category: 'Activity patterns', prompt: 'What is the person\'s natural activity pace?', scale: ['Fast, changeable', 'Quick and enthusiastic', 'Moderate', 'Focused and driven', 'Steady and deliberate'], weights: [
    { Vata: 5, Pitta: 2, Kapha: 1 }, { Vata: 4, Pitta: 3, Kapha: 1 }, { Vata: 2, Pitta: 3, Kapha: 3 }, { Vata: 1, Pitta: 5, Kapha: 1 }, { Vata: 1, Pitta: 2, Kapha: 5 }
  ] },
  { id: 'communication', category: 'Behavioral characteristics', prompt: 'How does communication usually flow?', scale: ['Fast and animated', 'Expressive and direct', 'Clear and measured', 'Precise and persuasive', 'Calm and thoughtful'], weights: [
    { Vata: 5, Pitta: 2, Kapha: 1 }, { Vata: 4, Pitta: 3, Kapha: 1 }, { Vata: 2, Pitta: 3, Kapha: 3 }, { Vata: 1, Pitta: 5, Kapha: 1 }, { Vata: 1, Pitta: 2, Kapha: 5 }
  ] },
  { id: 'stress_response', category: 'Behavioral characteristics', prompt: 'What is the common response to stress?', scale: ['Worry / restlessness', 'Irritation / intensity', 'Withdrawal / steadiness'], weights: [
    { Vata: 5, Pitta: 1, Kapha: 1 }, { Vata: 1, Pitta: 5, Kapha: 1 }, { Vata: 1, Pitta: 1, Kapha: 5 }
  ] },
  { id: 'temperature', category: 'Physiological tendencies', prompt: 'What temperature tendency is most familiar?', scale: ['Often feels cold', 'Comfortable / variable', 'Often feels warm'], weights: [
    { Vata: 5, Pitta: 2, Kapha: 2 }, { Vata: 2, Pitta: 3, Kapha: 3 }, { Vata: 1, Pitta: 5, Kapha: 2 }
  ] },
  { id: 'energy', category: 'Physiological tendencies', prompt: 'How does energy typically behave through the day?', scale: ['Comes in bursts', 'Strong and consistent', 'Slow to start but sustained'], weights: [
    { Vata: 5, Pitta: 4, Kapha: 1 }, { Vata: 1, Pitta: 5, Kapha: 2 }, { Vata: 1, Pitta: 2, Kapha: 5 }
  ] }
];

function calculateScores(answers) {
  const totals = { Vata: 0, Pitta: 0, Kapha: 0 };
  let answered = 0;
  QUESTIONS.forEach((question) => {
    const value = Number(answers[question.id]);
    if (!Number.isInteger(value) || value < 1 || value > question.weights.length) return;
    const weights = question.weights[value - 1];
    DOSHAS.forEach((dosha) => { totals[dosha] += weights[dosha]; });
    answered += 1;
  });
  if (answered !== QUESTIONS.length) throw new Error('Please answer every questionnaire item.');
  const total = Object.values(totals).reduce((sum, value) => sum + value, 0);
  const percentages = Object.fromEntries(DOSHAS.map((dosha) => [dosha, Math.round((totals[dosha] / total) * 100)]));
  const dominant = DOSHAS.reduce((best, dosha) => percentages[dosha] > percentages[best] ? dosha : best, DOSHAS[0]);
  return { totals, percentages, dominant };
}

module.exports = { DOSHAS, QUESTIONS, calculateScores };
