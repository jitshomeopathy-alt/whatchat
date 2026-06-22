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
 * single-select options with short titles (<= 24 chars), and falls back to
 * numbered text otherwise. Most of the questions below are long-form, so they
 * render as numbered text.
 *
 * SOURCE: These question sets mirror the client's "Astro Vaidhya — Adaptive
 * Question System" documents. The client design is ADAPTIVE (the answer to the
 * first question routes the user into a branch, some questions are conditional,
 * and a shared closing block + a common final constitutional question close
 * every path). For now the questions are stored FLAT — every question for a
 * category is listed in order. The branch each question belongs to is noted in
 * a comment (e.g. "QMH-A* — Anxiety branch") so the routing/conditional logic
 * can be wired up in a later pass without re-authoring the content.
 *
 * addiction – De-addiction / Substance & Behavioural Recovery
 * mental    – Mental / Emotional Wellness
 * sex       – Sexual Health & Wellness
 */

// ── Shared blocks reused at the end of every category ─────────────────────────

// Universal closing block (Function / Duration / Safety) — appended to each set.
const CLOSING_BLOCK = [
  {
    multiSelect: false,
    en: {
      text: 'How much is this affecting your sleep, work, relationships, or self-care?',
      options: ['None', 'Mild', 'Moderate', 'Severe', 'Unable to function'],
    },
    hi: {
      text: 'यह आपकी नींद, काम, रिश्तों या खुद की देखभाल को कितना प्रभावित कर रहा है?',
      options: ['बिलकुल नहीं', 'हल्का', 'मध्यम', 'गंभीर', 'काम नहीं कर पा रहा'],
    },
  },
  {
    multiSelect: false,
    en: {
      text: 'How long has this pattern been present?',
      options: ['Days', 'Weeks', 'Months', 'Years', 'On and off'],
    },
    hi: {
      text: 'यह स्थिति कब से बनी हुई है?',
      options: ['कुछ दिन', 'कुछ हफ़्ते', 'कुछ महीने', 'कई साल', 'कभी-कभी / रुक-रुक कर'],
    },
  },
  {
    multiSelect: false,
    en: {
      text: 'At any point, have you felt unsafe, wanted to harm yourself, or felt out of touch with reality?',
      options: ['No', 'In the past only', 'Yes, right now', 'Prefer not to say'],
    },
    hi: {
      text: 'क्या कभी आपने खुद को असुरक्षित महसूस किया, खुद को नुकसान पहुँचाना चाहा, या वास्तविकता से कटा महसूस किया?',
      options: ['नहीं', 'सिर्फ़ पहले', 'हाँ, अभी', 'बताना नहीं चाहता'],
    },
  },
];

// QMH-10 — the deep constitutional body question, asked last to EVERY user.
const CONSTITUTIONAL_FINAL = {
  multiSelect: false,
  en: {
    text: 'If you forget this concern for a moment and think only of your natural body type, which pattern has been true about you for years?',
    options: [
      'I am very chilly, want warmth, dislike cold wind, and feel better wrapped up.',
      'I am hot-blooded, dislike heat, want cool air, and feel worse in warmth.',
      'I am very thirsty, often for large quantities at once.',
      'I am not very thirsty, even when unwell.',
      'I strongly crave sweets, chocolate, rich food, salt, or spicy food.',
      'I have a very specific sweat pattern — head, chest, scalp, feet, night sweat, sour sweat, or sweat on slight exertion.',
      'My bowel pattern is a keynote — constipation, loose stool, incomplete stool, urgency, or alternating.',
      'My sleep has a keynote — waking at a fixed hour, unrefreshing, restless, early waking, or vivid dreams.',
      'Something else very specific about my body that has been true for years.',
    ],
  },
  hi: {
    text: 'अगर आप इस समस्या को एक पल भूलकर सिर्फ़ अपने स्वाभाविक शरीर के प्रकार के बारे में सोचें, तो कौन सा पैटर्न सालों से आप पर सच रहा है?',
    options: [
      'मुझे बहुत ठंड लगती है, गर्माहट चाहिए, ठंडी हवा पसंद नहीं, और ढककर बेहतर लगता है।',
      'मैं गर्म तासीर का हूँ, गर्मी पसंद नहीं, ठंडी हवा चाहिए, और गर्मी में बदतर लगता है।',
      'मुझे बहुत प्यास लगती है, अक्सर एक बार में ज़्यादा मात्रा में।',
      'मुझे ज़्यादा प्यास नहीं लगती, बीमार होने पर भी।',
      'मुझे मीठा, चॉकलेट, गरिष्ठ खाना, नमक या तीखा बहुत भाता है।',
      'मेरा पसीना एक खास पैटर्न में आता है — सिर, छाती, खोपड़ी, पैर, रात का पसीना, खट्टा पसीना, या ज़रा-सी मेहनत पर पसीना।',
      'मेरा मल पैटर्न एक मुख्य लक्षण है — कब्ज़, पतला मल, अधूरा मल, तीव्रता, या बदलता मल।',
      'मेरी नींद का एक मुख्य लक्षण है — तय समय पर जागना, ताज़गी न देने वाली, बेचैन, जल्दी जागना, या बहुत सपने।',
      'मेरे शरीर के बारे में कुछ और बहुत खास जो सालों से सच है।',
    ],
  },
};

const questions = {
  // ════════════════════════════════════════════════════════════════════════════
  // MENTAL / EMOTIONAL WELLNESS
  // ════════════════════════════════════════════════════════════════════════════
  mental: [
    // QMH-1 — Always first (routes the branch in the adaptive design)
    {
      multiSelect: false,
      en: {
        text: 'When you think about how you are feeling inside right now — not the events, not the reasons, just the feeling itself — which of these comes closest to what is actually there?',
        options: [
          'A weight. A heaviness pressing from inside, like something is sitting on my chest.',
          'A restlessness. A buzzing, a tightness, a "what if" that will not leave.',
          'A blankness. I am here but not here, watching my life from slightly behind it.',
          'A sharpness. An irritation or anger just below the surface most of the time.',
          'A loneliness. Even in a room full of people, like no one actually sees me.',
          'A tiredness that has nothing to do with sleep. Like I am running on almost empty.',
          'A confusion. I do not know who I am, what I want, or why nothing feels enough.',
          'Something specific I want to describe in my own words.',
        ],
      },
      hi: {
        text: 'अभी अंदर से आप कैसा महसूस कर रहे हैं — घटनाएँ नहीं, कारण नहीं, बस वह भावना — इनमें से कौन सी सबसे करीब है?',
        options: [
          'एक बोझ। अंदर से दबाव, जैसे छाती पर कुछ रखा हो।',
          'एक बेचैनी। एक गूँज, एक जकड़न, एक "क्या होगा अगर" जो जाता ही नहीं।',
          'एक खालीपन। मैं यहाँ हूँ पर यहाँ नहीं, अपनी ज़िंदगी को थोड़ा पीछे से देखते हुए।',
          'एक तीखापन। ज़्यादातर समय सतह के नीचे चिड़चिड़ाहट या गुस्सा।',
          'एक अकेलापन। भरे कमरे में भी, जैसे कोई सच में मुझे नहीं देखता।',
          'एक थकान जिसका नींद से कोई लेना-देना नहीं। जैसे मैं लगभग खाली पर चल रहा हूँ।',
          'एक उलझन। मैं नहीं जानता मैं कौन हूँ, क्या चाहता हूँ, या क्यों कुछ भी काफ़ी नहीं लगता।',
          'कुछ खास जो मैं अपने शब्दों में बताना चाहता हूँ।',
        ],
      },
    },
    // QMH-2 — Sadness / Depression path (company effect)
    {
      multiSelect: false,
      en: {
        text: 'When you are feeling this way — when the weight or blankness or sadness is strongest — what does being around people do to it?',
        options: [
          'It helps. I need someone close; the presence of another person eases it.',
          'It makes no difference either way. I am the same alone or with others.',
          'It makes it worse. Being around people when I am like this is an effort I do not have.',
          'It depends — I want company, but then when they come I want them to leave.',
          'I have stopped knowing what I want.',
        ],
      },
      hi: {
        text: 'जब आप ऐसा महसूस करते हैं — जब बोझ, खालीपन या उदासी सबसे ज़्यादा हो — तब लोगों के बीच होना इस पर क्या असर करता है?',
        options: [
          'राहत मिलती है। मुझे कोई करीब चाहिए; किसी की मौजूदगी इसे कम करती है।',
          'कोई फर्क नहीं पड़ता। अकेले या लोगों के साथ, मैं वैसा ही रहता हूँ।',
          'और बिगड़ जाता है। ऐसी हालत में लोगों के बीच रहना एक मेहनत है जो मुझमें नहीं।',
          'निर्भर करता है — मुझे साथ चाहिए, पर जब वे आते हैं तो मैं चाहता हूँ वे चले जाएँ।',
          'मैंने जानना ही छोड़ दिया है कि मैं क्या चाहता हूँ।',
        ],
      },
    },
    // QMH-3 — Emotional expression
    {
      multiSelect: false,
      en: {
        text: 'When you cry — and I know not everyone cries, so only if this applies to you — what happens after?',
        options: [
          'I feel lighter, like something was released. The cry actually helps.',
          'I feel empty but not better — like going through a motion without the relief.',
          'I feel worse — raw and exposed, like I gave away something I cannot get back.',
          'I do not cry in front of anyone. When I do cry, it is completely alone.',
          'I have not been able to cry at all, even when I want to.',
        ],
      },
      hi: {
        text: 'जब आप रोते हैं — और मैं जानता हूँ हर कोई नहीं रोता, तो सिर्फ़ अगर यह आप पर लागू हो — उसके बाद क्या होता है?',
        options: [
          'मैं हल्का महसूस करता हूँ, जैसे कुछ निकल गया। रोना सच में मदद करता है।',
          'मैं खाली महसूस करता हूँ पर बेहतर नहीं — जैसे बिना राहत के बस एक रस्म।',
          'मैं और बुरा महसूस करता हूँ — कच्चा और उघड़ा हुआ, जैसे कुछ दे दिया जो वापस नहीं मिलेगा।',
          'मैं किसी के सामने नहीं रोता। जब रोता हूँ, तो पूरी तरह अकेले।',
          'मैं रो ही नहीं पाया, चाहकर भी।',
        ],
      },
    },
    // QMH-4 — Aetiology / causal
    {
      multiSelect: false,
      en: {
        text: 'I want to ask something that might seem like a step back, but it is the most important question. Did this inner weight come from somewhere? Was there something that happened, or something that ended, at the beginning of it?',
        options: [
          'Yes. There was something — a loss, a heartbreak, a betrayal, a death, a leaving.',
          'Yes, I think so, but it was gradual — a long period of stress rather than one event.',
          'I cannot point to one thing. It has been this way as long as I can remember.',
          'No specific event, but my life has changed significantly in the last year or two.',
          'I would rather write it in my own words.',
        ],
      },
      hi: {
        text: 'मैं कुछ पूछना चाहता हूँ जो शायद पीछे का कदम लगे, पर यह सबसे ज़रूरी सवाल है। क्या यह अंदरूनी बोझ कहीं से आया? क्या कुछ हुआ था, या कुछ खत्म हुआ था, इसकी शुरुआत में?',
        options: [
          'हाँ। कुछ था — एक नुकसान, दिल टूटना, विश्वासघात, मृत्यु, किसी का छोड़ जाना।',
          'हाँ, शायद, पर धीरे-धीरे — एक लंबा तनाव का दौर, कोई एक घटना नहीं।',
          'मैं किसी एक चीज़ की ओर इशारा नहीं कर सकता। जब से याद है तब से ऐसा ही है।',
          'कोई खास घटना नहीं, पर पिछले एक-दो साल में मेरी ज़िंदगी काफ़ी बदल गई है।',
          'मैं इसे अपने शब्दों में लिखना चाहूँगा।',
        ],
      },
    },
    // QMH-5 — Physical general (the body question)
    {
      multiSelect: false,
      en: {
        text: 'Here is something that might seem unrelated — but in what I do, nothing is unrelated. Has your body changed alongside how you have been feeling? Something that crept in quietly, that you accepted as just getting older or being tired?',
        options: [
          'Headaches — particularly one-sided, particularly in the late morning or afternoon.',
          'Hair falling more than usual.',
          'My sleep has changed — too little, too much, or I wake at a specific time most nights.',
          'My digestion has shifted — bloating, constipation, or feeling heavy after eating.',
          'A tiredness that does not respond to rest. Sleep does not recover me.',
          'Nothing I can specifically name, or I have several things — let me describe.',
        ],
      },
      hi: {
        text: 'एक बात जो शायद असंबंधित लगे — पर मेरे काम में कुछ भी असंबंधित नहीं। क्या आपकी भावनाओं के साथ आपका शरीर भी बदला है? कुछ जो चुपके से आया, जिसे आपने उम्र या थकान मानकर स्वीकार कर लिया?',
        options: [
          'सिरदर्द — खासकर एक तरफ़ का, खासकर दोपहर से पहले या दोपहर में।',
          'बालों का सामान्य से ज़्यादा झड़ना।',
          'मेरी नींद बदल गई — बहुत कम, बहुत ज़्यादा, या ज़्यादातर रात एक तय समय पर जाग जाता हूँ।',
          'मेरा पाचन बदल गया — गैस, कब्ज़, या खाने के बाद भारीपन।',
          'एक थकान जो आराम से नहीं जाती। नींद मुझे ठीक नहीं करती।',
          'कुछ खास नहीं बता सकता, या मुझमें कई चीज़ें हैं — मुझे बताने दें।',
        ],
      },
    },
    // QMH-6 — Sensation (Sankaran layer)
    {
      multiSelect: false,
      en: {
        text: 'I want to ask one more thing, and it is a different kind of question — not about what happened or what you feel, but what it feels like from the inside. If you had to describe what you carry as a physical sensation in your body, which comes closest?',
        options: [
          'A weight on the chest. Like something is pressing, like something is being held down.',
          'A tightness, a closing. Like walls coming in or doors shutting. Like I am locked in with it.',
          'A hollowness. An emptiness in the centre, like something was there and is now gone.',
          'A burning. An aliveness that has nowhere to go, like electricity with no outlet.',
          'A dissolving. A blurring at the edges, like I am losing my own outline.',
          'Something I cannot put into words, but I will try to describe it.',
        ],
      },
      hi: {
        text: 'मैं एक और बात पूछना चाहता हूँ, और यह अलग तरह का सवाल है — क्या हुआ या आप क्या महसूस करते हैं नहीं, बल्कि अंदर से वह कैसा लगता है। अगर आपको जो आप ढोते हैं उसे शरीर की एक शारीरिक अनुभूति के रूप में बताना हो, तो कौन सी सबसे करीब है?',
        options: [
          'छाती पर एक बोझ। जैसे कुछ दबा रहा हो, जैसे कुछ नीचे दबाया जा रहा हो।',
          'एक जकड़न, एक बंद होना। जैसे दीवारें पास आ रही हों या दरवाज़े बंद हो रहे हों। जैसे मैं उसके साथ कैद हूँ।',
          'एक खोखलापन। बीच में एक खालीपन, जैसे कुछ था और अब चला गया।',
          'एक जलन। एक ऊर्जा जिसका कोई रास्ता नहीं, जैसे बिजली जिसका कोई आउटलेट नहीं।',
          'एक घुलना। किनारों का धुंधला होना, जैसे मैं अपनी ही रूपरेखा खो रहा हूँ।',
          'कुछ जिसे शब्दों में नहीं रख सकता, पर बताने की कोशिश करूँगा।',
        ],
      },
    },
    // QMH-7 — Strongest inner feeling when low
    {
      multiSelect: false,
      en: {
        text: 'When you are low, what is the strongest feeling inside — the one you feel the most?',
        options: [
          'Self-blame or guilt.',
          'Blaming others.',
          'Fear of the future.',
          'Hopelessness — nothing will improve.',
          'Numbness — no feelings.',
          'Shame.',
          'A feeling that I cannot cope.',
        ],
      },
      hi: {
        text: 'जब आप उदास होते हैं, अंदर सबसे प्रबल भावना क्या होती है — जिसे आप सबसे ज़्यादा महसूस करते हैं?',
        options: [
          'खुद को दोष देना या अपराधबोध।',
          'दूसरों को दोष देना।',
          'भविष्य का डर।',
          'निराशा — कुछ भी बेहतर नहीं होगा।',
          'सुन्नपन — कोई भावना नहीं।',
          'शर्म।',
          'यह एहसास कि मैं संभाल नहीं सकता।',
        ],
      },
    },
    // QMH-8 — What helps find space (shared across branches)
    {
      multiSelect: false,
      en: {
        text: 'When this state is at its worst — the sadness, the anxiety, the heaviness, whatever it is for you — what most often helps you find a little space from it?',
        options: [
          'Sleep. Sometimes the only relief comes from switching off completely.',
          'Movement. Walking, driving, exercising, or simply not sitting still.',
          'Talking. Putting it into words with someone I trust.',
          'Crying. Letting it out changes something, even if only for a while.',
          'Music, art, prayer, or something that takes me into another emotional space.',
          'Keeping busy. Work or tasks — anything that stops my mind turning inward.',
          'Open air, nature, or being somewhere spacious and less confined.',
          'Very little helps. Relief is brief, or does not come at all.',
          'Something else helps me more, and I would like to describe it.',
        ],
      },
      hi: {
        text: 'जब यह हालत सबसे बुरी हो — उदासी, चिंता, भारीपन, जो भी आपके लिए हो — तब अक्सर क्या आपको उससे थोड़ी राहत दिलाता है?',
        options: [
          'नींद। कभी-कभी राहत सिर्फ़ पूरी तरह बंद हो जाने से मिलती है।',
          'हलचल। टहलना, गाड़ी चलाना, व्यायाम, या बस स्थिर न बैठना।',
          'बात करना। किसी भरोसेमंद के साथ इसे शब्दों में रखना।',
          'रोना। बाहर निकालना कुछ बदल देता है, भले थोड़ी देर के लिए।',
          'संगीत, कला, प्रार्थना, या कुछ जो मुझे दूसरी भावनात्मक जगह ले जाए।',
          'व्यस्त रहना। काम या कार्य — कुछ भी जो मेरे मन को अंदर की ओर मुड़ने से रोके।',
          'खुली हवा, प्रकृति, या कोई खुली और कम बंद जगह।',
          'बहुत कम मदद मिलती है। राहत थोड़ी देर की होती है, या आती ही नहीं।',
          'कुछ और मुझे ज़्यादा मदद करता है, और मैं उसे बताना चाहूँगा।',
        ],
      },
    },
    // QMH-9 — Time-of-day / rhythm (conditional on remedy confidence in design)
    {
      multiSelect: false,
      en: {
        text: 'Most emotional states have a rhythm — a time of day when they loosen their grip and a time when they return. When are you most likely to notice this feeling become strongest?',
        options: [
          'The morning, especially when I first wake, before the day has begun.',
          'Late morning or afternoon. As the day progresses, something inside becomes heavier.',
          'Evening, when work ends and there is finally space to feel what I have carried.',
          'After midnight or the early hours — often waking me, or meeting me when I cannot switch off.',
          'Just before sleep. The moment everything becomes quiet is often the hardest.',
          'After eating. My mood, energy, or clarity noticeably changes after meals.',
          'There is no fixed hour. It comes in waves without a pattern I can recognise.',
          'There is a specific time or situation connected to it. I would like to describe it.',
        ],
      },
      hi: {
        text: 'ज़्यादातर भावनात्मक अवस्थाओं की एक लय होती है — दिन का एक समय जब वे ढीली पड़ती हैं और एक समय जब लौटती हैं। आप कब सबसे ज़्यादा यह भावना सबसे प्रबल महसूस करते हैं?',
        options: [
          'सुबह, खासकर जब पहली बार जागता हूँ, दिन शुरू होने से पहले।',
          'दोपहर से पहले या दोपहर में। जैसे-जैसे दिन बढ़ता है, अंदर कुछ भारी होता जाता है।',
          'शाम, जब काम खत्म होता है और आखिरकार जो ढोया उसे महसूस करने की जगह मिलती है।',
          'आधी रात के बाद या तड़के — अक्सर मुझे जगाते हुए, या तब मिलते हुए जब मैं मन बंद नहीं कर पाता।',
          'सोने से ठीक पहले। जब सब कुछ शांत हो जाता है वह पल अक्सर सबसे कठिन होता है।',
          'खाने के बाद। खाने के बाद मेरा मूड, ऊर्जा या स्पष्टता साफ़ बदल जाती है।',
          'कोई तय समय नहीं। यह लहरों में आता है, बिना किसी पहचाने पैटर्न के।',
          'इससे जुड़ा एक खास समय या स्थिति है। मैं उसे बताना चाहूँगा।',
        ],
      },
    },
    // QMH-A1 — Anxiety / Restlessness branch (QMH-1 = B)
    {
      multiSelect: false,
      en: {
        text: 'This restlessness, this buzzing — where does it live? What is it most about?',
        options: [
          'The future — what might go wrong, scenarios I run that have not happened yet.',
          'What people think of me — how I appear, whether I am doing or being enough.',
          'Everything at once. No one thing — a general state of being switched on too high.',
          'A specific thing I am facing — an exam, a deadline, a decision I cannot make.',
          'My health, my body. Something might be wrong and I cannot stop checking.',
          'Let me describe what the anxiety is about.',
        ],
      },
      hi: {
        text: 'यह बेचैनी, यह गूँज — कहाँ बसती है? यह सबसे ज़्यादा किस बारे में है?',
        options: [
          'भविष्य — क्या गलत हो सकता है, ऐसे दृश्य जो अभी हुए नहीं उन्हें मैं मन में चलाता हूँ।',
          'लोग मेरे बारे में क्या सोचते हैं — मैं कैसा दिखता हूँ, क्या मैं काफ़ी कर/हो रहा हूँ।',
          'सब कुछ एक साथ। कोई एक चीज़ नहीं — बस बहुत ऊँचे पर चालू रहने की एक हालत।',
          'कोई खास चीज़ जिसका सामना कर रहा हूँ — परीक्षा, समय-सीमा, एक फैसला जो नहीं ले पाता।',
          'मेरी सेहत, मेरा शरीर। कुछ गलत हो सकता है और मैं जाँचता ही रहता हूँ।',
          'मुझे बताने दें कि चिंता किस बारे में है।',
        ],
      },
    },
    // QMH-A2 — Anxiety branch (body at peak)
    {
      multiSelect: false,
      en: {
        text: 'When the anxiety peaks — at the worst moment — what does your body do?',
        options: [
          'My heart races. I feel it in my chest. Sometimes I cannot breathe properly.',
          'My stomach goes — loose stools, nausea, or a hollow sick feeling.',
          'I freeze. My mind goes blank. I know what to do but my body will not move.',
          'I shake or tremble — hands, voice, internally even if not visibly.',
          'I pace. I cannot sit still. I have to move or the feeling gets worse.',
          'My body does not react much. The anxiety is almost entirely in my head.',
        ],
      },
      hi: {
        text: 'जब चिंता चरम पर हो — सबसे बुरे पल में — आपका शरीर क्या करता है?',
        options: [
          'मेरा दिल तेज़ धड़कता है। मैं इसे छाती में महसूस करता हूँ। कभी ठीक से साँस नहीं ले पाता।',
          'मेरा पेट बिगड़ता है — पतले दस्त, मिचली, या एक खोखला बीमार-सा एहसास।',
          'मैं जम जाता हूँ। दिमाग खाली हो जाता है। पता है क्या करना है पर शरीर हिलता नहीं।',
          'मैं काँपता हूँ — हाथ, आवाज़, अंदर से भले बाहर न दिखे।',
          'मैं चहलकदमी करता हूँ। स्थिर नहीं बैठ पाता। हिलना पड़ता है वरना एहसास बढ़ता है।',
          'मेरा शरीर ज़्यादा प्रतिक्रिया नहीं करता। चिंता लगभग पूरी तरह दिमाग में है।',
        ],
      },
    },
    // QMH-A3 — Anxiety branch (deepest fear)
    {
      multiSelect: false,
      en: {
        text: 'This one is important. Underneath all the anxiety — the deepest fear, not the surface worry but the root — what would it be?',
        options: [
          'That something terrible will happen and I will not be able to handle it.',
          'That I will fail, and people will see it, and they will think less of me.',
          'That I am not safe — that the world is unpredictable and I cannot control what comes.',
          'That I am alone in it — that when it gets bad, there will be no one.',
          'That something is wrong with me, physically or mentally, that I cannot name.',
          'That I will never feel calm. That this is just how I am.',
        ],
      },
      hi: {
        text: 'यह सवाल अहम है। सारी चिंता के नीचे — सबसे गहरा डर, सतह की चिंता नहीं बल्कि जड़ — वह क्या होगा?',
        options: [
          'कि कुछ भयानक होगा और मैं उसे संभाल नहीं पाऊँगा।',
          'कि मैं असफल हो जाऊँगा, लोग देखेंगे, और मुझे कमतर समझेंगे।',
          'कि मैं सुरक्षित नहीं हूँ — दुनिया अनिश्चित है और जो आए उसे मैं नियंत्रित नहीं कर सकता।',
          'कि मैं इसमें अकेला हूँ — जब हालत बिगड़े तो कोई नहीं होगा।',
          'कि मुझमें कुछ गड़बड़ है, शारीरिक या मानसिक, जिसे मैं नाम नहीं दे सकता।',
          'कि मैं कभी शांत महसूस नहीं करूँगा। कि मैं बस ऐसा ही हूँ।',
        ],
      },
    },
    // QMH-A4 — Anxiety branch (company)
    {
      multiSelect: false,
      en: {
        text: 'When the anxiety is at its worst, what happens if someone sits with you?',
        options: [
          'It helps. I feel calmer if someone is near me.',
          'I want someone near me, but I still cannot settle.',
          'It makes no difference. I am the same alone or with others.',
          'It irritates me. I would rather be left alone.',
          'I fluctuate — I want company, then I want space.',
          'I do not know, or it depends on who the person is.',
        ],
      },
      hi: {
        text: 'जब चिंता सबसे बुरी हो, अगर कोई आपके साथ बैठे तो क्या होता है?',
        options: [
          'राहत मिलती है। कोई पास हो तो मैं ज़्यादा शांत महसूस करता हूँ।',
          'मुझे कोई पास चाहिए, पर फिर भी मैं टिक नहीं पाता।',
          'कोई फर्क नहीं पड़ता। अकेले या साथ, मैं वैसा ही रहता हूँ।',
          'मुझे चिढ़ होती है। मैं अकेला रहना पसंद करूँगा।',
          'मैं बदलता रहता हूँ — साथ चाहता हूँ, फिर जगह चाहता हूँ।',
          'पता नहीं, या यह इस पर निर्भर है कि व्यक्ति कौन है।',
        ],
      },
    },
    // QMH-A5 — Anxiety branch (relief)
    {
      multiSelect: false,
      en: {
        text: 'When the anxiety peaks, what actually eases it the most?',
        options: [
          'Walking or movement.',
          'Talking it out.',
          'Eating.',
          'Warm drinks or warmth.',
          'Open air.',
          'Rest or lying down.',
          'Being with someone.',
          'Nothing reliably helps.',
        ],
      },
      hi: {
        text: 'जब चिंता चरम पर हो, असल में क्या इसे सबसे ज़्यादा कम करता है?',
        options: [
          'टहलना या हलचल।',
          'बात करके निकालना।',
          'खाना।',
          'गर्म पेय या गर्माहट।',
          'खुली हवा।',
          'आराम या लेट जाना।',
          'किसी के साथ होना।',
          'कुछ भी भरोसे से मदद नहीं करता।',
        ],
      },
    },
    // QMH-D1 — Anger / Irritation branch (QMH-1 = D)
    {
      multiSelect: false,
      en: {
        text: 'That feeling just below the surface — the irritation, the sharpness — when is it strongest? What brings it closest to the top?',
        options: [
          'When things are not done right — when people are slow, inefficient, or careless.',
          'When I feel disrespected — my effort dismissed or my boundaries crossed.',
          'In the morning, before I have had time to settle into the day.',
          'When I have too much to carry and too little help.',
          'It has no specific trigger. It just lives there.',
        ],
      },
      hi: {
        text: 'सतह के ठीक नीचे की वह भावना — चिड़चिड़ाहट, तीखापन — कब सबसे प्रबल होती है? क्या इसे सबसे ऊपर लाता है?',
        options: [
          'जब चीज़ें ठीक से न हों — जब लोग धीमे, अकुशल या लापरवाह हों।',
          'जब मुझे अनादर महसूस हो — मेरी मेहनत नकारी जाए या मेरी सीमाएँ लाँघी जाएँ।',
          'सुबह, इससे पहले कि मुझे दिन में जमने का समय मिले।',
          'जब मेरे पास ढोने को बहुत हो और मदद बहुत कम।',
          'इसका कोई खास कारण नहीं। यह बस वहाँ रहती है।',
        ],
      },
    },
    // QMH-D2 — Anger branch (what you do with it)
    {
      multiSelect: false,
      en: {
        text: 'When this feeling reaches its peak — what do you do with it?',
        options: [
          'I express it. I say what I feel, sometimes loudly. Then it is over.',
          'I hold it. I do not show it. I replay it inside, sometimes for days.',
          'I leave. I physically remove myself and process it alone.',
          'It leaks out in small ways — sharp words, a door closed too hard, a withdrawal.',
          'I direct it inward. I become my own target.',
        ],
      },
      hi: {
        text: 'जब यह भावना चरम पर पहुँचे — आप इसका क्या करते हैं?',
        options: [
          'मैं इसे व्यक्त करता हूँ। जो महसूस करता हूँ कह देता हूँ, कभी ज़ोर से। फिर खत्म।',
          'मैं इसे रोकता हूँ। दिखाता नहीं। अंदर बार-बार दोहराता हूँ, कभी दिनों तक।',
          'मैं चला जाता हूँ। खुद को हटा लेता हूँ और अकेले इससे निपटता हूँ।',
          'यह छोटे तरीकों से रिसती है — तीखे शब्द, ज़ोर से बंद दरवाज़ा, खुद को समेट लेना।',
          'मैं इसे अंदर की ओर मोड़ता हूँ। मैं खुद अपना निशाना बन जाता हूँ।',
        ],
      },
    },
    // QMH-D3 — Anger branch (deepest core)
    {
      multiSelect: false,
      en: {
        text: 'Where does this anger come from at its deepest — not the situations, but underneath them? Is the core feeling closer to:',
        options: [
          'I am responsible for everything and no one helps. I carry more than my share.',
          'I have been wronged, repeatedly, and I have said nothing or too little.',
          'I cannot control what happens around me, and that terrifies me.',
          'I am not seen for what I actually give and do. The effort is invisible.',
          'Something else — let me describe it.',
        ],
      },
      hi: {
        text: 'यह गुस्सा अपनी सबसे गहराई में कहाँ से आता है — स्थितियाँ नहीं, बल्कि उनके नीचे? मूल भावना किसके करीब है:',
        options: [
          'मैं हर चीज़ के लिए ज़िम्मेदार हूँ और कोई मदद नहीं करता। मैं अपने हिस्से से ज़्यादा ढोता हूँ।',
          'मेरे साथ बार-बार गलत हुआ है, और मैंने कुछ नहीं कहा या बहुत कम कहा।',
          'मैं अपने आसपास जो होता है उसे नियंत्रित नहीं कर सकता, और यह मुझे डराता है।',
          'जो मैं सच में देता और करता हूँ उसके लिए मुझे नहीं देखा जाता। मेहनत अदृश्य है।',
          'कुछ और — मुझे बताने दें।',
        ],
      },
    },
    // QMH-D4 — Anger branch (aftermath)
    {
      multiSelect: false,
      en: {
        text: 'When the anger has passed, what remains inside you?',
        options: [
          'Relief. Once I have expressed it, I feel clear.',
          'Guilt. I regret it and replay what I should not have said.',
          'Resentment. I stay upset for a long time and do not forget it.',
          'Exhaustion. The anger drains me more than it releases me.',
          'Shame. I feel small or bad for having felt it at all.',
          'Nothing clear. It goes quiet, but not fully resolved.',
          'Something else — I want to describe it myself.',
        ],
      },
      hi: {
        text: 'जब गुस्सा गुज़र जाता है, आपके अंदर क्या रह जाता है?',
        options: [
          'राहत। एक बार व्यक्त कर देने पर मैं साफ़ महसूस करता हूँ।',
          'अपराधबोध। मुझे पछतावा होता है और जो नहीं कहना था उसे दोहराता हूँ।',
          'नाराज़गी। मैं लंबे समय तक परेशान रहता हूँ और भूलता नहीं।',
          'थकान। गुस्सा मुझे राहत देने से ज़्यादा निचोड़ देता है।',
          'शर्म। उसे महसूस करने भर के लिए मैं खुद को छोटा या बुरा समझता हूँ।',
          'कुछ साफ़ नहीं। यह शांत हो जाता है, पर पूरी तरह सुलझता नहीं।',
          'कुछ और — मैं खुद बताना चाहता हूँ।',
        ],
      },
    },
    // QMH-D5 — Anger branch (lifelong hardest thing)
    {
      multiSelect: false,
      en: {
        text: 'Long before the current problem began, what has always been the hardest thing for you?',
        options: [
          'Worrying too much.',
          'Feeling things too deeply.',
          'Carrying responsibility for everyone.',
          'Not feeling good enough.',
          'Anger that I keep inside.',
          'Trusting people.',
          'Knowing what I truly want.',
          'Something else I have struggled with for most of my life.',
        ],
      },
      hi: {
        text: 'मौजूदा समस्या शुरू होने से बहुत पहले, आपके लिए हमेशा सबसे कठिन क्या रहा है?',
        options: [
          'बहुत ज़्यादा चिंता करना।',
          'चीज़ों को बहुत गहराई से महसूस करना।',
          'सबकी ज़िम्मेदारी ढोना।',
          'काफ़ी अच्छा न महसूस करना।',
          'गुस्सा जो मैं अंदर रखता हूँ।',
          'लोगों पर भरोसा करना।',
          'यह जानना कि मैं सच में क्या चाहता हूँ।',
          'कुछ और जिससे मैं ज़िंदगी भर जूझता रहा हूँ।',
        ],
      },
    },
    // QMH-L1 — Lonely branch (QMH-1 = E)
    {
      multiSelect: false,
      en: {
        text: 'This loneliness — when is it most present? What makes it land hardest?',
        options: [
          'In a crowd — surrounded by people and still feeling no one sees me.',
          'At night, when the day ends and there is silence and I am alone with it.',
          'On my phone, scrolling and feeling further from my own life than ever.',
          'After conversations, even good ones — I come away feeling I could not fully show up.',
          'All the time. It is not a moment; it is a background condition I carry.',
        ],
      },
      hi: {
        text: 'यह अकेलापन — कब सबसे ज़्यादा मौजूद होता है? कब सबसे गहरा लगता है?',
        options: [
          'भीड़ में — लोगों से घिरा होकर भी लगे कोई मुझे नहीं देखता।',
          'रात में, जब दिन खत्म होता है और सन्नाटा होता है और मैं उसके साथ अकेला होता हूँ।',
          'अपने फ़ोन पर, स्क्रॉल करते हुए और अपनी ज़िंदगी से पहले से कहीं दूर महसूस करते हुए।',
          'बातचीत के बाद, अच्छी भी — मैं यह महसूस करते हुए लौटता हूँ कि पूरी तरह सामने नहीं आ पाया।',
          'हर समय। यह कोई पल नहीं; यह एक पृष्ठभूमि की हालत है जो मैं ढोता हूँ।',
        ],
      },
    },
    // QMH-L2 — Lonely branch (when less lonely)
    {
      multiSelect: false,
      en: {
        text: 'Has there been a time when you felt less lonely than you do now? What was different then?',
        options: [
          'Yes — before a relationship ended, or before I moved, or before something changed.',
          'Yes — when I was younger and connection felt easier and less complicated.',
          'Not really. This has been there as long as I can remember.',
          'Yes — when I had one person who just understood me without effort.',
          'Yes, but I cannot name what was different. Something was just easier.',
        ],
      },
      hi: {
        text: 'क्या कभी ऐसा समय था जब आप अभी से कम अकेला महसूस करते थे? तब क्या अलग था?',
        options: [
          'हाँ — किसी रिश्ते के खत्म होने से पहले, या मेरे जगह बदलने से पहले, या कुछ बदलने से पहले।',
          'हाँ — जब मैं छोटा था और जुड़ाव आसान और कम उलझा हुआ लगता था।',
          'सच में नहीं। जब से याद है तब से ऐसा ही है।',
          'हाँ — जब मेरे पास एक व्यक्ति था जो बिना मेहनत के मुझे समझ लेता था।',
          'हाँ, पर मैं नहीं बता सकता क्या अलग था। कुछ बस आसान था।',
        ],
      },
    },
    // QMH-L3 — Lonely branch (response)
    {
      multiSelect: false,
      en: {
        text: 'When the loneliness is strongest, what do you usually do with it?',
        options: [
          'I withdraw more. I go quiet and keep to myself.',
          'I reach out, but I feel vulnerable doing it.',
          'I distract myself with phone, work, music, or scrolling.',
          'I try to stay around people, even if I do not feel connected.',
          'I act normal, but inside I feel isolated.',
          'I do something else — I would describe it myself.',
        ],
      },
      hi: {
        text: 'जब अकेलापन सबसे प्रबल हो, आप आमतौर पर इसका क्या करते हैं?',
        options: [
          'मैं और सिमट जाता हूँ। चुप हो जाता हूँ और खुद तक सीमित रहता हूँ।',
          'मैं संपर्क करता हूँ, पर ऐसा करते हुए कमज़ोर महसूस करता हूँ।',
          'मैं फ़ोन, काम, संगीत या स्क्रॉलिंग से खुद का ध्यान बँटाता हूँ।',
          'मैं लोगों के बीच रहने की कोशिश करता हूँ, भले जुड़ा महसूस न करूँ।',
          'मैं सामान्य दिखता हूँ, पर अंदर अलग-थलग महसूस करता हूँ।',
          'मैं कुछ और करता हूँ — मैं खुद बताऊँगा।',
        ],
      },
    },
    // QMH-L4 — Lonely branch (presence that helps) — shared with Burnout branch
    {
      multiSelect: false,
      en: {
        text: 'What kind of presence actually helps the most?',
        options: [
          'One trusted person. Just one real connection is enough.',
          'Being held, reassured, or emotionally comforted.',
          'A group or lively company. I feel better among people.',
          'Talking deeply and being understood.',
          'Silence, space, and time alone.',
          'Nothing helps much. I can be with people and still feel alone.',
          'Something else helps, and I would like to name it.',
        ],
      },
      hi: {
        text: 'किस तरह की मौजूदगी असल में सबसे ज़्यादा मदद करती है?',
        options: [
          'एक भरोसेमंद व्यक्ति। बस एक सच्चा जुड़ाव काफ़ी है।',
          'गले लगाया जाना, आश्वस्त किया जाना, या भावनात्मक रूप से सांत्वना मिलना।',
          'एक समूह या जीवंत साथ। लोगों के बीच मैं बेहतर महसूस करता हूँ।',
          'गहराई से बात करना और समझा जाना।',
          'चुप्पी, जगह, और अकेले का समय।',
          'कुछ ज़्यादा मदद नहीं करता। मैं लोगों के साथ होकर भी अकेला महसूस करता हूँ।',
          'कुछ और मदद करता है, और मैं उसे बताना चाहूँगा।',
        ],
      },
    },
    // QMH-L5 — Lonely branch (barrier)
    {
      multiSelect: false,
      en: {
        text: 'When connection is available — people who care, who would come closer if you let them — what usually gets in the way?',
        options: [
          'Nothing gets in the way. The problem is the people I need are not there.',
          'I want connection, but I struggle to ask for it.',
          'I want connection, but when people get close, I pull back.',
          'I do not feel understood, even when people genuinely try.',
          'I am afraid of being hurt, rejected, abandoned, or disappointed.',
          'I am not sure. I only know the distance remains.',
          'Something else feels more true.',
        ],
      },
      hi: {
        text: 'जब जुड़ाव उपलब्ध हो — लोग जो परवाह करते हैं, जो करीब आ जाएँ अगर आप दें — तब आमतौर पर क्या आड़े आता है?',
        options: [
          'कुछ आड़े नहीं आता। समस्या यह है कि जिन्हें मुझे चाहिए वे वहाँ नहीं।',
          'मुझे जुड़ाव चाहिए, पर इसे माँगने में मुझे संकोच होता है।',
          'मुझे जुड़ाव चाहिए, पर जब लोग करीब आते हैं, मैं पीछे हट जाता हूँ।',
          'मैं समझा हुआ महसूस नहीं करता, भले लोग सच में कोशिश करें।',
          'मुझे चोट खाने, ठुकराए जाने, छोड़े जाने या निराश होने का डर है।',
          'मुझे पक्का नहीं। बस इतना जानता हूँ कि दूरी बनी रहती है।',
          'कुछ और ज़्यादा सच लगता है।',
        ],
      },
    },
    // QMH-B1 — Burnout branch (QMH-1 = F)
    {
      multiSelect: false,
      en: {
        text: 'This running-on-empty feeling — what has been draining it? What have you been carrying that brought you here?',
        options: [
          'Responsibility. Years of being the person who manages everything for others.',
          'Work. A career that demanded everything and gave back little of what matters.',
          'Study. Years of pressure and exams, with expectations from me and everyone around me.',
          'Relationships. Giving to people who could not or did not give back.',
          'All of it together. Everything has been too much for too long.',
          'I do not know exactly. I just woke up one day and the energy was gone.',
        ],
      },
      hi: {
        text: 'यह खाली पर चलने का एहसास — किसने इसे निचोड़ा है? आप क्या ढोते आए हैं जो आपको यहाँ लाया?',
        options: [
          'ज़िम्मेदारी। सालों से वह व्यक्ति होना जो दूसरों के लिए सब संभालता है।',
          'काम। एक करियर जिसने सब कुछ माँगा और जो मायने रखता है वह कम लौटाया।',
          'पढ़ाई। सालों का दबाव और परीक्षाएँ, मेरी और मेरे आसपास सबकी उम्मीदों के साथ।',
          'रिश्ते। ऐसे लोगों को देना जो लौटा न सके या न लौटाया।',
          'यह सब एक साथ। बहुत कुछ बहुत लंबे समय से बहुत ज़्यादा रहा है।',
          'मुझे ठीक से नहीं पता। बस एक दिन जागा और ऊर्जा गायब थी।',
        ],
      },
    },
    // QMH-B2 — Burnout branch (things that used to matter)
    {
      multiSelect: false,
      en: {
        text: 'When you think about the things that used to matter — your work, the people you love, what gave you pleasure — what happens now?',
        options: [
          'I know they matter. I want to care. But I cannot find the feeling.',
          'They feel far away, like they belong to a version of me I cannot reach.',
          'I feel guilty that I do not feel more. I am present but not there.',
          'I feel a sadness about it — the loss of what I used to feel.',
          'Nothing. Genuinely nothing. That is the thing that frightens me.',
        ],
      },
      hi: {
        text: 'जब आप उन चीज़ों के बारे में सोचते हैं जो पहले मायने रखती थीं — आपका काम, अपने लोग, जो आनंद देता था — अब क्या होता है?',
        options: [
          'मुझे पता है वे मायने रखती हैं। मैं परवाह करना चाहता हूँ। पर वह भावना नहीं मिलती।',
          'वे दूर लगती हैं, जैसे मेरे किसी ऐसे रूप की हों जिस तक मैं नहीं पहुँच सकता।',
          'मुझे अपराधबोध होता है कि मैं ज़्यादा महसूस नहीं करता। मौजूद हूँ पर वहाँ नहीं।',
          'मुझे इसका दुख होता है — जो पहले महसूस करता था उसका खो जाना।',
          'कुछ नहीं। सच में कुछ नहीं। यही चीज़ मुझे डराती है।',
        ],
      },
    },
    // QMH-B3 — Burnout branch (capacity lost)
    {
      multiSelect: false,
      en: {
        text: 'What is the thing you seem to have lost the most?',
        options: [
          'Energy.',
          'Motivation.',
          'Interest.',
          'Patience.',
          'Hope.',
          'The ability to enjoy things.',
          'The ability to care.',
          'Something else.',
        ],
      },
      hi: {
        text: 'वह क्या है जो आपको लगता है आपने सबसे ज़्यादा खो दिया?',
        options: [
          'ऊर्जा।',
          'प्रेरणा।',
          'रुचि।',
          'धैर्य।',
          'उम्मीद।',
          'चीज़ों का आनंद लेने की क्षमता।',
          'परवाह करने की क्षमता।',
          'कुछ और।',
        ],
      },
    },
    // QMH-B3 (recovery) — Burnout branch (separates depletion from overwhelm)
    {
      multiSelect: false,
      en: {
        text: 'When you try to rest, what happens?',
        options: [
          'I rest, but I do not recover. The body stays empty.',
          'I rest physically, but my mind keeps turning.',
          'I feel guilty when I stop. Even rest feels like a failure.',
          'I sleep, but it does not restore me.',
          'I feel briefly better, then empty again very fast.',
          'Rest helps, but only if I am completely left alone.',
          'Something else is truer for me.',
        ],
      },
      hi: {
        text: 'जब आप आराम करने की कोशिश करते हैं, क्या होता है?',
        options: [
          'मैं आराम करता हूँ, पर ठीक नहीं होता। शरीर खाली रहता है।',
          'मैं शारीरिक रूप से आराम करता हूँ, पर मेरा मन चलता रहता है।',
          'जब रुकता हूँ तो अपराधबोध होता है। आराम भी असफलता-सा लगता है।',
          'मैं सोता हूँ, पर वह मुझे बहाल नहीं करता।',
          'थोड़ी देर बेहतर लगता है, फिर बहुत जल्दी फिर खाली।',
          'आराम मदद करता है, पर तभी जब मुझे पूरी तरह अकेला छोड़ दिया जाए।',
          'मेरे लिए कुछ और ज़्यादा सच है।',
        ],
      },
    },
    // QMH-B4 — Burnout branch (the moment)
    {
      multiSelect: false,
      en: {
        text: 'Imagine an ordinary day lately, not your worst day. What is the moment that makes you realise something inside is not the way it used to be?',
        options: [
          'I look at something I used to care about and cannot find the same interest or energy.',
          'I finish resting or taking time off and still feel depleted.',
          'Small tasks feel much bigger than they should. What was easy now feels heavy.',
          'People ask how I am and I do not know how to answer. I feel disconnected from what I feel.',
          'I keep going through the motions, but it feels automatic, like functioning without being present.',
          'I notice I have become more irritable, impatient, or emotionally flat.',
          'Something else makes me realise it.',
        ],
      },
      hi: {
        text: 'हाल का एक सामान्य दिन सोचिए, आपका सबसे बुरा दिन नहीं। वह कौन सा पल है जब आपको एहसास होता है कि अंदर कुछ पहले जैसा नहीं रहा?',
        options: [
          'मैं किसी ऐसी चीज़ को देखता हूँ जिसकी पहले परवाह थी और वही रुचि या ऊर्जा नहीं पाता।',
          'मैं आराम या छुट्टी पूरी करता हूँ और फिर भी थका हुआ महसूस करता हूँ।',
          'छोटे काम जितने होने चाहिए उससे बड़े लगते हैं। जो आसान था अब भारी लगता है।',
          'लोग पूछते हैं कैसा हूँ और मुझे जवाब नहीं सूझता। जो महसूस करता हूँ उससे कटा महसूस करता हूँ।',
          'मैं बस ढर्रे पर चलता रहता हूँ, पर यह अपने-आप-सा लगता है, जैसे मौजूद हुए बिना काम करना।',
          'मैं देखता हूँ कि मैं पहले से ज़्यादा चिड़चिड़ा, अधीर या भावनात्मक रूप से सपाट हो गया हूँ।',
          'कुछ और मुझे इसका एहसास कराता है।',
        ],
      },
    },
    // QMH-I1 — Identity branch (QMH-1 = G)
    {
      multiSelect: false,
      en: {
        text: 'This confusion about who you are or what you want — when you trace it back, where does it seem to come from?',
        options: [
          'From comparison. I see what others built and feel behind or wrong somehow.',
          'From pressure. I followed what was expected and now I do not know what I want.',
          'From loss. I used to know who I was. Something happened and that certainty left.',
          'From inside. It was always there — a feeling that nothing quite fits or is enough.',
          'From exhaustion. I used to have direction. Now I am too tired to know what I want.',
        ],
      },
      hi: {
        text: 'यह उलझन कि आप कौन हैं या क्या चाहते हैं — जब आप इसे पीछे तक खोजते हैं, यह कहाँ से आती दिखती है?',
        options: [
          'तुलना से। मैं देखता हूँ दूसरों ने क्या बनाया और खुद को पीछे या किसी तरह गलत महसूस करता हूँ।',
          'दबाव से। मैंने वही किया जो अपेक्षित था और अब नहीं जानता मैं क्या चाहता हूँ।',
          'खोने से। मैं जानता था मैं कौन हूँ। कुछ हुआ और वह निश्चितता चली गई।',
          'अंदर से। यह हमेशा थी — यह एहसास कि कुछ भी ठीक नहीं बैठता या काफ़ी नहीं।',
          'थकान से। मेरे पास दिशा थी। अब मैं इतना थका हूँ कि नहीं जानता क्या चाहता हूँ।',
        ],
      },
    },
    // QMH-I2 — Identity branch (one thing missing)
    {
      multiSelect: false,
      en: {
        text: 'When you imagine a version of yourself that feels whole — content, clear, at home in your own life — what is the one thing most missing between you and that version?',
        options: [
          'A sense of purpose. Something worth doing and worth being.',
          'A person. Someone who sees me clearly and stays.',
          'Confidence. The ability to act without needing to be certain first.',
          'Peace. A mind that can be still, that does not compare or criticise or replay.',
          'Permission. To want what I want, to be who I am, without apologising.',
        ],
      },
      hi: {
        text: 'जब आप अपने उस रूप की कल्पना करते हैं जो पूर्ण महसूस करता है — संतुष्ट, स्पष्ट, अपनी ज़िंदगी में सहज — आपके और उस रूप के बीच सबसे ज़्यादा कमी किस चीज़ की है?',
        options: [
          'एक उद्देश्य का एहसास। कुछ जो करने और होने लायक हो।',
          'एक व्यक्ति। कोई जो मुझे साफ़ देखे और टिका रहे।',
          'आत्मविश्वास। पहले निश्चित हुए बिना कदम उठाने की क्षमता।',
          'शांति। एक मन जो स्थिर रह सके, जो तुलना, आलोचना या दोहराव न करे।',
          'इजाज़त। जो चाहता हूँ वह चाहने की, जो हूँ वह होने की, बिना माफ़ी माँगे।',
        ],
      },
    },
    // QMH-I3 — Identity branch (reaction)
    {
      multiSelect: false,
      en: {
        text: 'When this confusion is strongest, what happens to the way you live your day?',
        options: [
          'I freeze. I delay decisions and feel stuck.',
          'I chase. I keep trying new things, but nothing holds.',
          'I compare more. I become sharper, harder on myself.',
          'I withdraw. I want less contact and less expectation.',
          'I people-please. I adjust myself to others to keep moving.',
          'I overwork. I try to earn a sense of worth through doing.',
          'Something else happens, and I would like to describe it.',
        ],
      },
      hi: {
        text: 'जब यह उलझन सबसे प्रबल हो, आपके दिन जीने के ढंग का क्या होता है?',
        options: [
          'मैं जम जाता हूँ। फैसले टालता हूँ और अटका महसूस करता हूँ।',
          'मैं पीछे भागता हूँ। नई चीज़ें आज़माता रहता हूँ, पर कुछ टिकता नहीं।',
          'मैं ज़्यादा तुलना करता हूँ। मैं तीखा हो जाता हूँ, खुद पर ज़्यादा सख्त।',
          'मैं सिमट जाता हूँ। कम संपर्क और कम उम्मीद चाहता हूँ।',
          'मैं लोगों को खुश करता हूँ। चलते रहने के लिए खुद को दूसरों के मुताबिक ढालता हूँ।',
          'मैं ज़्यादा काम करता हूँ। करने के ज़रिए अपनी अहमियत कमाने की कोशिश करता हूँ।',
          'कुछ और होता है, और मैं उसे बताना चाहूँगा।',
        ],
      },
    },
    // QMH-I4 — Identity branch (core wound)
    {
      multiSelect: false,
      en: {
        text: 'Underneath the confusion, what hurts most?',
        options: [
          'I feel behind.',
          'I feel like I wasted time.',
          'I feel I became who others wanted, not who I am.',
          'I feel not enough, even when I try hard.',
          'I feel lost without a clear direction.',
          'I feel unseen for who I really am.',
          'Something else feels truer.',
        ],
      },
      hi: {
        text: 'उलझन के नीचे, सबसे ज़्यादा क्या दुखता है?',
        options: [
          'मुझे लगता है मैं पीछे हूँ।',
          'मुझे लगता है मैंने समय बर्बाद किया।',
          'मुझे लगता है मैं वह बना जो दूसरे चाहते थे, वह नहीं जो मैं हूँ।',
          'मुझे लगता है मैं काफ़ी नहीं, चाहे कितनी भी कोशिश करूँ।',
          'मुझे लगता है मैं बिना स्पष्ट दिशा के खोया हुआ हूँ।',
          'मुझे लगता है जो मैं सच में हूँ उसके लिए मुझे नहीं देखा जाता।',
          'कुछ और ज़्यादा सच लगता है।',
        ],
      },
    },
    // QMH-I5 — Identity branch (return to self)
    {
      multiSelect: false,
      en: {
        text: 'When you do feel a little more like yourself, what usually brings that back?',
        options: [
          'Being alone with no pressure.',
          'Talking to one person who truly understands me.',
          'Doing something useful or productive.',
          'Creating, writing, planning, or imagining.',
          'Movement, travel, or a change of place.',
          'Feeling appreciated or seen.',
          'Nothing reliably brings it back.',
          'Something else does, and I would like to say it.',
        ],
      },
      hi: {
        text: 'जब आप थोड़ा अपने जैसा महसूस करते हैं, आमतौर पर क्या उसे वापस लाता है?',
        options: [
          'बिना किसी दबाव के अकेले होना।',
          'एक ऐसे व्यक्ति से बात करना जो मुझे सच में समझता है।',
          'कुछ उपयोगी या उत्पादक करना।',
          'सृजन करना, लिखना, योजना बनाना, या कल्पना करना।',
          'हलचल, यात्रा, या जगह बदलना।',
          'सराहा या देखा हुआ महसूस करना।',
          'कुछ भी भरोसे से उसे वापस नहीं लाता।',
          'कुछ और लाता है, और मैं उसे कहना चाहूँगा।',
        ],
      },
    },
    ...CLOSING_BLOCK,
    CONSTITUTIONAL_FINAL,
  ],

  // ════════════════════════════════════════════════════════════════════════════
  // DE-ADDICTION / SUBSTANCE & BEHAVIOURAL RECOVERY
  // ════════════════════════════════════════════════════════════════════════════
  addiction: [
    // QAD-1 — Always first (what do you want to be free from)
    {
      multiSelect: false,
      en: {
        text: 'Before anything else — just so I understand what we are working with together — what is it you want to be free from?',
        options: [
          'Gutka, pan masala, khaini, zarda, or similar chewing tobacco.',
          'Cigarettes, bidi, hookah, or vaping.',
          'Alcohol — drinking more often or more heavily than I want.',
          'Ganja, charas, weed, marijuana, bhang, or hashish.',
          'Afeem, opium, doda, phukki, poppy husk, or similar.',
          'Smack, brown sugar, heroin, or related street opioids.',
          'Medicines used for effect — painkillers, cough syrups, sleeping pills, anti-anxiety, or opioid medicines.',
          'MD, MDMA, ecstasy, mephedrone, meth, cocaine, ketamine, LSD, or other party drugs.',
          'Solution, thinner, glue, whitener, petrol, correction fluid, or similar.',
          'My phone — scrolling, social media, reels, notifications.',
          'Gaming — I play much more than I want and struggle to stop.',
          'OTT, YouTube, binge-watching, or endless content.',
          'Pornography — I want to stop or significantly reduce.',
          'Junk food or sugar — eating compulsively when stressed or bored.',
          'Constant worry about masturbation, semen loss, or sexual performance.',
          'Gambling, betting, online betting, rummy, or casino-style games.',
          'Shopping, spending, or buying compulsively.',
          'Something else — I would like to describe it.',
        ],
      },
      hi: {
        text: 'सबसे पहले — बस ताकि मैं समझ सकूँ कि हम साथ में किस चीज़ पर काम कर रहे हैं — आप किस चीज़ से आज़ाद होना चाहते हैं?',
        options: [
          'गुटखा, पान मसाला, खैनी, ज़र्दा, या ऐसा कोई खाने वाला तंबाकू।',
          'सिगरेट, बीड़ी, हुक्का, या वेपिंग।',
          'शराब — जितना चाहता हूँ उससे ज़्यादा बार या ज़्यादा पीना।',
          'गांजा, चरस, वीड, मारिजुआना, भांग, या हशीश।',
          'अफीम, डोडा, फुक्की, पोस्त, या ऐसा कुछ।',
          'स्मैक, ब्राउन शुगर, हेरोइन, या ऐसे स्ट्रीट ओपिओइड।',
          'असर के लिए ली जाने वाली दवाएँ — पेनकिलर, कफ सिरप, नींद की गोलियाँ, चिंता की दवा, या ओपिओइड दवाएँ।',
          'MD, MDMA, एक्स्टसी, मेफेड्रोन, मेथ, कोकीन, केटामीन, LSD, या अन्य पार्टी ड्रग्स।',
          'सोल्यूशन, थिनर, गोंद, व्हाइटनर, पेट्रोल, करेक्शन फ्लूइड, या ऐसा कुछ।',
          'मेरा फ़ोन — स्क्रॉलिंग, सोशल मीडिया, रील्स, नोटिफिकेशन।',
          'गेमिंग — मैं जितना चाहता हूँ उससे कहीं ज़्यादा खेलता हूँ और रुक नहीं पाता।',
          'OTT, यूट्यूब, लगातार देखना, या अनवरत कंटेंट।',
          'पोर्नोग्राफी — मैं रोकना या काफ़ी कम करना चाहता हूँ।',
          'जंक फूड या चीनी — तनाव या बोरियत में बेकाबू खाना।',
          'हस्तमैथुन, वीर्य हानि, या यौन प्रदर्शन की लगातार चिंता।',
          'जुआ, सट्टा, ऑनलाइन बेटिंग, रमी, या कैसीनो जैसे खेल।',
          'खरीदारी, खर्च, या बेकाबू ढंग से चीज़ें खरीदना।',
          'कुछ और — मैं इसे बताना चाहूँगा।',
        ],
      },
    },
    // Safety & Control question (severity / dependency screen)
    {
      multiSelect: false,
      en: {
        text: 'Before we go further, I need to understand something important. This is not about judging you — it helps me see whether this is a habit, a dependency, or something that needs closer support. Which of these feels most true right now?',
        options: [
          'I still feel in control. I use it more than I would like, but I can usually stop when I decide to.',
          'I often tell myself "just this once" and end up doing more than I planned.',
          'I have tried to stop several times but keep returning despite genuinely wanting to quit.',
          'It is now affecting my sleep, energy, health, work, studies, finances, or relationships.',
          'I sometimes hide, lie about, or minimise how much I use because others would be concerned.',
          'When I try to stop, I become restless, anxious, irritable, unable to concentrate, or physically unwell.',
          'I have had serious consequences because of it and still struggle to stop.',
          'I would prefer to describe my situation in my own words.',
        ],
      },
      hi: {
        text: 'आगे बढ़ने से पहले मुझे एक ज़रूरी बात समझनी है। यह आपको आँकने के लिए नहीं — इससे मुझे पता चलता है कि यह एक आदत है, निर्भरता है, या कुछ जिसे करीबी सहारे की ज़रूरत है। अभी इनमें से क्या सबसे सच लगता है?',
        options: [
          'मैं अब भी नियंत्रण में महसूस करता हूँ। चाहने से ज़्यादा लेता हूँ, पर तय कर लूँ तो आमतौर पर रोक सकता हूँ।',
          'मैं अक्सर खुद से कहता हूँ "बस इस बार" और सोचे से ज़्यादा कर बैठता हूँ।',
          'मैंने कई बार रोकने की कोशिश की पर सच में छोड़ना चाहते हुए भी बार-बार लौट आता हूँ।',
          'यह अब मेरी नींद, ऊर्जा, सेहत, काम, पढ़ाई, पैसे या रिश्तों को प्रभावित कर रहा है।',
          'मैं कभी-कभी छिपाता हूँ, झूठ बोलता हूँ, या कम बताता हूँ क्योंकि दूसरे चिंतित होंगे।',
          'जब रोकने की कोशिश करता हूँ, तो बेचैन, चिंतित, चिड़चिड़ा, एकाग्र न रहने वाला या शारीरिक रूप से अस्वस्थ हो जाता हूँ।',
          'इसकी वजह से गंभीर परिणाम भुगते हैं और फिर भी रोकना मुश्किल है।',
          'मैं अपनी स्थिति अपने शब्दों में बताना चाहूँगा।',
        ],
      },
    },
    // QAD-2 — What the habit gives you
    {
      multiSelect: false,
      en: {
        text: 'Now the most important question — not about the habit itself, but what it does for you. In the moments when the urge is real and you give in, what does it actually give you? What changes?',
        options: [
          'It calms something. A tension or pressure eases. I can breathe again.',
          'It fills something. A boredom or emptiness I cannot otherwise reach.',
          'It gives me a moment that is only mine — a tiny escape from responsibility.',
          'It is social. I do it with others and it connects me to something.',
          'Honestly I do not know anymore. It is just what I do. The reason is gone.',
          'Let me describe what it does in my own words.',
        ],
      },
      hi: {
        text: 'अब सबसे ज़रूरी सवाल — आदत के बारे में नहीं, बल्कि यह आपके लिए क्या करती है। जब तलब सच में हो और आप दे देते हैं, तब यह असल में आपको क्या देती है? क्या बदलता है?',
        options: [
          'यह कुछ शांत करती है। एक तनाव या दबाव कम होता है। मैं फिर साँस ले पाता हूँ।',
          'यह कुछ भरती है। एक बोरियत या खालीपन जिस तक मैं और किसी तरह नहीं पहुँच पाता।',
          'यह मुझे एक पल देती है जो सिर्फ़ मेरा है — ज़िम्मेदारी से एक छोटा-सा बचाव।',
          'यह सामाजिक है। मैं इसे दूसरों के साथ करता हूँ और यह मुझे किसी चीज़ से जोड़ती है।',
          'सच कहूँ तो अब नहीं पता। यह बस मैं करता हूँ। कारण खत्म हो गया।',
          'मुझे अपने शब्दों में बताने दें कि यह क्या करती है।',
        ],
      },
    },
    // QAD-3 — When the pull is strongest
    {
      multiSelect: false,
      en: {
        text: 'When during your day does the pull feel most powerful — the moment the urge arrives almost before you have thought about it?',
        options: [
          'First thing in the morning, before I have done anything, before I am properly awake.',
          'After eating. Almost a ritual — the meal ends and the urge begins.',
          'The moment stress arrives, before I have consciously processed it.',
          'When I am idle, when nothing is demanding my attention.',
          'Late evening or at night, when the day is done and the quiet arrives.',
          'No specific time. The urge is more or less always there at a low level.',
        ],
      },
      hi: {
        text: 'दिन में कब यह खिंचाव सबसे प्रबल लगता है — वह पल जब तलब सोचने से पहले ही आ जाती है?',
        options: [
          'सुबह सबसे पहले, कुछ भी करने से पहले, ठीक से जागने से पहले।',
          'खाने के बाद। लगभग एक रस्म — खाना खत्म और तलब शुरू।',
          'जैसे ही तनाव आता है, इससे पहले कि मैं सचेत होकर उसे समझूँ।',
          'जब मैं खाली होता हूँ, जब कुछ भी मेरा ध्यान नहीं माँगता।',
          'देर शाम या रात, जब दिन खत्म होता है और शांति आती है।',
          'कोई खास समय नहीं। तलब कमोबेश हमेशा एक हल्के स्तर पर रहती है।',
        ],
      },
    },
    // QAD-4 — Body sensation just before giving in
    {
      multiSelect: false,
      en: {
        text: 'Think about the seconds just before you reach for it — while the urge is at its peak. What is that like, physically, in your body?',
        options: [
          'A tension — muscles tight, jaw tight, something coiling that needs release.',
          'A restlessness — like I cannot settle, like I need to move or the feeling moves through me.',
          'A pull — more like a gap, something calling from inside that wants to be filled.',
          'An irritation — a sharpness at the surface of my skin and nerves, like sandpaper from inside.',
          'Nothing I can describe physically. It lives only in my mind.',
          'I will describe it in my own words.',
        ],
      },
      hi: {
        text: 'उस पल के बारे में सोचिए जब आप इसकी ओर हाथ बढ़ाने ही वाले होते हैं — जब तलब चरम पर हो। शरीर में, शारीरिक रूप से वह कैसा होता है?',
        options: [
          'एक तनाव — मांसपेशियाँ तनी, जबड़ा तना, कुछ कसता हुआ जिसे निकलना है।',
          'एक बेचैनी — जैसे मैं टिक नहीं पाता, जैसे मुझे हिलना है वरना एहसास मुझमें से गुज़रता है।',
          'एक खिंचाव — एक खाली जगह जैसा, अंदर से कुछ पुकारता हुआ जो भरना चाहता है।',
          'एक चिढ़ — मेरी त्वचा और नसों की सतह पर एक तीखापन, जैसे अंदर से रेगमाल।',
          'कुछ नहीं जिसे शारीरिक रूप से बता सकूँ। यह सिर्फ़ मेरे मन में रहता है।',
          'मैं इसे अपने शब्दों में बताऊँगा।',
        ],
      },
    },
    // QAD-5 — Have you tried to stop before
    {
      multiSelect: false,
      en: {
        text: 'Have you tried to stop before? I ask because the story of how someone has tried tells me what has held them back.',
        options: [
          'Many times. I stop and then stress or a situation pulls me back in.',
          'Once or twice. Each time I lasted a while and then something broke the resolve.',
          'I have not really tried seriously. I know I should but have not found the real reason yet.',
          'I have been trying continuously for a long time. It feels like a war I am slowly losing.',
          'This is my first real attempt.',
        ],
      },
      hi: {
        text: 'क्या आपने पहले रोकने की कोशिश की है? मैं इसलिए पूछता हूँ क्योंकि किसी ने कैसे कोशिश की उसकी कहानी बताती है कि उसे किसने रोका।',
        options: [
          'कई बार। मैं रुकता हूँ और फिर तनाव या कोई स्थिति मुझे वापस खींच लेती है।',
          'एक-दो बार। हर बार थोड़ी देर टिका और फिर कुछ ने इरादा तोड़ दिया।',
          'मैंने सच में गंभीरता से कोशिश नहीं की। पता है करनी चाहिए पर अब तक असली कारण नहीं मिला।',
          'मैं लंबे समय से लगातार कोशिश कर रहा हूँ। यह एक जंग जैसी लगती है जिसे मैं धीरे-धीरे हार रहा हूँ।',
          'यह मेरी पहली सच्ची कोशिश है।',
        ],
      },
    },
    // QAD-6 — Body signs
    {
      multiSelect: false,
      en: {
        text: 'One last thing — your body. Apart from the habit, has your body been showing you anything you notice but have perhaps normalised?',
        options: [
          'Acidity, reflux, or stomach heat, especially in the morning.',
          'Cough or chest congestion that lingers longer than it should.',
          'Liver-area discomfort — right side under the ribs, heaviness after fatty food or drink.',
          'Nervous symptoms — trembling hands, palpitations, headaches that come and go.',
          'Sleep disturbance — unable to sleep properly or waking at night.',
          'Nothing significant physically.',
        ],
      },
      hi: {
        text: 'एक आखिरी बात — आपका शरीर। आदत के अलावा, क्या आपका शरीर आपको कुछ दिखा रहा है जिसे आप देखते हैं पर शायद सामान्य मान चुके हैं?',
        options: [
          'अम्लता, खट्टी डकार, या पेट की गर्मी, खासकर सुबह।',
          'खाँसी या छाती की जकड़न जो ज़रूरत से ज़्यादा देर तक रहती है।',
          'जिगर के क्षेत्र में तकलीफ़ — दाईं ओर पसलियों के नीचे, चिकना खाने या पीने के बाद भारीपन।',
          'तंत्रिका संबंधी लक्षण — काँपते हाथ, धड़कन, आते-जाते सिरदर्द।',
          'नींद में गड़बड़ी — ठीक से न सो पाना या रात में जागना।',
          'शारीरिक रूप से कुछ खास नहीं।',
        ],
      },
    },
    // QAD-7 — Aftermath
    {
      multiSelect: false,
      en: {
        text: 'After you give in to the habit, what is the most honest inner result? What stays with you next?',
        options: [
          'Relief. The pressure drops for a while, even if only briefly.',
          'Guilt. I feel bad, weak, or disappointed in myself afterward.',
          'Emptiness. It helps in the moment, but afterward I feel just as empty.',
          'More craving. It seems to awaken the urge again rather than settle it.',
          'Shame. I want to hide it or not think about it.',
          'Nothing clear. It has become automatic.',
          'Something else — I want to describe it in my own words.',
        ],
      },
      hi: {
        text: 'आदत में देने के बाद, सबसे ईमानदार अंदरूनी नतीजा क्या होता है? आगे आपके साथ क्या रह जाता है?',
        options: [
          'राहत। दबाव थोड़ी देर के लिए घटता है, भले ही पल भर को।',
          'अपराधबोध। बाद में मैं बुरा, कमज़ोर, या खुद से निराश महसूस करता हूँ।',
          'खालीपन। पल भर को मदद करती है, पर बाद में मैं उतना ही खाली महसूस करता हूँ।',
          'और तलब। यह तलब को शांत करने के बजाय फिर जगा देती है।',
          'शर्म। मैं इसे छिपाना या इसके बारे में न सोचना चाहता हूँ।',
          'कुछ साफ़ नहीं। यह अपने-आप होने वाला बन गया है।',
          'कुछ और — मैं अपने शब्दों में बताना चाहता हूँ।',
        ],
      },
    },
    // QAD-G1 — Gaming branch
    {
      multiSelect: false,
      en: {
        text: 'When you are gaming — really in it — what does it give you that the rest of your life does not?',
        options: [
          'Control. In the game I decide. In real life I often feel I have none.',
          'Achievement. I win, I progress, I get better. That feeling is real and clear.',
          'Escape. Whatever is happening outside stops mattering. I am somewhere else.',
          'Connection. My teammates, my guild, the people I play with — that community is real.',
          'Stimulation. My mind needs to be occupied or the silence gets too loud.',
        ],
      },
      hi: {
        text: 'जब आप गेमिंग करते हैं — सच में उसमें डूबे — यह आपको क्या देती है जो बाकी ज़िंदगी नहीं देती?',
        options: [
          'नियंत्रण। खेल में मैं तय करता हूँ। असल ज़िंदगी में अक्सर लगता है मेरा कोई नहीं।',
          'उपलब्धि। मैं जीतता हूँ, आगे बढ़ता हूँ, बेहतर होता हूँ। वह एहसास सच्चा और साफ़ है।',
          'पलायन। बाहर जो भी हो रहा हो मायने रखना बंद कर देता है। मैं कहीं और होता हूँ।',
          'जुड़ाव। मेरे साथी, मेरी टीम, जिनके साथ खेलता हूँ — वह समुदाय सच्चा है।',
          'उत्तेजना। मेरे मन को व्यस्त रहना चाहिए वरना सन्नाटा बहुत तेज़ हो जाता है।',
        ],
      },
    },
    // QAD-G2 — Gaming branch (when you cannot game)
    {
      multiSelect: false,
      en: {
        text: 'When you cannot game — the device is gone or someone stops you — what is the first thing you feel?',
        options: [
          'Irritability. A sharpness I take out on whoever is nearby.',
          'Anxiety. A restlessness, like something is wrong and I cannot settle.',
          'Emptiness. Like the colour drains from the room, like nothing else is interesting.',
          'Guilt. I know I should stop. Not being allowed to makes me angry at myself.',
          'Relief, actually. But then the pull comes back within an hour.',
        ],
      },
      hi: {
        text: 'जब आप गेमिंग नहीं कर सकते — डिवाइस नहीं है या कोई रोक देता है — सबसे पहले आप क्या महसूस करते हैं?',
        options: [
          'चिड़चिड़ाहट। एक तीखापन जो जो भी पास हो उस पर निकालता हूँ।',
          'चिंता। एक बेचैनी, जैसे कुछ गलत है और मैं टिक नहीं पाता।',
          'खालीपन। जैसे कमरे से रंग निकल जाए, जैसे और कुछ दिलचस्प न रहे।',
          'अपराधबोध। पता है रुकना चाहिए। न रुकने देने पर मैं खुद पर गुस्सा होता हूँ।',
          'दरअसल राहत। पर फिर एक घंटे के अंदर खिंचाव लौट आता है।',
        ],
      },
    },
    // QAD-G3 — Gaming branch (cost)
    {
      multiSelect: false,
      en: {
        text: 'Every habit gives something but also takes something. Looking honestly at your gaming, what has it taken from you the most?',
        options: [
          'Time. Years have passed faster than they should have.',
          'Sleep. My nights and mornings are no longer healthy.',
          'Studies or career. I could be further ahead than I am.',
          'Relationships. People important to me get less of me than they deserve.',
          'My confidence. I trust myself less because I keep breaking promises to myself.',
          'Nothing major yet, but I worry where it is heading.',
          'Something else — I would like to describe it.',
        ],
      },
      hi: {
        text: 'हर आदत कुछ देती है पर कुछ लेती भी है। ईमानदारी से अपनी गेमिंग देखें, तो इसने आपसे सबसे ज़्यादा क्या लिया?',
        options: [
          'समय। साल जितनी तेज़ी से बीतने नहीं चाहिए थे उतनी तेज़ी से बीत गए।',
          'नींद। मेरी रातें और सुबहें अब स्वस्थ नहीं रहीं।',
          'पढ़ाई या करियर। मैं जितना हूँ उससे आगे हो सकता था।',
          'रिश्ते। मेरे अपनों को मेरा उतना हिस्सा नहीं मिलता जितना उन्हें मिलना चाहिए।',
          'मेरा आत्मविश्वास। मैं खुद पर कम भरोसा करता हूँ क्योंकि मैं खुद से किए वादे तोड़ता रहता हूँ।',
          'अभी कुछ बड़ा नहीं, पर मुझे चिंता है यह किस ओर जा रहा है।',
          'कुछ और — मैं उसे बताना चाहूँगा।',
        ],
      },
    },
    // QAD-G4 — Gaming branch (what would be hardest to replace)
    {
      multiSelect: false,
      en: {
        text: 'If gaming disappeared from your life tomorrow, what would be hardest to replace?',
        options: [
          'The sense of achievement and progress.',
          'The escape from stress and pressure.',
          'The excitement and stimulation.',
          'The friendships and community.',
          'The feeling of control.',
          'The structure it gives my day.',
          'I honestly do not know what would replace it.',
        ],
      },
      hi: {
        text: 'अगर कल आपकी ज़िंदगी से गेमिंग गायब हो जाए, तो किसकी जगह भरना सबसे कठिन होगा?',
        options: [
          'उपलब्धि और आगे बढ़ने का एहसास।',
          'तनाव और दबाव से पलायन।',
          'उत्साह और उत्तेजना।',
          'दोस्ती और समुदाय।',
          'नियंत्रण का एहसास।',
          'यह मेरे दिन को जो ढाँचा देती है।',
          'सच कहूँ तो नहीं पता इसकी जगह क्या लेगा।',
        ],
      },
    },
    // QAD-M1 — Porn / masturbation branch (control)
    {
      multiSelect: false,
      en: {
        text: 'How much control do you feel you still have over it?',
        options: [
          'I still feel mostly in control.',
          'I often do more than I planned.',
          'I have tried to stop and keep returning to it.',
          'It is now affecting sleep, focus, work, or relationships.',
          'I hide it or feel unable to speak openly about it.',
          'When I try to stop, I become restless, irritable, or unable to settle.',
          'Something else is true.',
        ],
      },
      hi: {
        text: 'आपको लगता है इस पर अब भी आपका कितना नियंत्रण है?',
        options: [
          'मैं अब भी ज़्यादातर नियंत्रण में महसूस करता हूँ।',
          'मैं अक्सर सोचे से ज़्यादा कर बैठता हूँ।',
          'मैंने रोकने की कोशिश की और बार-बार लौट आता हूँ।',
          'यह अब नींद, ध्यान, काम या रिश्तों को प्रभावित कर रहा है।',
          'मैं इसे छिपाता हूँ या इस पर खुलकर बात नहीं कर पाता।',
          'जब रोकने की कोशिश करता हूँ, बेचैन, चिड़चिड़ा या अस्थिर हो जाता हूँ।',
          'कुछ और सच है।',
        ],
      },
    },
    // QAD-M (concern) — Porn branch (main concern carried)
    {
      multiSelect: false,
      en: {
        text: 'What is the main concern you are carrying about this?',
        options: [
          'I believe I have lost vital energy through ejaculation or nocturnal emission, and it has weakened me.',
          'I feel guilt or shame about masturbation and cannot stop despite wanting to.',
          'I notice physical symptoms — weakness, back pain, dizziness, or dark urine — after ejaculation.',
          'I am worried about my future fertility or sexual capacity because of my history.',
          'I simply want to reduce sexual activity because I feel it drains something important.',
        ],
      },
      hi: {
        text: 'इसके बारे में आप जो मुख्य चिंता ढो रहे हैं वह क्या है?',
        options: [
          'मुझे लगता है मैंने स्खलन या स्वप्नदोष से महत्वपूर्ण ऊर्जा खोई है, और इसने मुझे कमज़ोर किया।',
          'मुझे हस्तमैथुन को लेकर अपराधबोध या शर्म है और चाहकर भी रोक नहीं पाता।',
          'मैं स्खलन के बाद शारीरिक लक्षण देखता हूँ — कमज़ोरी, कमर दर्द, चक्कर, या गहरे रंग का मूत्र।',
          'मुझे अपने इतिहास के कारण भविष्य की प्रजनन क्षमता या यौन क्षमता की चिंता है।',
          'मैं बस यौन गतिविधि कम करना चाहता हूँ क्योंकि लगता है यह कुछ महत्वपूर्ण निचोड़ती है।',
        ],
      },
    },
    // QAD-M (urge) — Porn branch (feeling just before the urge)
    {
      multiSelect: false,
      en: {
        text: 'When the urge to watch pornography or to masturbate is strongest, what is the feeling just before it arrives?',
        options: [
          'Boredom. An emptiness. Just the need to fill a gap.',
          'Loneliness. A wanting of connection or intimacy that is not available.',
          'Stress or tension. Something has built up and this is the release.',
          'Excitement — a craving that is more physical than emotional.',
          'A compulsion I cannot explain. It arrives and I follow it before I have thought about it.',
        ],
      },
      hi: {
        text: 'जब पोर्न देखने या हस्तमैथुन की तलब सबसे प्रबल हो, उसके आने से ठीक पहले क्या भावना होती है?',
        options: [
          'बोरियत। एक खालीपन। बस एक खाली जगह भरने की ज़रूरत।',
          'अकेलापन। जुड़ाव या निकटता की चाह जो उपलब्ध नहीं।',
          'तनाव। कुछ जमा हो गया है और यह उसका निकास है।',
          'उत्तेजना — एक तलब जो भावनात्मक से ज़्यादा शारीरिक है।',
          'एक मजबूरी जिसे मैं समझा नहीं सकता। यह आती है और मैं सोचने से पहले उसके पीछे चला जाता हूँ।',
        ],
      },
    },
    // QAD-M (intimacy) — Porn branch (effect on real intimacy)
    {
      multiSelect: false,
      en: {
        text: 'Has this habit affected how you feel about real intimacy — with a partner, or in your imagination of future intimacy?',
        options: [
          'Yes — I feel less able to be aroused by or present with a real person than before.',
          'Yes — I feel shame or guilt that affects how I see myself in relationships.',
          'Yes — I prefer this to real intimacy, which feels more complicated or frightening.',
          'Not significantly. The concern is the habit itself, not what it has affected.',
          'I am not in a relationship, so I cannot fully say.',
        ],
      },
      hi: {
        text: 'क्या इस आदत ने असली निकटता को लेकर आपकी भावना को प्रभावित किया है — किसी साथी के साथ, या भविष्य की निकटता की कल्पना में?',
        options: [
          'हाँ — मैं पहले से कम किसी असली व्यक्ति से उत्तेजित या उसके साथ मौजूद हो पाता हूँ।',
          'हाँ — मुझे शर्म या अपराधबोध है जो रिश्तों में मेरी खुद की छवि को प्रभावित करता है।',
          'हाँ — मैं इसे असली निकटता से ज़्यादा पसंद करता हूँ, जो ज़्यादा उलझी या डरावनी लगती है।',
          'खास नहीं। चिंता आदत खुद है, उसका असर नहीं।',
          'मैं किसी रिश्ते में नहीं हूँ, तो पूरी तरह नहीं कह सकता।',
        ],
      },
    },
    // QAD-M (weakness) — Porn branch (kind of weakness felt)
    {
      multiSelect: false,
      en: {
        text: 'When you say it has weakened you — what do you feel most? What kind of weakness is it?',
        options: [
          'Physical. Fatigue, heaviness, no stamina. My body feels different.',
          'Mental. I cannot concentrate as well. Memory, focus, clarity — all reduced.',
          'Emotional. I feel low, flat, less like myself.',
          'All three. Everything has become a little less since this began.',
          'I am not sure it has actually weakened me — the fear that it has is the bigger problem.',
        ],
      },
      hi: {
        text: 'जब आप कहते हैं इसने आपको कमज़ोर किया — आप सबसे ज़्यादा क्या महसूस करते हैं? यह किस तरह की कमज़ोरी है?',
        options: [
          'शारीरिक। थकान, भारीपन, कोई दमखम नहीं। मेरा शरीर अलग महसूस होता है।',
          'मानसिक। मैं उतना ध्यान नहीं लगा पाता। याददाश्त, ध्यान, स्पष्टता — सब घट गई।',
          'भावनात्मक। मैं उदास, सपाट, कम अपने जैसा महसूस करता हूँ।',
          'तीनों। जब से यह शुरू हुआ सब कुछ थोड़ा कम हो गया।',
          'मुझे पक्का नहीं कि इसने सच में कमज़ोर किया — यह डर कि किया है, बड़ी समस्या है।',
        ],
      },
    },
    ...CLOSING_BLOCK,
    CONSTITUTIONAL_FINAL,
  ],

  // ════════════════════════════════════════════════════════════════════════════
  // SEXUAL HEALTH & WELLNESS
  // ════════════════════════════════════════════════════════════════════════════
  sex: [
    // QSX-1 — The concern (always first, never skipped)
    {
      multiSelect: false,
      en: {
        text: 'I want to understand your concern in this area, and whatever you share here is treated with the same care and privacy as everything else. There is nothing unusual or embarrassing here. What is the main thing troubling you?',
        options: [
          'My desire has reduced significantly, or disappeared. I have little to no interest.',
          'I want to be intimate but my body is not cooperating. There is a disconnect between desire and response.',
          'Irregular, painful, or very heavy periods. My cycle feels out of control.',
          'I think my hormones are imbalanced. Energy, mood, skin, weight all feel disrupted.',
          'Intimacy feels difficult emotionally, with anxiety, fear, or painful associations.',
          'Fertility concerns. We are trying and it is not happening as expected.',
          'I will describe it in my own words.',
        ],
      },
      hi: {
        text: 'मैं इस क्षेत्र में आपकी चिंता समझना चाहता हूँ, और आप यहाँ जो भी साझा करते हैं उसे बाकी सब की तरह ही देखभाल और गोपनीयता से रखा जाता है। यहाँ कुछ भी असामान्य या शर्मनाक नहीं है। आपको सबसे ज़्यादा क्या परेशान कर रहा है?',
        options: [
          'मेरी इच्छा काफ़ी कम हो गई है, या खत्म हो गई। मेरी कोई या बहुत कम रुचि है।',
          'मैं निकटता चाहता हूँ पर मेरा शरीर साथ नहीं देता। इच्छा और प्रतिक्रिया के बीच एक अलगाव है।',
          'अनियमित, दर्दनाक, या बहुत ज़्यादा माहवारी। मेरा चक्र बेकाबू लगता है।',
          'मुझे लगता है मेरे हार्मोन असंतुलित हैं। ऊर्जा, मूड, त्वचा, वज़न सब गड़बड़ लगता है।',
          'निकटता भावनात्मक रूप से कठिन लगती है — चिंता, डर, या दर्दनाक यादों के साथ।',
          'प्रजनन संबंधी चिंता। हम कोशिश कर रहे हैं और जैसा सोचा वैसा नहीं हो रहा।',
          'मैं इसे अपने शब्दों में बताऊँगा।',
        ],
      },
    },
    // QSX-2 — Timeline (duration and onset)
    {
      multiSelect: false,
      en: {
        text: 'How long has this been happening? And is there a time you can point to when something changed, or has it been a gradual shift you barely noticed until it was already there?',
        options: [
          'It changed quite suddenly after something happened — an event, a loss, a change in my relationship.',
          'It has been gradual. Over months or years it faded. I cannot point to a moment.',
          'It has been this way as long as I can remember. I have never had a strong experience of this.',
          'It worsens and improves. There are periods when it is better and periods when it is much worse.',
          'It changed after my body changed — pregnancy, delivery, a surgery, or a health episode.',
        ],
      },
      hi: {
        text: 'यह कब से हो रहा है? और क्या कोई समय है जब कुछ बदला, या यह एक धीमा बदलाव रहा जिसे आपने तब तक मुश्किल से देखा जब तक वह पहले से मौजूद न हो गया?',
        options: [
          'यह काफ़ी अचानक बदला, कुछ होने के बाद — एक घटना, एक नुकसान, मेरे रिश्ते में बदलाव।',
          'यह धीरे-धीरे हुआ। महीनों या सालों में फीका पड़ा। मैं किसी एक पल की ओर इशारा नहीं कर सकता।',
          'जब से याद है तब से ऐसा ही है। मेरा इसका कभी कोई मज़बूत अनुभव रहा ही नहीं।',
          'यह बिगड़ता और सुधरता है। कुछ दौर बेहतर होते हैं और कुछ कहीं ज़्यादा बुरे।',
          'यह मेरे शरीर के बदलने के बाद बदला — गर्भावस्था, प्रसव, सर्जरी, या कोई स्वास्थ्य घटना।',
        ],
      },
    },
    // QSX-3 — Energy and vitality (vital force level)
    {
      multiSelect: false,
      en: {
        text: 'Separate from this concern, how is your general energy right now? Not exercise capacity, but the energy that is just there when you wake — the energy that makes you feel alive and part of things.',
        options: [
          'It is genuinely good. I feel present and engaged in life; this one area is the problem.',
          'It is moderate. I am functional but the aliveness is reduced. I do things but do not feel them fully.',
          'It is low. I get through the day but the feeling that life is worth full engagement is dimmed.',
          'It is very low. I am exhausted by small things. Life feels heavy to carry.',
          'It fluctuates significantly — some days good, some days I cannot find it at all.',
        ],
      },
      hi: {
        text: 'इस चिंता से अलग, अभी आपकी सामान्य ऊर्जा कैसी है? व्यायाम की क्षमता नहीं, बल्कि वह ऊर्जा जो जागते ही मौजूद होती है — जो आपको जीवंत और चीज़ों का हिस्सा महसूस कराती है।',
        options: [
          'यह सच में अच्छी है। मैं ज़िंदगी में मौजूद और जुड़ा महसूस करता हूँ; बस यही एक क्षेत्र समस्या है।',
          'यह मध्यम है। मैं काम कर लेता हूँ पर जीवंतता कम है। मैं चीज़ें करता हूँ पर पूरी तरह महसूस नहीं करता।',
          'यह कम है। मैं दिन काट लेता हूँ पर यह एहसास कि जीवन पूरे जुड़ाव लायक है, मद्धम पड़ गया है।',
          'यह बहुत कम है। छोटी चीज़ें मुझे थका देती हैं। जीवन ढोने में भारी लगता है।',
          'यह काफ़ी बदलती रहती है — कुछ दिन अच्छी, कुछ दिन मुझे बिलकुल नहीं मिलती।',
        ],
      },
    },
    // QSX-4 — Emotional layer (intimacy and the inner world)
    {
      multiSelect: false,
      en: {
        text: 'I want to ask something more personal now, and gently — because what is happening here is rarely only about the body. When you think about intimacy, not the mechanics but the emotional experience of it, what feeling is most present for you right now?',
        options: [
          'A distance. Like I am behind glass. The willingness is not there even when I think it should be.',
          'A fear. An anxiety that something will go wrong, that I will not be enough or not be wanted.',
          'A tiredness. Not in my body, but in the emotional effort intimacy requires. I do not have it.',
          'A wound. Something that happened that has made closeness feel unsafe or complicated.',
          'An absence of feeling. Not fear, not distance, just nothing where something should be.',
          'I will describe it.',
        ],
      },
      hi: {
        text: 'अब मैं कुछ ज़्यादा निजी, और कोमलता से पूछना चाहता हूँ — क्योंकि यहाँ जो हो रहा है वह कभी-कभार ही सिर्फ़ शरीर के बारे में होता है। जब आप निकटता के बारे में सोचते हैं, यांत्रिकता नहीं बल्कि उसका भावनात्मक अनुभव, तो अभी आपके लिए सबसे ज़्यादा कौन सी भावना मौजूद है?',
        options: [
          'एक दूरी। जैसे मैं काँच के पीछे हूँ। चाहत नहीं होती, भले मुझे लगे होनी चाहिए।',
          'एक डर। एक चिंता कि कुछ गलत होगा, कि मैं काफ़ी नहीं रहूँगा या चाहा नहीं जाऊँगा।',
          'एक थकान। मेरे शरीर में नहीं, बल्कि उस भावनात्मक मेहनत में जो निकटता माँगती है। वह मुझमें नहीं है।',
          'एक घाव। कुछ जो हुआ जिसने निकटता को असुरक्षित या उलझा हुआ बना दिया।',
          'भावना की अनुपस्थिति। डर नहीं, दूरी नहीं, बस वहाँ कुछ नहीं जहाँ कुछ होना चाहिए।',
          'मैं इसे बताऊँगा।',
        ],
      },
    },
    // QSX-M-A1 — Male, Low Desire branch (QSX-1 = A)
    {
      multiSelect: false,
      en: {
        text: 'Is there a pattern to when this is weakest, or are there times it lifts, even briefly?',
        options: [
          'Worse with stress or mental load. Better when I am genuinely relaxed or on holiday.',
          'Worse in the morning, and by evening sometimes a little better, or the reverse.',
          'Tied to a substance — alcohol, a medication, tobacco. I notice a real link.',
          'No pattern. It is simply, consistently, not there.',
          'I will describe the pattern myself.',
        ],
      },
      hi: {
        text: 'क्या इसका कोई पैटर्न है कि यह कब सबसे कमज़ोर होता है, या कोई समय जब यह थोड़ा उठता है, पल भर को भी?',
        options: [
          'तनाव या मानसिक बोझ के साथ बदतर। जब मैं सच में आराम में या छुट्टी पर होता हूँ तब बेहतर।',
          'सुबह बदतर, और शाम तक कभी थोड़ा बेहतर, या इसका उल्टा।',
          'किसी पदार्थ से जुड़ा — शराब, कोई दवा, तंबाकू। मुझे एक सच्चा संबंध दिखता है।',
          'कोई पैटर्न नहीं। यह बस लगातार, मौजूद ही नहीं रहता।',
          'मैं पैटर्न खुद बताऊँगा।',
        ],
      },
    },
    // QSX-M-A2 — Male Low Desire (body response)
    {
      multiSelect: false,
      en: {
        text: 'When you are with your partner, or even imagining intimacy, what does your body actually do, separate from what your mind wants?',
        options: [
          'Nothing. No physical response at all, even when I want there to be.',
          'Something stirs faintly, then fades before anything can happen.',
          'My body responds to touch or warmth, but not in a sexual way anymore.',
          'I genuinely do not know. I have stopped paying attention to my body in this context.',
          'I will describe it myself.',
        ],
      },
      hi: {
        text: 'जब आप अपने साथी के साथ होते हैं, या निकटता की कल्पना भी करते हैं, तो आपका शरीर असल में क्या करता है, उससे अलग जो आपका मन चाहता है?',
        options: [
          'कुछ नहीं। कोई शारीरिक प्रतिक्रिया ही नहीं, भले मैं चाहूँ कि हो।',
          'कुछ हल्का-सा जागता है, फिर कुछ होने से पहले फीका पड़ जाता है।',
          'मेरा शरीर स्पर्श या गर्माहट पर प्रतिक्रिया करता है, पर अब यौन रूप में नहीं।',
          'मुझे सच में नहीं पता। मैंने इस संदर्भ में अपने शरीर पर ध्यान देना बंद कर दिया।',
          'मैं इसे खुद बताऊँगा।',
        ],
      },
    },
    // QSX-M-A3 — Male Low Desire (what else is present)
    {
      multiSelect: false,
      en: {
        text: 'What else is present alongside this absence, even if it feels unrelated to sex at all?',
        options: [
          'A heaviness or sadness that sits underneath most things right now, not only this.',
          'Physical exhaustion — weakness in the lower back, legs, or a generally drained feeling.',
          'A coldness — physically, emotionally, or both. Things that used to warm me no longer do.',
          'Guilt, or a sense that I have used myself up through past habits, choices, or excess.',
          'Nothing else. This sits on its own, separate from the rest of my life.',
          'I will describe it myself.',
        ],
      },
      hi: {
        text: 'इस अनुपस्थिति के साथ और क्या मौजूद है, भले वह यौन से बिलकुल असंबंधित लगे?',
        options: [
          'एक भारीपन या उदासी जो अभी ज़्यादातर चीज़ों के नीचे बैठी है, सिर्फ़ यह नहीं।',
          'शारीरिक थकान — कमर के निचले हिस्से, पैरों में कमज़ोरी, या आम तौर पर निचुड़ा हुआ एहसास।',
          'एक ठंडापन — शारीरिक, भावनात्मक, या दोनों। जो चीज़ें पहले गर्माती थीं अब नहीं करतीं।',
          'अपराधबोध, या यह एहसास कि मैंने पुरानी आदतों, चुनावों या अति से खुद को चुका दिया।',
          'और कुछ नहीं। यह अपने-आप में है, बाकी ज़िंदगी से अलग।',
          'मैं इसे खुद बताऊँगा।',
        ],
      },
    },
    // QSX-M-A4 — Male Low Desire (when it lifts)
    {
      multiSelect: false,
      en: {
        text: 'On the rare occasion this lifts, even slightly, what is usually different that day?',
        options: [
          'I have rested properly, or slept well, for once.',
          'Something emotional shifted — a good conversation, a moment of real closeness.',
          'I had a drink or used something that loosened me up, and that tells me something.',
          'Nothing identifiable. It comes and goes on its own.',
          'It has not lifted at all, not even briefly.',
        ],
      },
      hi: {
        text: 'जिन कुछ मौकों पर यह उठता है, पल भर को भी, उस दिन आमतौर पर क्या अलग होता है?',
        options: [
          'मैंने ठीक से आराम किया, या एक बार अच्छी नींद ली।',
          'कुछ भावनात्मक बदला — एक अच्छी बातचीत, सच्ची निकटता का एक पल।',
          'मैंने पी या कुछ लिया जिसने मुझे ढीला किया, और यह मुझे कुछ बताता है।',
          'कुछ पहचानने लायक नहीं। यह अपने-आप आता-जाता है।',
          'यह उठा ही नहीं, पल भर को भी नहीं।',
        ],
      },
    },
    // QSX-M-B1 — Male, Desire/Response disconnect branch (QSX-1 = B)
    {
      multiSelect: false,
      en: {
        text: 'Does this happen every time, or does it depend on something — the situation, the person, how the moment started?',
        options: [
          'Every time, regardless of circumstance.',
          'Mostly with a partner, but not when I am alone, or the reverse.',
          'Depends heavily on how anxious or self-conscious I am in the moment.',
          'It starts fine and then fades partway through.',
          'I will describe the pattern myself.',
        ],
      },
      hi: {
        text: 'क्या यह हर बार होता है, या यह किसी चीज़ पर निर्भर है — स्थिति, व्यक्ति, पल की शुरुआत कैसे हुई?',
        options: [
          'हर बार, परिस्थिति चाहे जो हो।',
          'ज़्यादातर साथी के साथ, पर अकेले में नहीं, या इसका उल्टा।',
          'काफ़ी इस पर निर्भर कि उस पल मैं कितना चिंतित या आत्म-सचेत हूँ।',
          'शुरुआत ठीक होती है और फिर बीच में फीका पड़ जाता है।',
          'मैं पैटर्न खुद बताऊँगा।',
        ],
      },
    },
    // QSX-M-B2 — Male disconnect (where it happens)
    {
      multiSelect: false,
      en: {
        text: 'Where, specifically, does the disconnect happen? This tells me a great deal.',
        options: [
          'The desire is there, even strong, but my body simply does not respond at all.',
          'My body responds at first, then loses it before anything can be completed.',
          'Everything works, but it is over far sooner than I want; there is no control over timing.',
          'My body responds, but there is pain or discomfort involved.',
          'I will describe it myself.',
        ],
      },
      hi: {
        text: 'यह अलगाव खास तौर पर कहाँ होता है? यह मुझे बहुत कुछ बताता है।',
        options: [
          'इच्छा है, मज़बूत भी, पर मेरा शरीर बिलकुल प्रतिक्रिया ही नहीं करता।',
          'मेरा शरीर पहले प्रतिक्रिया करता है, फिर कुछ पूरा होने से पहले खो देता है।',
          'सब काम करता है, पर जितना चाहता हूँ उससे कहीं जल्दी खत्म हो जाता है; समय पर कोई नियंत्रण नहीं।',
          'मेरा शरीर प्रतिक्रिया करता है, पर इसमें दर्द या तकलीफ़ शामिल होती है।',
          'मैं इसे खुद बताऊँगा।',
        ],
      },
    },
    // QSX-M-B3 — Male disconnect (loudest thought)
    {
      multiSelect: false,
      en: {
        text: 'In the moment just before it happens, the moment you feel it slipping, what is the loudest thought in your head?',
        options: [
          'I am going to fail at this again. A fear of repeating what happened before.',
          'Nothing — my mind goes blank, which is its own kind of problem.',
          'Something about my partner — whether they are judging me or losing interest.',
          'Something completely unrelated — work, stress, a thought that has no business being there.',
          'I will describe it myself.',
        ],
      },
      hi: {
        text: 'जिस पल यह होने ही वाला होता है, जब आप इसे फिसलता महसूस करते हैं, आपके दिमाग में सबसे तेज़ विचार क्या होता है?',
        options: [
          'मैं इसमें फिर असफल होने वाला हूँ। पहले जो हुआ उसके दोहराने का डर।',
          'कुछ नहीं — मेरा दिमाग खाली हो जाता है, जो अपने आप में एक समस्या है।',
          'मेरे साथी के बारे में कुछ — कि वे मुझे आँक रहे हैं या रुचि खो रहे हैं।',
          'कुछ बिलकुल असंबंधित — काम, तनाव, एक विचार जिसका वहाँ होना नहीं चाहिए।',
          'मैं इसे खुद बताऊँगा।',
        ],
      },
    },
    // QSX-M-B4 — Male disconnect (afterward)
    {
      multiSelect: false,
      en: {
        text: 'Afterward, whatever afterward looks like for you, what is the feeling that stays longest?',
        options: [
          'Shame. I withdraw a little, even from myself.',
          'Frustration directed at my own body, like it has betrayed me.',
          'Anxiety about the next time, before there even is a next time.',
          'How my partner reacts matters more to me than my own feeling right now; I read their face closely.',
          'I will describe it myself.',
        ],
      },
      hi: {
        text: 'बाद में, आपके लिए बाद का जो भी रूप हो, सबसे देर तक कौन सी भावना रहती है?',
        options: [
          'शर्म। मैं थोड़ा सिमट जाता हूँ, खुद से भी।',
          'अपने ही शरीर पर झुँझलाहट, जैसे उसने मुझे धोखा दिया।',
          'अगली बार की चिंता, अगली बार के होने से भी पहले।',
          'अभी मेरे साथी की प्रतिक्रिया मुझे अपनी भावना से ज़्यादा मायने रखती है; मैं उनका चेहरा गौर से पढ़ता हूँ।',
          'मैं इसे खुद बताऊँगा।',
        ],
      },
    },
    // QSX-M-E1 — Male, Emotional / Wound layer (additive, QSX-4 = B or D)
    {
      multiSelect: false,
      en: {
        text: 'You do not need to tell me the story unless you want to. I only need to know its shape. Is this closer to —',
        options: [
          'Something that happened to me — an experience I did not choose, that changed how I feel about closeness.',
          'Something that happened between us — a betrayal, a rejection, a moment I cannot un-feel.',
          'A fear that has always been there, with no single event behind it.',
          'A comparison — to a past partner, a past version of myself, an expectation I feel I am failing.',
          'I would rather not name its shape right now, and that is alright.',
        ],
      },
      hi: {
        text: 'आपको कहानी बताने की ज़रूरत नहीं जब तक आप न चाहें। मुझे बस उसका आकार जानना है। यह किसके करीब है —',
        options: [
          'कुछ जो मेरे साथ हुआ — एक अनुभव जो मैंने नहीं चुना, जिसने निकटता को लेकर मेरी भावना बदल दी।',
          'कुछ जो हमारे बीच हुआ — एक विश्वासघात, एक अस्वीकार, एक पल जिसे मैं अन-महसूस नहीं कर सकता।',
          'एक डर जो हमेशा रहा है, जिसके पीछे कोई एक घटना नहीं।',
          'एक तुलना — किसी पुराने साथी से, अपने पुराने रूप से, एक उम्मीद से जिसमें मुझे लगता है मैं नाकाम हो रहा हूँ।',
          'मैं अभी इसका आकार नाम देना नहीं चाहूँगा, और यह ठीक है।',
        ],
      },
    },
    // QSX-M-E2 — Male, Emotional / Wound layer (spread)
    {
      multiSelect: false,
      en: {
        text: 'Right now, does this fear or wound show up only in intimate moments, or has it started showing up elsewhere too?',
        options: [
          'Only there. The rest of my life feels unaffected.',
          'It has started to spread — to confidence generally, to how I see myself.',
          'It affects how close I let anyone get, not only physically.',
          'I will describe it myself.',
        ],
      },
      hi: {
        text: 'अभी, क्या यह डर या घाव सिर्फ़ निकटता के पलों में दिखता है, या यह कहीं और भी दिखने लगा है?',
        options: [
          'सिर्फ़ वहीं। मेरी बाकी ज़िंदगी अप्रभावित लगती है।',
          'यह फैलने लगा है — आम तौर पर आत्मविश्वास तक, मैं खुद को कैसे देखता हूँ उस तक।',
          'यह असर डालता है कि मैं किसी को कितना करीब आने देता हूँ, सिर्फ़ शारीरिक रूप से नहीं।',
          'मैं इसे खुद बताऊँगा।',
        ],
      },
    },
    // QSX-F-A1 — Female, Low Desire branch (QSX-1 = A)
    {
      multiSelect: false,
      en: {
        text: 'Is there a pattern to when this is weakest — tied to your cycle, your energy, or something else entirely?',
        options: [
          'Tied to my cycle — noticeably worse at a specific phase each month.',
          'Worse with stress or mental load, regardless of timing in my cycle.',
          'Changed after a specific event in my body — childbirth, a surgery, starting or stopping a medication.',
          'No pattern. It is simply, consistently, not there.',
          'I will describe the pattern myself.',
        ],
      },
      hi: {
        text: 'क्या इसका कोई पैटर्न है कि यह कब सबसे कमज़ोर होता है — आपके चक्र से जुड़ा, आपकी ऊर्जा से, या कुछ बिलकुल और?',
        options: [
          'मेरे चक्र से जुड़ा — हर महीने एक खास चरण में साफ़ तौर पर बदतर।',
          'तनाव या मानसिक बोझ के साथ बदतर, चक्र के समय की परवाह किए बिना।',
          'मेरे शरीर में किसी खास घटना के बाद बदला — प्रसव, सर्जरी, कोई दवा शुरू या बंद करना।',
          'कोई पैटर्न नहीं। यह बस लगातार, मौजूद ही नहीं रहता।',
          'मैं पैटर्न खुद बताऊँगी।',
        ],
      },
    },
    // QSX-F-A2 — Female Low Desire (body when closeness offered)
    {
      multiSelect: false,
      en: {
        text: 'When closeness is offered, even just affection and not necessarily sex, what does your body do?',
        options: [
          'I want the affection but feel nothing sexual in response to it.',
          'I find myself pulling back physically, almost before I decide to.',
          'My body feels unfamiliar in this context — dry, indifferent, far away from itself.',
          'I genuinely do not know. I have stopped paying attention to my body in this context.',
          'I will describe it myself.',
        ],
      },
      hi: {
        text: 'जब निकटता दी जाती है, सिर्फ़ स्नेह भी और ज़रूरी नहीं कि सेक्स, तो आपका शरीर क्या करता है?',
        options: [
          'मुझे स्नेह चाहिए पर उसके जवाब में कुछ यौन महसूस नहीं होता।',
          'मैं खुद को शारीरिक रूप से पीछे खींचती पाती हूँ, लगभग तय करने से पहले ही।',
          'इस संदर्भ में मेरा शरीर अनजाना लगता है — सूखा, उदासीन, खुद से दूर।',
          'मुझे सच में नहीं पता। मैंने इस संदर्भ में अपने शरीर पर ध्यान देना बंद कर दिया।',
          'मैं इसे खुद बताऊँगी।',
        ],
      },
    },
    // QSX-F-A3 — Female Low Desire (what else is present)
    {
      multiSelect: false,
      en: {
        text: 'What else is present alongside this absence, even if it feels unrelated to intimacy at all?',
        options: [
          'A heaviness or low mood that sits underneath most things right now, not only this.',
          'Physical exhaustion — a dragging, drained feeling, especially by the end of the day.',
          'Irritability that surfaces easily, especially with the person closest to me.',
          'A guardedness — something in me that does not want to be that open with anyone right now.',
          'Nothing else. This sits on its own, separate from the rest of my life.',
          'I will describe it myself.',
        ],
      },
      hi: {
        text: 'इस अनुपस्थिति के साथ और क्या मौजूद है, भले वह निकटता से बिलकुल असंबंधित लगे?',
        options: [
          'एक भारीपन या उदास मन जो अभी ज़्यादातर चीज़ों के नीचे बैठा है, सिर्फ़ यह नहीं।',
          'शारीरिक थकान — एक घिसटता, निचुड़ा हुआ एहसास, खासकर दिन के अंत तक।',
          'चिड़चिड़ाहट जो आसानी से उभर आती है, खासकर मेरे सबसे करीबी व्यक्ति के साथ।',
          'एक सतर्कता — मुझमें कुछ जो अभी किसी के साथ इतना खुला नहीं होना चाहता।',
          'और कुछ नहीं। यह अपने-आप में है, बाकी ज़िंदगी से अलग।',
          'मैं इसे खुद बताऊँगी।',
        ],
      },
    },
    // QSX-F-A4 — Female Low Desire (when it lifts)
    {
      multiSelect: false,
      en: {
        text: 'On the rare occasion this lifts, even slightly, what is usually different that day?',
        options: [
          'I have rested properly, or had real time to myself, for once.',
          'Something emotional shifted — feeling truly heard, or real closeness without pressure.',
          'My body simply felt lighter that day — less burdened, more like itself.',
          'Nothing identifiable. It comes and goes on its own.',
          'It has not lifted at all, not even briefly.',
        ],
      },
      hi: {
        text: 'जिन कुछ मौकों पर यह उठता है, पल भर को भी, उस दिन आमतौर पर क्या अलग होता है?',
        options: [
          'मैंने ठीक से आराम किया, या एक बार अपने लिए सच्चा समय निकाला।',
          'कुछ भावनात्मक बदला — सच में सुना जाना, या बिना दबाव के सच्ची निकटता।',
          'उस दिन मेरा शरीर बस हल्का लगा — कम बोझिल, ज़्यादा अपने जैसा।',
          'कुछ पहचानने लायक नहीं। यह अपने-आप आता-जाता है।',
          'यह उठा ही नहीं, पल भर को भी नहीं।',
        ],
      },
    },
    // QSX-F-B1 — Female, Pain / Physical difficulty branch (QSX-1 = B)
    {
      multiSelect: false,
      en: {
        text: 'Does this happen every time, or does it depend on something — timing in your cycle, how relaxed you feel, or the situation itself?',
        options: [
          'Every time, regardless of circumstance.',
          'Worse at certain points in my cycle, predictably.',
          'Depends heavily on how safe or relaxed I feel in the moment.',
          'Better with time and patience, worse if rushed or if there is tension.',
          'I will describe the pattern myself.',
        ],
      },
      hi: {
        text: 'क्या यह हर बार होता है, या किसी चीज़ पर निर्भर है — चक्र का समय, आप कितनी सहज महसूस करती हैं, या स्थिति खुद?',
        options: [
          'हर बार, परिस्थिति चाहे जो हो।',
          'मेरे चक्र के कुछ बिंदुओं पर बदतर, अनुमान के मुताबिक।',
          'काफ़ी इस पर निर्भर कि उस पल मैं कितनी सुरक्षित या सहज महसूस करती हूँ।',
          'समय और धैर्य के साथ बेहतर, जल्दबाज़ी या तनाव हो तो बदतर।',
          'मैं पैटर्न खुद बताऊँगी।',
        ],
      },
    },
    // QSX-F-B2 — Female Pain (where the difficulty shows up)
    {
      multiSelect: false,
      en: {
        text: 'Where, specifically, does the difficulty show up? This tells me a great deal.',
        options: [
          'Dryness or a lack of physical readiness, even when I feel emotionally willing.',
          'An involuntary tightening that makes things physically difficult or impossible.',
          'Sharp or burning pain at a specific point of contact.',
          'A general soreness or sensitivity that lingers afterward, into the next day.',
          'I will describe it myself.',
        ],
      },
      hi: {
        text: 'कठिनाई खास तौर पर कहाँ दिखती है? यह मुझे बहुत कुछ बताता है।',
        options: [
          'सूखापन या शारीरिक तैयारी की कमी, भले मैं भावनात्मक रूप से तैयार महसूस करूँ।',
          'एक अनैच्छिक कसाव जो चीज़ों को शारीरिक रूप से कठिन या असंभव बना देता है।',
          'संपर्क के किसी खास बिंदु पर तीखा या जलनभरा दर्द।',
          'एक आम पीड़ा या संवेदनशीलता जो बाद में, अगले दिन तक बनी रहती है।',
          'मैं इसे खुद बताऊँगी।',
        ],
      },
    },
    // QSX-F-B3 — Female Pain (loudest thing in mind)
    {
      multiSelect: false,
      en: {
        text: 'In the moment just before, when you feel your body tense or pull away, what is the loudest thing in your mind?',
        options: [
          'This is going to hurt. A bracing, based on what has happened before.',
          'Nothing clear — my body reacts before my mind has caught up.',
          'Something about being fully seen or exposed in a way that feels difficult right now.',
          'Something unrelated — worry, distraction, a thought that has no business being there.',
          'I will describe it myself.',
        ],
      },
      hi: {
        text: 'जिस पल से ठीक पहले, जब आप अपने शरीर को तना या पीछे हटता महसूस करती हैं, आपके मन में सबसे तेज़ क्या होता है?',
        options: [
          'यह दर्द देगा। पहले जो हुआ उसके आधार पर एक तैयारी।',
          'कुछ साफ़ नहीं — मेरा शरीर मेरे मन के समझने से पहले प्रतिक्रिया कर देता है।',
          'पूरी तरह देखे या उघड़े जाने को लेकर कुछ, जो अभी कठिन लगता है।',
          'कुछ असंबंधित — चिंता, ध्यान भटकना, एक विचार जिसका वहाँ होना नहीं चाहिए।',
          'मैं इसे खुद बताऊँगी।',
        ],
      },
    },
    // QSX-F-B4 — Female Pain (afterward)
    {
      multiSelect: false,
      en: {
        text: 'Afterward, what is the feeling that stays longest?',
        options: [
          'Relief that it is over, more than anything else.',
          'Guilt toward my partner, for what I could not give or fully enjoy.',
          'Soreness or physical discomfort that lasts into the next day.',
          'A quiet wish to be asked less, or not at all, for a while.',
          'I will describe it myself.',
        ],
      },
      hi: {
        text: 'बाद में, सबसे देर तक कौन सी भावना रहती है?',
        options: [
          'राहत कि यह खत्म हुआ, बाकी सब से ज़्यादा।',
          'अपने साथी के प्रति अपराधबोध, उसके लिए जो मैं दे या पूरी तरह भोग न सकी।',
          'पीड़ा या शारीरिक तकलीफ़ जो अगले दिन तक रहती है।',
          'एक चुपचाप इच्छा कि कुछ समय कम पूछा जाए, या बिलकुल न।',
          'मैं इसे खुद बताऊँगी।',
        ],
      },
    },
    // QSX-F-E1 — Female, Emotional / Wound layer (additive, QSX-4 = B or D)
    {
      multiSelect: false,
      en: {
        text: 'You do not need to tell me the story unless you want to. I only need to know its shape. Is this closer to —',
        options: [
          'Something that happened to me — an experience I did not choose, that changed how I feel about closeness.',
          'Something that happened between us — a betrayal, a rejection, a moment I cannot un-feel.',
          'A fear that has always been there, with no single event behind it.',
          'A comparison — to a past partner, a past version of myself, an expectation I feel I am failing.',
          'I would rather not name its shape right now, and that is alright.',
        ],
      },
      hi: {
        text: 'आपको कहानी बताने की ज़रूरत नहीं जब तक आप न चाहें। मुझे बस उसका आकार जानना है। यह किसके करीब है —',
        options: [
          'कुछ जो मेरे साथ हुआ — एक अनुभव जो मैंने नहीं चुना, जिसने निकटता को लेकर मेरी भावना बदल दी।',
          'कुछ जो हमारे बीच हुआ — एक विश्वासघात, एक अस्वीकार, एक पल जिसे मैं अन-महसूस नहीं कर सकती।',
          'एक डर जो हमेशा रहा है, जिसके पीछे कोई एक घटना नहीं।',
          'एक तुलना — किसी पुराने साथी से, अपने पुराने रूप से, एक उम्मीद से जिसमें मुझे लगता है मैं नाकाम हो रही हूँ।',
          'मैं अभी इसका आकार नाम देना नहीं चाहूँगी, और यह ठीक है।',
        ],
      },
    },
    // QSX-F-E2 — Female, Emotional / Wound layer (spread)
    {
      multiSelect: false,
      en: {
        text: 'Right now, does this fear or wound show up only in intimate moments, or has it started showing up elsewhere too?',
        options: [
          'Only there. The rest of my life feels unaffected.',
          'It has started to spread — to confidence generally, to how I see myself.',
          'It affects how close I let anyone get, not only physically.',
          'I will describe it myself.',
        ],
      },
      hi: {
        text: 'अभी, क्या यह डर या घाव सिर्फ़ निकटता के पलों में दिखता है, या यह कहीं और भी दिखने लगा है?',
        options: [
          'सिर्फ़ वहीं। मेरी बाकी ज़िंदगी अप्रभावित लगती है।',
          'यह फैलने लगा है — आम तौर पर आत्मविश्वास तक, मैं खुद को कैसे देखती हूँ उस तक।',
          'यह असर डालता है कि मैं किसी को कितना करीब आने देती हूँ, सिर्फ़ शारीरिक रूप से नहीं।',
          'मैं इसे खुद बताऊँगी।',
        ],
      },
    },
    ...CLOSING_BLOCK,
    CONSTITUTIONAL_FINAL,
  ],
};

// ════════════════════════════════════════════════════════════════════════════
// ADAPTIVE BRANCHING
// ════════════════════════════════════════════════════════════════════════════
// The questions above are stored flat. For a given user we only ask the
// trunk/router question(s), the ONE branch chosen by the first answer (plus
// gender for the sexual set), the universal closing block, and the final
// constitutional question. The medicine-confidence (%) conditional skip from
// the client doc is intentionally NOT implemented.
//
// Branch membership is expressed by INDEX into the flat arrays. The assertions
// below lock the expected array shapes so that a reorder fails loudly instead
// of silently mis-routing.

function assertLen(name, arr, n) {
  if (!arr || arr.length !== n) {
    throw new Error(`questions.${name}: expected ${n} entries, got ${arr ? arr.length : 'none'}`);
  }
}
assertLen('mental', questions.mental, 38);
assertLen('addiction', questions.addiction, 21);
assertLen('sex', questions.sex, 28);

const M = questions.mental;
const A = questions.addiction;
const S = questions.sex;

// Each PLAN names the router/trunk questions, the branch groups (arrays of
// question objects), the shared closing block, and the final question.
const PLANS = {
  mental: {
    trunk: [M[0]], // QMH-1 (router)
    branches: {
      sadness: M.slice(1, 9), // QMH-2..9
      anxiety: M.slice(9, 14), // QMH-A1..A5
      anger: [...M.slice(14, 19), M[7]], // QMH-D1..D5 + QMH-8 (shared)
      lonely: [...M.slice(19, 24), M[7]], // QMH-L1..L5 + QMH-8 (shared)
      burnout: [...M.slice(24, 29), M[22]], // QMH-B1..B4 + QMH-L4 (shared)
      identity: M.slice(29, 34), // QMH-I1..I5
      custom: [], // QMH-1 = "describe in my own words" — no fixed branch
    },
    closing: M.slice(34, 37),
    final: M[37], // QMH-10
  },
  addiction: {
    trunk: [A[0]], // QAD-1 (router)
    branches: {
      general: A.slice(1, 8), // Safety & Control + QAD-2..7
      gaming: A.slice(8, 12), // QAD-G1..G4
      porn: A.slice(12, 17), // QAD-M1 + concern/urge/intimacy/weakness
    },
    closing: A.slice(17, 20),
    final: A[20], // QMH-10
  },
  sex: {
    trunk: S.slice(0, 4), // QSX-1..4 (asked to everyone)
    branches: {
      male_lowdesire: S.slice(4, 8), // QSX-M-A1..A4
      male_disconnect: S.slice(8, 12), // QSX-M-B1..B4
      male_emotional: S.slice(12, 14), // QSX-M-E1..E2
      female_lowdesire: S.slice(14, 18), // QSX-F-A1..A4
      female_pain: S.slice(18, 22), // QSX-F-B1..B4
      female_emotional: S.slice(22, 24), // QSX-F-E1..E2
    },
    closing: S.slice(24, 27),
    final: S[27], // QMH-10
  },
};

// Resolve the chosen option index of a router question from the stored answer
// (answers store the localized option text). Checks both languages so it works
// regardless of the session language. Returns -1 if not matched.
function optionIndex(question, answerText) {
  if (answerText == null) return -1;
  for (const l of ['en', 'hi']) {
    const i = question[l].options.indexOf(answerText);
    if (i !== -1) return i;
  }
  return -1;
}

// QMH-1 option index → mental branch key.
function mentalBranch(idx) {
  return (
    ['sadness', 'anxiety', 'sadness', 'anger', 'lonely', 'burnout', 'identity', 'custom'][idx] ||
    'sadness'
  );
}

// QAD-1 option index → addiction branch key.
function addictionBranch(idx) {
  if (idx === 10) return 'gaming'; // "Gaming"
  if (idx === 12 || idx === 14) return 'porn'; // "Pornography" / masturbation-semen worry
  return 'general'; // substances + other behavioural habits
}

// gender + QSX-1 option index → sexual concern branch key (or null if no built
// branch, e.g. cycle / hormonal / fertility / "describe myself"). Any gender
// other than 'female' (male / other / unknown) uses the male set.
function sexConcernBranch(gender, idx) {
  const female = gender === 'female';
  if (idx === 0) return female ? 'female_lowdesire' : 'male_lowdesire';
  if (idx === 1) return female ? 'female_pain' : 'male_disconnect';
  return null;
}

// QSX-4 = fear (idx 1) or wound (idx 3) adds the gender-matched emotional layer.
function sexEmotionalBranch(gender, idx) {
  if (idx === 1 || idx === 3) return gender === 'female' ? 'female_emotional' : 'male_emotional';
  return null;
}

/**
 * Build the ordered list of question OBJECTS for this user given the answers
 * collected so far. The list grows deterministically as routing answers come
 * in: the prefix never changes, so it is safe to recompute every turn and index
 * into it. Routing answers always precede the questions they gate.
 */
function buildPlan(category, gender, answers = []) {
  const cfg = PLANS[category];
  if (!cfg) return null;

  if (category === 'sex') {
    const plan = [...cfg.trunk];
    if (answers.length >= cfg.trunk.length) {
      const concern = sexConcernBranch(gender, optionIndex(cfg.trunk[0], answers[0]));
      if (concern) plan.push(...cfg.branches[concern]);
      const emo = sexEmotionalBranch(gender, optionIndex(cfg.trunk[3], answers[3]));
      if (emo) plan.push(...cfg.branches[emo]);
      plan.push(...cfg.closing, cfg.final);
    }
    return plan;
  }

  // mental / addiction: a single router question gates the branch.
  const plan = [...cfg.trunk];
  if (answers.length >= cfg.trunk.length) {
    const routeFn = category === 'mental' ? mentalBranch : addictionBranch;
    const branch = routeFn(optionIndex(cfg.trunk[0], answers[0]));
    plan.push(...cfg.branches[branch]);
    plan.push(...cfg.closing, cfg.final);
  }
  return plan;
}

/**
 * Localized adaptive plan for a user.
 * @param {string} category - 'addiction' | 'mental' | 'sex'
 * @param {string} [lang='en'] - 'en' | 'hi'
 * @param {string|null} [gender] - 'male' | 'female' | 'other' | null (sexual routing)
 * @param {string[]} [answers] - answers (localized option text) collected so far
 * @returns {Array<{ text: string, options: string[], multiSelect: boolean }>|null}
 */
function getQuestionPlan(category, lang = 'en', gender = null, answers = []) {
  const plan = buildPlan(category, gender, answers);
  if (!plan) return null;
  const l = lang === 'hi' ? 'hi' : 'en';
  return plan.map((q) => ({
    text: (q[l] || q.en).text,
    options: (q[l] || q.en).options,
    multiSelect: q.multiSelect,
  }));
}

/**
 * Return a category's full flat question set localized to the given language.
 * Kept for callers that want every question regardless of branching.
 * @param {string} category - 'addiction' | 'mental' | 'sex'
 * @param {string} [lang='en'] - 'en' | 'hi'
 * @returns {Array<{ text: string, options: string[], multiSelect: boolean }>}
 */
function getQuestions(category, lang = 'en') {
  const set = questions[category];
  if (!set) return null;
  const l = lang === 'hi' ? 'hi' : 'en';
  return set.map((q) => ({
    text: (q[l] || q.en).text,
    options: (q[l] || q.en).options,
    multiSelect: q.multiSelect,
  }));
}

module.exports = { getQuestions, getQuestionPlan };
