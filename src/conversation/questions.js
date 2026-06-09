/**
 * Fixed question sets for each recovery category.
 *
 * Category addiction – De-addiction / Substance Recovery (9 questions)
 * Category mental   – Mental / Emotional Wellness (7 questions)
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
    'How would you describe your overall mood over the past two weeks? (e.g., anxious, low, irritable, numb)',
    'How is your sleep? Do you have trouble falling asleep, staying asleep, or do you sleep too much?',
    'On a scale of 1–10, how stressed do you feel on a typical day?',
    'Have you lost interest in activities you used to enjoy? If so, for how long?',
    'Do you experience panic attacks, intrusive thoughts, or persistent worry? Please describe briefly.',
    'How is your appetite — has it increased, decreased, or stayed the same recently?',
    'Do you have a support system (friends, family, therapist) you can talk to about how you feel?',
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
