/**
 * Fixed question sets for each consultation category, in English (en) and Hindi (hi).
 *
 * Each question is an object:
 *   { multiSelect: boolean, en: { text, options[] }, hi: { text, options[] } }
 *
 * Use getQuestions(category, lang) to get a localized array of
 *   { text, options, multiSelect }
 * which is what the conversation flow renders.
 *
 * The flow renders options as a tappable WhatsApp list when there are <= 10
 * single-select options with short titles, and falls back to numbered text
 * otherwise.
 *
 * addiction – De-addiction / Substance Recovery
 * mental    – Mental / Emotional Wellness
 * sex       – Sexual Health & Wellness
 */

const questions = {
  addiction: [
    {
      multiSelect: false,
      en: {
        text: 'What are you mainly struggling with?',
        options: [
          'Alcohol',
          'Tobacco / gutka / cigarettes',
          'Cannabis (ganja / bhang)',
          'Opioids / narcotic drugs',
          'Sleeping pills / cough syrup',
          'Party drugs / stimulants',
          'Inhalants (solution, petrol)',
          'More than one thing',
          "I'm not sure",
        ],
      },
      hi: {
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
      },
    },
    {
      multiSelect: false,
      en: {
        text: 'What do you want regarding this?',
        options: [
          'Quit completely',
          'Reduce it',
          'Stabilize first',
          'Want to understand — not decided yet',
          'To help someone else',
        ],
      },
      hi: {
        text: 'आप इस बारे में क्या चाहते हैं?',
        options: [
          'पूरी तरह छोड़ना (Quit)',
          'कम करना (Reduce)',
          'पहले stabilize करना',
          'समझना चाहता हूँ — अभी decide नहीं',
          'किसी और की मदद के लिए',
        ],
      },
    },
    {
      multiSelect: true,
      en: {
        text: 'Have you recently felt any of these? (choose all that apply)',
        options: [
          'Sudden tremors / seizure',
          'Faint-like / confusion',
          'Heavy overdose at once',
          'Thoughts of self-harm',
          'Very aggressive / violent',
          'None of the above',
        ],
      },
      hi: {
        text: 'क्या आपने हाल ही में इनमें से कुछ महसूस किया है? (जितने भी लागू हों)',
        options: [
          'अचानक कंपकंपी / seizure',
          'बेहोशी जैसा / confusion',
          'बहुत ज़्यादा नशा एक साथ (overdose)',
          'खुद को नुकसान के विचार',
          'बहुत aggressive / violent',
          'ऊपर में से कुछ नहीं',
        ],
      },
    },
    {
      multiSelect: false,
      en: {
        text: 'How long have you had this habit?',
        options: ['Less than 6 months', '6 months – 2 years', '2 – 5 years', 'More than 5 years'],
      },
      hi: {
        text: 'कितने समय से यह habit है?',
        options: ['6 महीने से कम', '6 महीने – 2 साल', '2 – 5 साल', '5 साल से ज़्यादा'],
      },
    },
    {
      multiSelect: false,
      en: {
        text: 'On average, how much do you take per day?',
        options: [
          '1-2 pegs / bottle',
          '3-5 pegs / bottle',
          'More than half a bottle',
          "Not daily, but hard to stop once started",
        ],
      },
      hi: {
        text: 'रोज़ औसतन कितना लेते हैं?',
        options: [
          '1-2 पेग / बोतल',
          '3-5 पेग / बोतल',
          'आधी बोतल से ज़्यादा',
          'रोज़ नहीं, पर शुरू हो तो रुकना मुश्किल',
        ],
      },
    },
    {
      multiSelect: false,
      en: {
        text: 'Have you tried to quit before?',
        options: [
          'No, this is the first time',
          'Yes, relapsed after 1-2 weeks',
          'Yes, tried many times',
          "Reduced a bit but didn't quit",
        ],
      },
      hi: {
        text: 'क्या पहले कभी छोड़ने की कोशिश की है?',
        options: [
          'नहीं, यह पहली बार है',
          'हाँ, 1-2 हफ्ते बाद वापस',
          'हाँ, कई बार try किया',
          'थोड़ा कम किया लेकिन छोड़ा नहीं',
        ],
      },
    },
    {
      multiSelect: false,
      en: {
        text: 'Tell us about your sleep:',
        options: [
          'Sleep is fine',
          'Less sleep / breaks in between',
          'Cannot sleep without the substance',
          'Sleeping more than needed',
        ],
      },
      hi: {
        text: 'नींद के बारे में बताएं:',
        options: [
          'नींद ठीक है',
          'नींद कम / बीच में टूटती है',
          'बिना नशे के नींद नहीं आती',
          'ज़रूरत से ज़्यादा सो रहा/रही हूँ',
        ],
      },
    },
    {
      multiSelect: false,
      en: {
        text: 'When do cravings usually come?',
        options: [
          'Stress / work pressure',
          'Loneliness / boredom',
          'With friends / social',
          'Home conflict / family tension',
          'Daily routine — no reason',
          'Many reasons',
        ],
      },
      hi: {
        text: 'आमतौर पर craving कब आती है?',
        options: [
          'Stress / काम का दबाव',
          'अकेलापन / बोरियत',
          'दोस्तों के साथ / social',
          'घर में झगड़ा / family tension',
          'रोज़ का routine — बिना कारण',
          'कई reasons हैं',
        ],
      },
    },
    {
      multiSelect: false,
      en: {
        text: 'Does anyone close to you know about this?',
        options: [
          'Yes, and they support me',
          'Yes, but they judge me',
          'No, nobody knows',
          'I am here for family',
        ],
      },
      hi: {
        text: 'घर/करीबी लोगों में से कोई इस बारे में जानता है?',
        options: [
          'हाँ, और वे support करते हैं',
          'हाँ, लेकिन judgment करते हैं',
          'नहीं, किसी को नहीं पता',
          'मैं family के लिए यहाँ हूँ',
        ],
      },
    },
  ],

  mental: [
    {
      multiSelect: false,
      en: {
        text: 'What is the dominant mental state right now? (choose the closest)',
        options: [
          'Fearful', 'Anxious', 'Sad', 'Irritable', 'Angry', 'Suspicious',
          'Jealous', 'Guilty', 'Restless', 'Detached', 'Obsessive', 'Numb', 'Hopeless',
        ],
      },
      hi: {
        text: 'अभी सबसे ज़्यादा कौन सी मानसिक स्थिति है? (सबसे करीब चुनें)',
        options: [
          'डरा हुआ', 'चिंतित', 'उदास', 'चिड़चिड़ा', 'गुस्सैल', 'शक्की',
          'ईर्ष्यालु', 'अपराधबोध', 'बेचैन', 'कटा-कटा', 'जुनूनी', 'सुन्न', 'निराश',
        ],
      },
    },
    {
      multiSelect: true,
      en: {
        text: 'What makes it worse? (choose all that apply)',
        options: [
          'Criticism', 'Insult', 'Family conflict', 'Loneliness', 'Crowds',
          'Exam/work pressure', 'Night-time', 'Morning', 'Being alone', 'Being busy',
          'Noise', 'Hunger', 'Heat', 'Cold', 'Menses', 'Bad news', 'Grief', 'Suppression',
        ],
      },
      hi: {
        text: 'किस से और बिगड़ता है? (जितने भी लागू हों)',
        options: [
          'आलोचना', 'अपमान', 'पारिवारिक झगड़ा', 'अकेलापन', 'भीड़',
          'परीक्षा/काम का दबाव', 'रात का समय', 'सुबह', 'अकेले होना', 'व्यस्त होना',
          'शोर', 'भूख', 'गर्मी', 'ठंड', 'माहवारी', 'बुरी खबर', 'शोक', 'दमन',
        ],
      },
    },
    {
      multiSelect: false,
      en: {
        text: 'What makes it better? (choose the strongest relief)',
        options: [
          'Company', 'Consolation', 'Being left alone', 'Talking', 'Crying', 'Sleep',
          'Walking', 'Motion', 'Prayer', 'Music', 'Food', 'Warmth', 'Open air',
          'Cold air', 'Pressure', 'Massage',
        ],
      },
      hi: {
        text: 'किस से राहत मिलती है? (सबसे ज़्यादा राहत चुनें)',
        options: [
          'साथ', 'सांत्वना', 'अकेला छोड़ देना', 'बात करना', 'रोना', 'नींद',
          'टहलना', 'हलचल', 'प्रार्थना', 'संगीत', 'खाना', 'गर्माहट', 'खुली हवा',
          'ठंडी हवा', 'दबाव', 'मालिश',
        ],
      },
    },
    {
      multiSelect: false,
      en: {
        text: 'How does the person behave under stress?',
        options: [
          'Silent and closed', 'Overtalkative', 'Clingy', 'Demanding', 'Aggressive',
          'Weeping', 'Avoidant', 'Perfectionistic', 'Indecisive', 'Controlling',
          'Cowardly', 'Suspicious', 'Argumentative', 'Impulsive',
        ],
      },
      hi: {
        text: 'तनाव में व्यक्ति कैसा व्यवहार करता है?',
        options: [
          'चुप और बंद', 'बहुत बोलने वाला', 'चिपकू', 'मांग करने वाला', 'आक्रामक',
          'रोने वाला', 'बचने वाला', 'परफेक्शनिस्ट', 'अनिर्णायक', 'नियंत्रण करने वाला',
          'डरपोक', 'शक्की', 'बहस करने वाला', 'आवेगी',
        ],
      },
    },
    {
      multiSelect: false,
      en: {
        text: 'What is the strongest inner fear or thought loop?',
        options: [
          'Fear of death', 'Fear of failure', 'Fear of illness', 'Fear of being abandoned',
          'Fear of dark', 'Fear of poverty', 'Fear of criticism', 'Fear of responsibility',
          'Fear of losing control', 'Guilt', 'Self-blame', 'Revenge thoughts', 'Jealous thoughts',
        ],
      },
      hi: {
        text: 'सबसे गहरा डर या बार-बार आने वाला विचार क्या है?',
        options: [
          'मृत्यु का डर', 'असफलता का डर', 'बीमारी का डर', 'छोड़ दिए जाने का डर',
          'अंधेरे का डर', 'गरीबी का डर', 'आलोचना का डर', 'ज़िम्मेदारी का डर',
          'नियंत्रण खोने का डर', 'अपराधबोध', 'आत्म-दोष', 'बदले के विचार', 'ईर्ष्या के विचार',
        ],
      },
    },
    {
      multiSelect: false,
      en: {
        text: 'How is sleep affected?',
        options: [
          'No sleep', 'Broken sleep', 'Waking at fixed hours', 'Fear at night', 'Nightmares',
          'Excessive sleep', 'Thoughts race, cannot fall asleep', 'Wakes unrefreshed',
          'Sleeps better after crying', 'Sleep worse after worry',
        ],
      },
      hi: {
        text: 'नींद पर क्या असर है?',
        options: [
          'नींद नहीं आती', 'टूटी नींद', 'तय समय पर जाग जाना', 'रात में डर', 'बुरे सपने',
          'ज़्यादा नींद', 'विचारों से नींद नहीं आती', 'उठने पर ताज़गी नहीं',
          'रोने के बाद बेहतर नींद', 'चिंता के बाद बदतर नींद',
        ],
      },
    },
    {
      multiSelect: false,
      en: {
        text: 'What are the food desires or aversions?',
        options: [
          'Craves sweets', 'Craves salt', 'Craves spicy', 'Craves tea', 'Craves coffee',
          'Craves milk', 'Craves fried food', 'Craves cold drinks', 'Craves eggs',
          'Aversion to food', 'Nausea from smell', 'Loss of appetite',
          'Empty-stomach aggravation', 'Overeating when stressed',
        ],
      },
      hi: {
        text: 'खाने की इच्छा या अरुचि क्या है?',
        options: [
          'मीठे की चाह', 'नमक की चाह', 'तीखे की चाह', 'चाय की चाह', 'कॉफी की चाह',
          'दूध की चाह', 'तले की चाह', 'ठंडे पेय की चाह', 'अंडे की चाह',
          'खाने से अरुचि', 'गंध से मिचली', 'भूख न लगना',
          'खाली पेट बिगड़ना', 'तनाव में ज़्यादा खाना',
        ],
      },
    },
    {
      multiSelect: false,
      en: {
        text: 'What is the exact trigger or origin story?',
        options: [
          'After grief', 'Breakup', 'Marriage stress', 'Childbirth', 'School failure',
          'Business loss', 'Insult', 'Betrayal', 'Fright', 'Prolonged overwork',
          'Suppression of anger', 'Humiliation', 'Chronic family pressure', 'Substance use',
        ],
      },
      hi: {
        text: 'इसकी असली शुरुआत या कारण क्या था?',
        options: [
          'शोक के बाद', 'ब्रेकअप', 'विवाह तनाव', 'प्रसव', 'परीक्षा में असफलता',
          'व्यापार में घाटा', 'अपमान', 'विश्वासघात', 'डर / सदमा', 'लंबे समय का अधिक काम',
          'गुस्से का दमन', 'बेइज़्ज़ती', 'लगातार पारिवारिक दबाव', 'नशा',
        ],
      },
    },
    {
      multiSelect: false,
      en: {
        text: 'What is the person like as a human being when well?',
        options: [
          'Mild', 'Soft', 'Proud', 'Dominating', 'Meticulous', 'Religious', 'Sensitive',
          'Anxious', 'Fastidious', 'Rigid', 'Affectionate', 'Indifferent', 'Ambitious',
          'Cowardly', 'Sympathetic', 'Introverted', 'Extroverted',
        ],
      },
      hi: {
        text: 'स्वस्थ होने पर व्यक्ति का स्वभाव कैसा है?',
        options: [
          'सौम्य', 'नरम', 'गर्वीला', 'हावी रहने वाला', 'बारीकी पसंद', 'धार्मिक', 'संवेदनशील',
          'चिंतित', 'नकचढ़ा', 'कठोर', 'स्नेही', 'उदासीन', 'महत्वाकांक्षी',
          'डरपोक', 'सहानुभूतिपूर्ण', 'अंतर्मुखी', 'बहिर्मुखी',
        ],
      },
    },
    {
      multiSelect: true,
      en: {
        text: 'Any danger signs present right now? (choose all that apply)',
        options: [
          'Suicidal thoughts', 'Self-harm', 'Hallucinations', 'Extreme agitation', 'Violence',
          'Not sleeping for days', 'Confusion', 'Mania', 'Refusal to eat/drink',
          'Intoxication', 'Severe panic', 'Disconnection from reality', 'None of these',
        ],
      },
      hi: {
        text: 'क्या अभी कोई खतरे के संकेत हैं? (जितने भी लागू हों)',
        options: [
          'आत्महत्या के विचार', 'खुद को नुकसान', 'मतिभ्रम', 'अत्यधिक उत्तेजना', 'हिंसा',
          'कई दिनों से नींद नहीं', 'भ्रम', 'उन्माद', 'खाने-पीने से इनकार',
          'नशे की हालत', 'गंभीर घबराहट', 'वास्तविकता से कटाव', 'इनमें से कोई नहीं',
        ],
      },
    },
  ],

  sex: [
    {
      multiSelect: false,
      en: {
        text: 'What is the main issue for you?',
        options: [
          'Low desire', 'Difficulty getting aroused', 'Difficulty during intercourse',
          'Early release', 'No release', 'Pain', 'Discharge', 'Something else',
        ],
      },
      hi: {
        text: 'आपकी मुख्य समस्या क्या है?',
        options: [
          'इच्छा में कमी', 'उत्तेजित होने में कठिनाई', 'संभोग के दौरान कठिनाई',
          'जल्दी स्खलन', 'स्खलन न होना', 'दर्द', 'स्राव', 'कुछ और',
        ],
      },
    },
    {
      multiSelect: true,
      en: {
        text: 'Do you have any of these? (choose all that apply)',
        options: [
          'Involuntary discharge', 'Nightfall', 'Premature ejaculation', 'Pain on ejaculation',
          'Vaginal dryness', 'Itching', 'Burning', 'Unusual smell/discharge', 'None of these',
        ],
      },
      hi: {
        text: 'क्या इनमें से कुछ है? (जितने भी लागू हों)',
        options: [
          'अनैच्छिक स्राव', 'स्वप्नदोष', 'शीघ्रपतन', 'स्खलन पर दर्द',
          'योनि सूखापन', 'खुजली', 'जलन', 'असामान्य गंध / स्राव', 'इनमें से कोई नहीं',
        ],
      },
    },
    {
      multiSelect: false,
      en: {
        text: 'Since when, and was the start sudden or gradual?',
        options: [
          'Less than a month — sudden', 'Less than a month — gradual',
          '1–6 months', '6–12 months', 'More than a year',
        ],
      },
      hi: {
        text: 'कब से, और शुरुआत अचानक थी या धीरे-धीरे?',
        options: [
          'एक महीने से कम — अचानक', 'एक महीने से कम — धीरे-धीरे',
          '1–6 महीने', '6–12 महीने', 'एक साल से ज़्यादा',
        ],
      },
    },
    {
      multiSelect: false,
      en: {
        text: 'When do you feel the problem most?',
        options: ['Before sex', 'During sex', 'After sex'],
      },
      hi: {
        text: 'समस्या सबसे ज़्यादा कब महसूस होती है?',
        options: ['संभोग से पहले', 'संभोग के दौरान', 'संभोग के बाद'],
      },
    },
    {
      multiSelect: true,
      en: {
        text: 'After sexual activity, do you feel any of these? (choose all that apply)',
        options: [
          'Weakness', 'Exhaustion', 'Guilt', 'Anxiety', 'Headache', 'Backache',
          'Burning', 'Palpitations', 'Loss of confidence', 'None of these',
        ],
      },
      hi: {
        text: 'संभोग के बाद इनमें से कुछ महसूस होता है? (जितने भी लागू हों)',
        options: [
          'कमज़ोरी', 'थकान', 'अपराधबोध', 'चिंता', 'सिरदर्द', 'कमर दर्द',
          'जलन', 'धड़कन', 'आत्मविश्वास में कमी', 'इनमें से कोई नहीं',
        ],
      },
    },
    {
      multiSelect: false,
      en: {
        text: 'How is your sexual desire overall?',
        options: ['Increased', 'Reduced', 'Absent', 'Variable', 'Only in certain situations'],
      },
      hi: {
        text: 'कुल मिलाकर आपकी यौन इच्छा कैसी है?',
        options: ['बढ़ी हुई', 'कम', 'अनुपस्थित', 'बदलती रहती', 'केवल कुछ स्थितियों में'],
      },
    },
    {
      multiSelect: true,
      en: {
        text: 'What makes it worse or better? (choose all that apply)',
        options: [
          'Stress', 'Guilt', 'Porn', 'Masturbation', 'Alcohol', 'Smoking', 'Tiredness',
          'Food', 'Time of day', 'Relationship conflict', 'After sleep',
        ],
      },
      hi: {
        text: 'किस से बिगड़ता या सुधरता है? (जितने भी लागू हों)',
        options: [
          'तनाव', 'अपराधबोध', 'पोर्न', 'हस्तमैथुन', 'शराब', 'धूम्रपान', 'थकान',
          'खाना', 'दिन का समय', 'रिश्ते का झगड़ा', 'नींद के बाद',
        ],
      },
    },
    {
      multiSelect: false,
      en: {
        text: 'How do you feel emotionally around this problem?',
        options: ['Ashamed', 'Fearful', 'Frustrated', 'Guilty', 'Angry', 'Indifferent', 'Obsessive'],
      },
      hi: {
        text: 'इस समस्या को लेकर भावनात्मक रूप से कैसा महसूस करते हैं?',
        options: ['शर्मिंदा', 'भयभीत', 'हताश', 'अपराधबोध', 'गुस्सा', 'उदासीन', 'जुनूनी'],
      },
    },
  ],
};

/**
 * Return a category's questions localized to the given language.
 * @param {string} category - 'addiction' | 'mental' | 'sex'
 * @param {string} [lang='en'] - 'en' | 'hi'
 * @returns {Array<{ text: string, options: string[], multiSelect: boolean }>}
 */
function getQuestions(category, lang = 'en') {
  const set = questions[category];
  if (!set) return null;
  const l = lang === 'hi' ? 'hi' : 'en';
  return set.map((q) => ({
    text: q[l].text,
    options: q[l].options,
    multiSelect: q.multiSelect,
  }));
}

module.exports = { getQuestions };
