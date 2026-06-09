/**
 * Fixed question sets for each recovery category.
 *
 * Category addiction – De-addiction / Substance Recovery (9 questions)
 * Category mental   – Mental / Emotional Wellness (10 questions)
 * Category sex      – Sexual Health & Wellness (8 questions)
 */

const questions = {
  addiction: [
    'आप मुख्य रूप से किस चीज़ से परेशान हैं?\n1️⃣ शराब (Alcohol)\n2️⃣ तंबाकू / गुटखा / सिगरेट\n3️⃣ गांजा / भांग (Cannabis)\n4️⃣ अफीम / नशे की दवाएं (Opioids)\n5️⃣ नींद की गोलियां / cough syrup / sedatives\n6️⃣ Party drugs / stimulants\n7️⃣ Inhalants (सुलोशन, पेट्रोल सूंघना)\n8️⃣ एक से अधिक चीज़ें\n9️⃣ मुझे पक्का नहीं पता',
    'आप इस बारे में क्या चाहते हैं?\n👉 पूरी तरह छोड़ना (Quit completely)\n👉 कम करना (Reduce / cut down)\n👉 पहले stabilize करना, फिर देखूंगा\n👉 समझना चाहता हूँ — अभी decide नहीं किया\n👉 मैं खुद के लिए नहीं, किसी और की मदद के लिए यहाँ हूँ',
    'एक ज़रूरी सवाल — क्या आपने हाल ही में इनमें से कुछ महसूस किया है? (आप जितने भी select कर सकते हैं)\n🔴 अचानक बहुत ज़्यादा कंपकंपी / seizure\n🔴 बेहोशी जैसा महसूस होना / confusion\n🔴 बहुत ज़्यादा नशा एक साथ ले लिया (overdose)\n🔴 खुद को नुकसान पहुंचाने के विचार\n🔴 बहुत aggressive / violent behavior\n🔴 ऊपर में से कुछ नहीं',
    'कितने समय से यह habit है?\n👉 6 महीने से कम\n👉 6 महीने – 2 साल\n👉 2 – 5 साल\n👉 5 साल से ज़्यादा',
    'रोज़ औसतन कितना लेते हैं? (उदाहरण: शराब)\n👉 1-2 पेग / बोतल\n👉 3-5 पेग / बोतल\n👉 आधी बोतल से ज़्यादा\n👉 हर दिन नहीं लेता, लेकिन एक बार शुरू हो जाए तो रोकना मुश्किल है',
    'क्या पहले कभी छोड़ने की कोशिश की है?\n👉 नहीं, यह पहली बार है\n👉 हाँ, कोशिश की लेकिन 1-2 हफ्ते बाद वापस शुरू हो गया\n👉 हाँ, कई बार try किया\n👉 कभी-कभी थोड़ा कम किया लेकिन छोड़ा नहीं',
    'नींद के बारे में बताएं:\n👉 नींद ठीक है\n👉 नींद कम आती है या बीच में टूट जाती है\n👉 बिना नशे के बिल्कुल नींद नहीं आती\n👉 ज़रूरत से ज़्यादा सो रहा/रही हूँ',
    'आमतौर पर यह craving कब आती है?\n👉 Stress / काम का दबाव\n👉 अकेलापन / बोरियत\n👉 दोस्तों के साथ / social situation\n👉 घर में झगड़ा / family tension\n👉 रोज़ का routine — बिना कारण\n👉 कई reasons हैं',
    'आपके घर में या करीबी लोगों में से कोई इस बारे में जानता है?\n👉 हाँ, और वे support करते हैं\n👉 हाँ, लेकिन वे judgment करते हैं\n👉 नहीं, किसी को नहीं पता\n👉 मैं family के लिए यहाँ हूँ — खुद के लिए नहीं',
  ],

  mental: [
    'What is the dominant mental state right now?\nChoose the closest: fearful, anxious, sad, irritable, angry, suspicious, jealous, guilty, restless, detached, obsessive, numb, hopeless.',
    'What makes it worse?\nChoose all that apply: criticism, insult, family conflict, loneliness, crowds, exam/work pressure, night-time, morning, being alone, being busy, noise, hunger, heat, cold, menses, bad news, grief, suppression.',
    'What makes it better?\nChoose the strongest relief: company, consolation, being left alone, talking, crying, sleep, walking, motion, prayer, music, food, warmth, open air, cold air, pressure, massage.',
    'How does the person behave under stress?\nSilent and closed, overtalkative, clingy, demanding, aggressive, weeping, avoidant, perfectionistic, indecisive, controlling, cowardly, suspicious, argumentative, impulsive.',
    'What is the strongest inner fear or thought loop?\nFear of death, fear of failure, fear of illness, fear of being abandoned, fear of dark, fear of poverty, fear of criticism, fear of responsibility, fear of losing control, guilt, self-blame, revenge thoughts, jealous thoughts.',
    'How is sleep affected?\nNo sleep, broken sleep, waking at fixed hours, fear at night, nightmares, excessive sleep, cannot fall asleep because thoughts race, wakes unrefreshed, sleeps better after crying, sleep worse after worry.',
    'What are the food desires or aversions?\nCraves sweets, salt, spicy food, tea, coffee, milk, fried food, cold drinks, eggs; or aversion to food, nausea from smell, loss of appetite, empty stomach aggravation, overeating when stressed.',
    'What is the exact trigger or origin story?\nAfter grief, breakup, marriage stress, childbirth, school failure, business loss, insult, betrayal, fright, prolonged overwork, suppression of anger, humiliation, chronic family pressure, substance use.',
    'What is the person like as a human being when well?\nMild, soft, proud, dominating, meticulous, religious, sensitive, anxious, fastidious, rigid, affectionate, indifferent, ambitious, cowardly, sympathetic, introverted, extroverted.',
    'Any danger signs present right now?\nSuicidal thoughts, self-harm, hallucinations, extreme agitation, violence, not sleeping for days, confusion, mania, refusal to eat/drink, intoxication, severe panic, disconnection from reality.',
  ],

  sex: [
    'What is the main issue for you: low desire, difficulty getting aroused, difficulty during intercourse, early release, no release, pain, discharge, or something else?',
    'Do you have any: involuntary discharge, nightfall, premature ejaculation, pain on ejaculation, vaginal dryness, itching, burning, or unusual smell/discharge?',
    'Since when have you been noticing this problem, and was the start sudden or gradual?',
    'Do you feel the problem: before sex, during sex, or after sex?',
    'After sexual activity, do you feel: weakness, exhaustion, guilt, anxiety, headache, backache, burning, palpitations, or loss of confidence?',
    'How is your sexual desire overall: increased, reduced, absent, variable, or present only in certain situations?',
    'What makes it worse or better: stress, guilt, porn, masturbation, alcohol, smoking, tiredness, food, time of day, relationship conflict, or after sleep?',
    'How do you feel emotionally around this problem: ashamed, fearful, frustrated, guilty, angry, indifferent, or obsessive about it?',
  ],
};

module.exports = questions;
