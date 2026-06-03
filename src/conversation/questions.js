/**
 * Fixed question sets for each recovery category.
 *
 * Category X – Physical / Pain Management (5 questions)
 * Category Y – Mental / Emotional Wellness (7 questions)
 * Category Z – Chronic / Lifestyle Conditions (10 questions)
 */

const questions = {
  health: [
    'Where do you feel pain or discomfort most often? (e.g., head, back, joints, chest)',
    'On a scale of 1–10, how severe is the pain on a typical day?',
    'How long have you been experiencing this pain or physical discomfort?',
    'Does the pain get worse with movement, rest, or at a specific time of day?',
    'Have you taken any medications or tried any treatments for this pain? If yes, what were they and did they help?',
  ],

  mental: [
    'How would you describe your overall mood over the past two weeks? (e.g., anxious, low, irritable, numb)',
    'How is your sleep? Do you have trouble falling asleep, staying asleep, or do you sleep too much?',
    'On a scale of 1–10, how stressed do you feel on a typical day?',
    'Have you lost interest in activities you used to enjoy? If so, for how long?',
    'Do you experience panic attacks, intrusive thoughts, or persistent worry? Please describe briefly.',
    'How is your appetite — has it increased, decreased, or stayed the same recently?',
    'Do you have a support system (friends, family, therapist) you can talk to about how you feel?',
  ],

  sex: [
    'Have you noticed any changes in your sexual drive or libido recently? (e.g., increased, decreased, absent)',
    'Do you experience any pain, discomfort, or unusual symptoms during or after sexual activity?',
    'Have you been tested for sexually transmitted infections (STIs) in the past year? If yes, what were the results?',
    'Do you have any concerns about fertility, hormonal balance, or reproductive health?',
    'Are you experiencing any issues with sexual function? (e.g., erectile dysfunction, vaginal dryness, difficulty reaching orgasm)',
  ],
};

module.exports = questions;
