/**
 * Fixed question sets for each recovery category.
 *
 * Each question is an object:
 *   { text, options: string[], multiSelect: boolean }
 *
 * The flow renders options as a tappable WhatsApp list when there are <= 10
 * single-select options, and falls back to numbered text (user replies with
 * number(s)) when there are more than 10 options or the question is multiSelect.
 *
 * Category addiction – De-addiction / Substance Recovery (9 questions)
 * Category mental   – Mental / Emotional Wellness (10 questions)
 * Category sex      – Sexual Health & Wellness (8 questions)
 */

const questions = {
  addiction: [
    {
      text: 'आप मुख्य रूप से किस चीज़ से परेशान हैं?',
      options: [
        'शराब (Alcohol)',
        'तंबाकू / गुटखा / सिगरेट',
        'गांजा / भांग (Cannabis)',
        'अफीम / नशे की दवाएं (Opioids)',
        'नींद की गोलियां / cough syrup',
        'Party drugs / stimulants',
        'Inhalants (सुलोशन, पेट्रोल)',
        'एक से अधिक चीज़ें',
        'मुझे पक्का नहीं पता',
      ],
      multiSelect: false,
    },
    {
      text: 'आप इस बारे में क्या चाहते हैं?',
      options: [
        'पूरी तरह छोड़ना (Quit)',
        'कम करना (Reduce)',
        'पहले stabilize करना',
        'समझना चाहता हूँ — अभी decide नहीं',
        'किसी और की मदद के लिए',
      ],
      multiSelect: false,
    },
    {
      text: 'क्या आपने हाल ही में इनमें से कुछ महसूस किया है? (जितने भी लागू हों)',
      options: [
        'अचानक कंपकंपी / seizure',
        'बेहोशी जैसा / confusion',
        'बहुत ज़्यादा नशा एक साथ (overdose)',
        'खुद को नुकसान के विचार',
        'बहुत aggressive / violent',
        'ऊपर में से कुछ नहीं',
      ],
      multiSelect: true,
    },
    {
      text: 'कितने समय से यह habit है?',
      options: ['6 महीने से कम', '6 महीने – 2 साल', '2 – 5 साल', '5 साल से ज़्यादा'],
      multiSelect: false,
    },
    {
      text: 'रोज़ औसतन कितना लेते हैं?',
      options: [
        '1-2 पेग / बोतल',
        '3-5 पेग / बोतल',
        'आधी बोतल से ज़्यादा',
        'रोज़ नहीं, पर शुरू हो तो रुकना मुश्किल',
      ],
      multiSelect: false,
    },
    {
      text: 'क्या पहले कभी छोड़ने की कोशिश की है?',
      options: [
        'नहीं, यह पहली बार है',
        'हाँ, 1-2 हफ्ते बाद वापस',
        'हाँ, कई बार try किया',
        'थोड़ा कम किया लेकिन छोड़ा नहीं',
      ],
      multiSelect: false,
    },
    {
      text: 'नींद के बारे में बताएं:',
      options: [
        'नींद ठीक है',
        'नींद कम / बीच में टूटती है',
        'बिना नशे के नींद नहीं आती',
        'ज़रूरत से ज़्यादा सो रहा/रही हूँ',
      ],
      multiSelect: false,
    },
    {
      text: 'आमतौर पर craving कब आती है?',
      options: [
        'Stress / काम का दबाव',
        'अकेलापन / बोरियत',
        'दोस्तों के साथ / social',
        'घर में झगड़ा / family tension',
        'रोज़ का routine — बिना कारण',
        'कई reasons हैं',
      ],
      multiSelect: false,
    },
    {
      text: 'घर/करीबी लोगों में से कोई इस बारे में जानता है?',
      options: [
        'हाँ, और वे support करते हैं',
        'हाँ, लेकिन judgment करते हैं',
        'नहीं, किसी को नहीं पता',
        'मैं family के लिए यहाँ हूँ',
      ],
      multiSelect: false,
    },
  ],

  mental: [
    {
      text: 'What is the dominant mental state right now? (choose the closest)',
      options: [
        'Fearful', 'Anxious', 'Sad', 'Irritable', 'Angry', 'Suspicious',
        'Jealous', 'Guilty', 'Restless', 'Detached', 'Obsessive', 'Numb', 'Hopeless',
      ],
      multiSelect: false,
    },
    {
      text: 'What makes it worse? (choose all that apply)',
      options: [
        'Criticism', 'Insult', 'Family conflict', 'Loneliness', 'Crowds',
        'Exam/work pressure', 'Night-time', 'Morning', 'Being alone', 'Being busy',
        'Noise', 'Hunger', 'Heat', 'Cold', 'Menses', 'Bad news', 'Grief', 'Suppression',
      ],
      multiSelect: true,
    },
    {
      text: 'What makes it better? (choose the strongest relief)',
      options: [
        'Company', 'Consolation', 'Being left alone', 'Talking', 'Crying', 'Sleep',
        'Walking', 'Motion', 'Prayer', 'Music', 'Food', 'Warmth', 'Open air',
        'Cold air', 'Pressure', 'Massage',
      ],
      multiSelect: false,
    },
    {
      text: 'How does the person behave under stress?',
      options: [
        'Silent and closed', 'Overtalkative', 'Clingy', 'Demanding', 'Aggressive',
        'Weeping', 'Avoidant', 'Perfectionistic', 'Indecisive', 'Controlling',
        'Cowardly', 'Suspicious', 'Argumentative', 'Impulsive',
      ],
      multiSelect: false,
    },
    {
      text: 'What is the strongest inner fear or thought loop?',
      options: [
        'Fear of death', 'Fear of failure', 'Fear of illness', 'Fear of being abandoned',
        'Fear of dark', 'Fear of poverty', 'Fear of criticism', 'Fear of responsibility',
        'Fear of losing control', 'Guilt', 'Self-blame', 'Revenge thoughts', 'Jealous thoughts',
      ],
      multiSelect: false,
    },
    {
      text: 'How is sleep affected?',
      options: [
        'No sleep', 'Broken sleep', 'Waking at fixed hours', 'Fear at night', 'Nightmares',
        'Excessive sleep', 'Thoughts race, cannot fall asleep', 'Wakes unrefreshed',
        'Sleeps better after crying', 'Sleep worse after worry',
      ],
      multiSelect: false,
    },
    {
      text: 'What are the food desires or aversions?',
      options: [
        'Craves sweets', 'Craves salt', 'Craves spicy', 'Craves tea', 'Craves coffee',
        'Craves milk', 'Craves fried food', 'Craves cold drinks', 'Craves eggs',
        'Aversion to food', 'Nausea from smell', 'Loss of appetite',
        'Empty-stomach aggravation', 'Overeating when stressed',
      ],
      multiSelect: false,
    },
    {
      text: 'What is the exact trigger or origin story?',
      options: [
        'After grief', 'Breakup', 'Marriage stress', 'Childbirth', 'School failure',
        'Business loss', 'Insult', 'Betrayal', 'Fright', 'Prolonged overwork',
        'Suppression of anger', 'Humiliation', 'Chronic family pressure', 'Substance use',
      ],
      multiSelect: false,
    },
    {
      text: 'What is the person like as a human being when well?',
      options: [
        'Mild', 'Soft', 'Proud', 'Dominating', 'Meticulous', 'Religious', 'Sensitive',
        'Anxious', 'Fastidious', 'Rigid', 'Affectionate', 'Indifferent', 'Ambitious',
        'Cowardly', 'Sympathetic', 'Introverted', 'Extroverted',
      ],
      multiSelect: false,
    },
    {
      text: 'Any danger signs present right now? (choose all that apply)',
      options: [
        'Suicidal thoughts', 'Self-harm', 'Hallucinations', 'Extreme agitation', 'Violence',
        'Not sleeping for days', 'Confusion', 'Mania', 'Refusal to eat/drink',
        'Intoxication', 'Severe panic', 'Disconnection from reality', 'None of these',
      ],
      multiSelect: true,
    },
  ],

  sex: [
    {
      text: 'What is the main issue for you?',
      options: [
        'Low desire', 'Difficulty getting aroused', 'Difficulty during intercourse',
        'Early release', 'No release', 'Pain', 'Discharge', 'Something else',
      ],
      multiSelect: false,
    },
    {
      text: 'Do you have any of these? (choose all that apply)',
      options: [
        'Involuntary discharge', 'Nightfall', 'Premature ejaculation', 'Pain on ejaculation',
        'Vaginal dryness', 'Itching', 'Burning', 'Unusual smell/discharge', 'None of these',
      ],
      multiSelect: true,
    },
    {
      text: 'Since when, and was the start sudden or gradual?',
      options: [
        'Less than a month — sudden', 'Less than a month — gradual',
        '1–6 months', '6–12 months', 'More than a year',
      ],
      multiSelect: false,
    },
    {
      text: 'When do you feel the problem most?',
      options: ['Before sex', 'During sex', 'After sex'],
      multiSelect: false,
    },
    {
      text: 'After sexual activity, do you feel any of these? (choose all that apply)',
      options: [
        'Weakness', 'Exhaustion', 'Guilt', 'Anxiety', 'Headache', 'Backache',
        'Burning', 'Palpitations', 'Loss of confidence', 'None of these',
      ],
      multiSelect: true,
    },
    {
      text: 'How is your sexual desire overall?',
      options: ['Increased', 'Reduced', 'Absent', 'Variable', 'Only in certain situations'],
      multiSelect: false,
    },
    {
      text: 'What makes it worse or better? (choose all that apply)',
      options: [
        'Stress', 'Guilt', 'Porn', 'Masturbation', 'Alcohol', 'Smoking', 'Tiredness',
        'Food', 'Time of day', 'Relationship conflict', 'After sleep',
      ],
      multiSelect: true,
    },
    {
      text: 'How do you feel emotionally around this problem?',
      options: ['Ashamed', 'Fearful', 'Frustrated', 'Guilty', 'Angry', 'Indifferent', 'Obsessive'],
      multiSelect: false,
    },
  ],
};

module.exports = questions;
