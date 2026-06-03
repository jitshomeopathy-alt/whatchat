/**
 * Fixed question sets for each recovery category.
 *
 * Category X – Physical / Pain Management (5 questions)
 * Category Y – Mental / Emotional Wellness (7 questions)
 * Category Z – Chronic / Lifestyle Conditions (10 questions)
 */

const questions = {
  X: [
    'Where do you feel pain or discomfort most often? (e.g., head, back, joints, chest)',
    'On a scale of 1–10, how severe is the pain on a typical day?',
    'How long have you been experiencing this pain or physical discomfort?',
    'Does the pain get worse with movement, rest, or at a specific time of day?',
    'Have you taken any medications or tried any treatments for this pain? If yes, what were they and did they help?',
  ],

  Y: [
    'How would you describe your overall mood over the past two weeks? (e.g., anxious, low, irritable, numb)',
    'How is your sleep? Do you have trouble falling asleep, staying asleep, or do you sleep too much?',
    'On a scale of 1–10, how stressed do you feel on a typical day?',
    'Have you lost interest in activities you used to enjoy? If so, for how long?',
    'Do you experience panic attacks, intrusive thoughts, or persistent worry? Please describe briefly.',
    'How is your appetite — has it increased, decreased, or stayed the same recently?',
    'Do you have a support system (friends, family, therapist) you can talk to about how you feel?',
  ],

  Z: [
    'Do you have any diagnosed chronic conditions? (e.g., diabetes, hypertension, thyroid issues, asthma)',
    'How would you describe your daily diet? (e.g., balanced, high in sugar/fat, vegetarian, irregular meals)',
    'How much water do you drink per day (in glasses or litres)?',
    'How many hours of physical activity or exercise do you get per week?',
    'Do you smoke or use tobacco? If yes, how much and for how long?',
    'Do you consume alcohol? If yes, how frequently and roughly how much per week?',
    'How would you rate the quality of your sleep on a scale of 1–10?',
    'Do you experience frequent fatigue, low energy, or difficulty concentrating?',
    'Are you currently on any long-term medications or supplements? If yes, please list them.',
    'Have you had any major illnesses, surgeries, or hospitalisations in the past five years?',
  ],
};

module.exports = questions;
