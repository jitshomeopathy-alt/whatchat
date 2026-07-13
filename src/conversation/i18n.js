/**
 * Centralised, localized UI strings for the conversation flows.
 *
 * Every user-facing line lives here in both English (en) and Hindi (hi) so
 * that once a user picks their language, the *entire* journey speaks back in
 * that language. The tone is intentionally warm, friendly and personal — like
 * a caring companion, not a form — and uses emojis to feel human. 💚
 *
 * Usage:
 *   const { t } = require('./i18n');
 *   t('askName', lang)
 *   t('askAge', lang, { name })   // values can be functions for interpolation
 */

const STRINGS = {
  // ── Registration ───────────────────────────────────────────────────────────
  askName: {
    en: 'What should I call you? Please share your *full name*. 😊',
    hi: 'मैं आपको किस नाम से बुलाऊँ? कृपया अपना *पूरा नाम* बताइए। 😊',
  },
  invalidName: {
    en: 'Hmm, that doesn’t look quite right. 🤔 Please type your name (at least 2 letters). 🙂',
    hi: 'हम्म, यह नाम कुछ ठीक नहीं लग रहा। 🤔 कृपया अपना नाम लिखिए (कम से कम 2 अक्षर)। 🙂',
  },
  askAge: {
    en: ({ name }) => `So lovely to meet you, *${name}*! 🤝💛\n\nMay I ask your *age*? Just type it as a number. 🎂`,
    hi: ({ name }) => `आपसे मिलकर बहुत अच्छा लगा, *${name}*! 🤝💛\n\nक्या मैं आपकी *उम्र* जान सकता हूँ? बस एक संख्या में लिखिए। 🎂`,
  },
  invalidAge: {
    en: 'Oops! 😅 Please enter a valid age — a number between 1 and 150. 🔢',
    hi: 'अरे! 😅 कृपया सही उम्र लिखिए — 1 से 150 के बीच की संख्या। 🔢',
  },
  askGender: {
    en: 'Thank you. 💙\n\nNow select your gender please 👇',
    hi: 'धन्यवाद। 💙\n\nअब कृपया अपना लिंग चुनिए 👇',
  },
  genderRetry: {
    en: 'No worries! 🙂 Please pick the option that fits you best. 👇',
    hi: 'कोई बात नहीं! 🙂 कृपया वह विकल्प चुनिए जो आप पर सबसे सही बैठता है। 👇',
  },
  askEmail: {
    en: 'Thank you for sharing! 🙏✨\n\nNow, what’s your *email address*? I’ll keep it safe and use it only for your reports. 📧🔒',
    hi: 'बताने के लिए धन्यवाद! 🙏✨\n\nअब, आपका *ईमेल पता* क्या है? मैं इसे सुरक्षित रखूँगा और केवल आपकी रिपोर्ट के लिए उपयोग करूँगा। 📧🔒',
  },
  invalidEmail: {
    en: 'That email doesn’t look complete. 🤔 Please enter a valid email address (e.g. name@example.com). 📧',
    hi: 'यह ईमेल पूरा नहीं लग रहा। 🤔 कृपया एक सही ईमेल पता लिखिए (जैसे name@example.com)। 📧',
  },
  askImage: {
    en: 'Almost there, you’re doing great! ✋📸\n\nCould you send me a clear *photo of both your palms* (both hands open, fingers spread, good lighting)? It lets me read you for a much more personal profile. 🔮\n\n_(If you’d rather not, just type "skip" and we’ll continue.)_',
    hi: 'बस थोड़ा और, आप बहुत अच्छा कर रहे हैं! ✋📸\n\nक्या आप मुझे अपनी *दोनों हथेलियों की एक साफ़ फ़ोटो* भेज सकते हैं (दोनों हाथ खुले, उंगलियाँ फैलाकर, अच्छी रोशनी में)? इससे मैं आपको पढ़कर एक ज़्यादा व्यक्तिगत प्रोफ़ाइल बना पाऊँगा। 🔮\n\n_(अगर आप नहीं चाहते, तो बस "skip" लिखिए और हम आगे बढ़ जाएँगे।)_',
  },
  imageUploading: {
    en: '⏳ Uploading your photo, hold on just a moment... 📤',
    hi: '⏳ आपकी फ़ोटो अपलोड हो रही है, बस एक पल रुकिए... 📤',
  },
  imageReadError: {
    en: 'Hmm, I couldn’t read that image. 😕 Please try sending it again, or type "skip". 🙂',
    hi: 'हम्म, मैं वह फ़ोटो नहीं पढ़ पाया। 😕 कृपया दोबारा भेजिए, या "skip" लिखिए। 🙂',
  },
  imageUploadError: {
    en: ({ msg }) => `Oh no, I couldn’t upload your photo (${msg}). 😟 Please try again, or type "skip" to continue. 🙂`,
    hi: ({ msg }) => `अरे, मैं आपकी फ़ोटो अपलोड नहीं कर पाया (${msg})। 😟 कृपया दोबारा कोशिश कीजिए, या आगे बढ़ने के लिए "skip" लिखिए। 🙂`,
  },
  imageSendPrompt: {
    en: 'Please send a *photo* 📸, or type *"skip"* if you’d like to continue without one. 🙂',
    hi: 'कृपया एक *फ़ोटो* भेजिए 📸, या बिना फ़ोटो के आगे बढ़ने के लिए *"skip"* लिखिए। 🙂',
  },
  askDob: {
    en:
      'Now, we need your birth information 🌟 to conduct a more personalized study of your personality, mental tendencies, and life patterns.\n\n' +
      'Please share your *date of birth* 📅\n' +
      '_Format: DD/MM/YYYY (e.g. 21/05/1990)_',
    hi:
      'अब, आपके व्यक्तित्व, मानसिक प्रवृत्तियों और जीवन के ढर्रों का और अधिक व्यक्तिगत अध्ययन करने के लिए हमें आपकी जन्म जानकारी चाहिए 🌟\n\n' +
      'कृपया अपनी *जन्म तिथि* साझा कीजिए 📅\n' +
      '_प्रारूप: DD/MM/YYYY (जैसे 21/05/1990)_',
  },
  invalidDob: {
    en: 'That date doesn’t look right. 🤔 Please enter your date of birth as *dd-mm-yyyy* (e.g. 21-05-1990). 📅',
    hi: 'यह तारीख़ सही नहीं लग रही। 🤔 कृपया अपनी जन्म तिथि *dd-mm-yyyy* में लिखिए (जैसे 21-05-1990)। 📅',
  },
  askAddress: {
    en: ({ dob }) => `Perfect — *${dob}* it is! 🎂\n\nAnd lastly, which *city* do you call home? 🏡`,
    hi: ({ dob }) => `बढ़िया — *${dob}* नोट कर लिया! 🎂\n\nऔर आख़िर में, आप किस *शहर* को अपना घर कहते हैं? 🏡`,
  },
  invalidAddress: {
    en: 'Please share your city or address so I can complete your profile. 🏡🙂',
    hi: 'कृपया अपना शहर या पता बताइए ताकि मैं आपकी प्रोफ़ाइल पूरी कर सकूँ। 🏡🙂',
  },
  saveError: {
    en: 'Oh dear, something went wrong while saving your profile. 😟 Please try again in a moment. 🙏',
    hi: 'अरे, आपकी प्रोफ़ाइल सहेजते समय कुछ गड़बड़ हो गई। 😟 कृपया थोड़ी देर में दोबारा कोशिश कीजिए। 🙏',
  },
  profileComplete: {
    en: ({ name }) => `🎉 You’re all set, *${name}*! Your profile is complete and I’m so glad to have you here. 💚`,
    hi: ({ name }) => `🎉 सब तैयार है, *${name}*! आपकी प्रोफ़ाइल पूरी हो गई है और आपका यहाँ होना मुझे बहुत अच्छा लगा। 💚`,
  },

  // ── Intro + purpose (shown right after language selection) ────────────────────
  intro: {
    en: '🌿 *Welcome to Astro Vaidhya!* 🌿\n\nI’m your personal wellness companion on WhatsApp. I blend classical homeopathy with astrology & palmistry to understand *who you are* — and then guide you, gently and privately, toward remedies and support that truly fit you.\n\nWe care for three areas of life: 🧠 mental & emotional wellness, 🌱 addiction recovery, and 💗 intimate wellness. Everything stays private, and a real doctor is always within reach when you need one. 💚',
    hi: '🌿 *Astro Vaidhya में आपका स्वागत है!* 🌿\n\nमैं WhatsApp पर आपका निजी वेलनेस साथी हूँ। मैं शास्त्रीय होम्योपैथी को ज्योतिष और हस्तरेखा के साथ जोड़कर समझता हूँ कि *आप कौन हैं* — और फिर धीरे से, निजी तौर पर, आपके लिए सही उपचार और सहारे की ओर आपका मार्गदर्शन करता हूँ।\n\nहम जीवन के तीन क्षेत्रों का ध्यान रखते हैं: 🧠 मानसिक व भावनात्मक कल्याण, 🌱 व्यसन मुक्ति, और 💗 यौन स्वास्थ्य। सब कुछ निजी रहता है, और ज़रूरत पड़ने पर असली डॉक्टर हमेशा उपलब्ध हैं। 💚',
  },
  purposePrompt: {
    en: 'You can start at your convenience.\n\n🌿 *AstroVaidhya*\nwill first understand your condition and then provide further guidance.\n\n👨‍⚕️ *Doctor Consultation*\nChat directly with our team of doctors via personal WhatsApp.',
    hi: 'आप अपनी सुविधा से शुरू कर सकते हैं।\n\n🌿 *AstroVaidhya*\nपहले आपकी स्थिति को समझेगा और फिर आगे का मार्गदर्शन देगा।\n\n👨‍⚕️ *डॉक्टर कंसल्टेशन*\nहमारी डॉक्टरों की टीम से सीधे निजी WhatsApp पर बात करें।',
  },
  purposeExcellent: {
    en: 'Excellent choice — you have done the right thing. 💚',
    hi: 'बहुत बढ़िया चुनाव — आपने बिल्कुल सही किया है। 💚',
  },
  purposeConsult: { en: 'Consult a doctor 👨‍⚕️', hi: 'डॉक्टर से सलाह 👨‍⚕️' },
  purposeExplore: { en: 'Explore Astro Vaidhya 🌿', hi: 'Astro Vaidhya देखें 🌿' },
  purposeRetry: {
    en: 'Please tap *Consult a doctor* 👨‍⚕️ or *Explore Astro Vaidhya* 🌿 to continue. 🙂',
    hi: 'कृपया आगे बढ़ने के लिए *डॉक्टर से सलाह* 👨‍⚕️ या *Astro Vaidhya देखें* 🌿 चुनिए। 🙂',
  },
  consultDirect: {
    en: '👨‍⚕️ *Consult a doctor*\n\nThat’s a caring step for yourself. 💚 Our team will connect you with a qualified homeopathic doctor, and you’ll receive an appointment link very soon.\n\n_(Type *"hi"* anytime if you’d like to explore Astro Vaidhya instead.)_',
    hi: '👨‍⚕️ *डॉक्टर से सलाह*\n\nयह अपने लिए एक अच्छा कदम है। 💚 हमारी टीम आपको एक योग्य होम्योपैथिक डॉक्टर से जोड़ेगी, और जल्द ही आपको अपॉइंटमेंट लिंक मिलेगा।\n\n_(अगर आप इसके बजाय Astro Vaidhya देखना चाहें तो कभी भी *"hi"* लिखिए।)_',
  },

  // ── Birth time ───────────────────────────────────────────────────────────────
  askBirthTime: {
    en: 'And what is your *time of birth*? ⏰ This lets me calculate your precise birth chart — please share it in 24-hour format (e.g. 14:30).\n\n_Don’t know the exact time? No worries — you can give an approximate time. 🙂_',
    hi: 'और आपका *जन्म समय* क्या है? ⏰ इससे मैं आपकी सही जन्म कुंडली बना पाऊँगा — कृपया 24-घंटे के प्रारूप में बताइए (जैसे 14:30)।\n\n_सही समय नहीं पता? कोई बात नहीं — आप अनुमानित समय भी बता सकते हैं। 🙂_',
  },
  invalidBirthTime: {
    en: 'That time doesn’t look right. 🤔 Please share it in 24-hour format like *14:30* — I need this to build your chart accurately. ⏰',
    hi: 'यह समय सही नहीं लग रहा। 🤔 कृपया *14:30* जैसे 24-घंटे प्रारूप में लिखिए — आपकी सटीक कुंडली बनाने के लिए यह ज़रूरी है। ⏰',
  },

  // ── Birth place ──────────────────────────────────────────────────────────────
  askBirthPlace: {
    en: 'And one last thing — which *city/town* were you born in? 📍 (e.g. Indore, Madhya Pradesh). This is needed to calculate your chart accurately.',
    hi: 'और आख़िरी बात — आपका जन्म किस *शहर/कस्बे* में हुआ था? 📍 (जैसे इंदौर, मध्य प्रदेश)। आपकी सटीक कुंडली के लिए यह ज़रूरी है।',
  },
  birthPlaceNotFound: {
    en: 'Hmm, I couldn’t quite place that on the map. 🗺️ Could you try again with the city and state, e.g. *"Indore, Madhya Pradesh"*? 📍',
    hi: 'हम्म, मैं उसे नक़्शे पर ठीक से नहीं ढूँढ पाया। 🗺️ कृपया शहर और राज्य के साथ फिर से बताइए, जैसे *"इंदौर, मध्य प्रदेश"*? 📍',
  },

  // ── Gender button titles ─────────────────────────────────────────────────────
  genderMale: { en: 'Male', hi: 'पुरुष' },
  genderFemale: { en: 'Female', hi: 'महिला' },
  genderOther: { en: 'Other', hi: 'अन्य' },

  // ── Consult: astrology + satisfaction ────────────────────────────────────────
  welcomeBack: {
    en: ({ name }) => `🙏 Welcome back, *${name}*! 💛\n\nLooks like you’ve chatted with us before — no need to register again. We’ll just refresh your details as we go. 🔄`,
    hi: ({ name }) => `🙏 वापस स्वागत है, *${name}*! 💛\n\nलगता है आप पहले हमसे बात कर चुके हैं — दोबारा रजिस्टर करने की ज़रूरत नहीं। हम आगे बढ़ते हुए आपकी जानकारी अपडेट कर देंगे। 🔄`,
  },
  readingPalm: {
    en: ({ name }) => `🔮 Reading your details, *${name}*... take a deep breath, this’ll be just a moment. 🌬️✨`,
    hi: ({ name }) => `🔮 आपकी जानकारी देख रहा हूँ, *${name}*... एक गहरी साँस लीजिए, बस एक पल में। 🌬️✨`,
  },
  readingUnavailable: {
    en: 'I’m so sorry — the reading service is taking a short break. 😔 Please type *"hi"* to try again in a moment. 🙏',
    hi: 'मुझे खेद है — रीडिंग सेवा अभी थोड़ी देर के लिए उपलब्ध नहीं है। 😔 कृपया एक पल में दोबारा कोशिश करने के लिए *"hi"* लिखिए। 🙏',
  },
  yourReading: {
    en: ({ reading }) => `✨ *Your Reading* ✨\n\n${reading}`,
    hi: ({ reading }) => `✨ *आपकी रीडिंग* ✨\n\n${reading}`,
  },
  satisfactionPrompt: {
    en: 'I’d love to know — how did this reading feel to you? 💭 Pick the range that fits best. 👇',
    hi: 'मैं जानना चाहूँगा — यह रीडिंग आपको कैसी लगी? 💭 जो सबसे सही बैठता हो वह चुनिए। 👇',
  },
  satisfactionButton: { en: 'Rate it 💫', hi: 'रेट करें 💫' },
  satisfactionHeader: { en: 'Your satisfaction', hi: 'आपकी संतुष्टि' },
  satisfactionSection: { en: 'Satisfaction %', hi: 'संतुष्टि %' },
  satisfactionRetry: {
    en: 'Please tap one of the options above so we can continue. 🙂👆',
    hi: 'कृपया ऊपर दिए विकल्पों में से एक चुनिए ताकि हम आगे बढ़ सकें। 🙂👆',
  },
  satisfactionLowNote: {
    en: 'Thank you for being honest. 🙏 I’d really like to get this right for you.\n\nIn your own words, what felt off or what were you hoping for? ✍️ Your note helps me understand you better.\n\n_(Or type "skip" to carry on.)_',
    hi: 'ईमानदारी से बताने के लिए धन्यवाद। 🙏 मैं इसे आपके लिए सही करना चाहता हूँ।\n\nअपने शब्दों में बताइए — क्या कमी लगी या आप क्या उम्मीद कर रहे थे? ✍️ आपकी बात मुझे आपको बेहतर समझने में मदद करेगी।\n\n_(या आगे बढ़ने के लिए "skip" लिखिए।)_',
  },
  satisfactionNoteThanks: {
    en: 'Thank you for sharing that — I’ll keep it in mind. 💚',
    hi: 'बताने के लिए धन्यवाद — मैं इसका ध्यान रखूँगा। 💚',
  },

  // ── Consult: category selection ──────────────────────────────────────────────
  categoryPrompt: {
    en: 'Thank you for sharing that with me. 🙏\n\nNow, which area of your life would you like us to focus on together? 💚',
    hi: 'मुझ पर भरोसा करने के लिए धन्यवाद। 🙏\n\nअब, आप अपनी ज़िंदगी के किस हिस्से पर हम साथ मिलकर ध्यान देना चाहेंगे? 💚',
  },
  categoryHeader: { en: 'Choose your area', hi: 'अपना क्षेत्र चुनें' },
  categoryButton: { en: 'Choose 👇', hi: 'चुनें 👇' },
  categorySection: { en: 'Areas', hi: 'क्षेत्र' },
  categoryMental: { en: 'Mental 🧠', hi: 'मानसिक 🧠' },
  categoryAddiction: { en: 'Addiction 🌱', hi: 'व्यसन 🌱' },
  categorySex: { en: 'Sexual health 💗', hi: 'यौन स्वास्थ्य 💗' },
  categoryOther: { en: 'Something else ✍️', hi: 'कुछ और ✍️' },
  categoryRetry: {
    en: 'Please tap *Mental* 🧠, *Addiction* 🌱, *Sexual health* 💗, or *Something else* ✍️ to continue. 🙂',
    hi: 'कृपया आगे बढ़ने के लिए *मानसिक* 🧠, *व्यसन* 🌱, *यौन स्वास्थ्य* 💗, या *कुछ और* ✍️ चुनिए। 🙂',
  },
  askOtherProblem: {
    en: 'Of course — tell me in your own words. ✍️💚\n\nPlease describe what you’re going through or what’s troubling you, in as much detail as you’d like. I’ll read it carefully and prepare something just for you. 🙂',
    hi: 'ज़रूर — अपने शब्दों में बताइए। ✍️💚\n\nकृपया बताइए कि आप किस चीज़ से गुज़र रहे हैं या आपको क्या परेशानी है, जितना चाहें उतने विस्तार से। मैं इसे ध्यान से पढ़ूँगा और सिर्फ़ आपके लिए कुछ तैयार करूँगा। 🙂',
  },
  otherProblemRetry: {
    en: 'Please type a few words describing your concern so I can help. ✍️🙂',
    hi: 'कृपया अपनी परेशानी के बारे में कुछ शब्द लिखिए ताकि मैं मदद कर सकूँ। ✍️🙂',
  },
  otherProblemLabel: { en: 'Your concern', hi: 'आपकी परेशानी' },

  // ── Consult: questionnaire ───────────────────────────────────────────────────
  startQuestionnaire: {
    en: ({ label }) => `✅ Let’s begin the *${label}* journey together — a few gentle questions. Take your time, there are no wrong answers. 💛`,
    hi: ({ label }) => `✅ चलिए साथ मिलकर *${label}* की शुरुआत करते हैं — कुछ सरल सवाल। आराम से जवाब दीजिए, कोई जवाब ग़लत नहीं होता। 💛`,
  },
  questionHeader: {
    en: ({ index }) => `Question ${index}`,
    hi: ({ index }) => `सवाल ${index}`,
  },
  chooseButton: { en: 'Choose 👇', hi: 'चुनें 👇' },
  optionsSection: { en: 'Options', hi: 'विकल्प' },
  multiSelectInstruction: {
    en: '\n\n_Reply with the number(s) — for more than one, separate with commas (e.g. 1,3,5). 🙂_',
    hi: '\n\n_संख्या(एँ) लिखकर जवाब दीजिए — एक से ज़्यादा के लिए कॉमा से अलग कीजिए (जैसे 1,3,5)। 🙂_',
  },
  singleSelectInstruction: {
    en: '\n\n_Reply with the option number. 🙂_',
    hi: '\n\n_विकल्प की संख्या लिखकर जवाब दीजिए। 🙂_',
  },
  multiSelectRetry: {
    en: 'Please reply with the option number(s), separated by commas. 🙂',
    hi: 'कृपया विकल्प की संख्या(एँ) कॉमा से अलग करके लिखिए। 🙂',
  },
  singleSelectRetry: {
    en: 'Please tap an option or reply with the option number. 🙂👆',
    hi: 'कृपया कोई विकल्प चुनिए या विकल्प की संख्या लिखिए। 🙂👆',
  },

  // ── Consult: result + next steps ─────────────────────────────────────────────
  reviewing: {
    en: '✅ Thank you for opening up. 💚 I’m carefully reviewing your answers and preparing something just for you... ⏳',
    hi: '✅ अपनी बात साझा करने के लिए धन्यवाद। 💚 मैं ध्यान से आपके जवाब देख रहा हूँ और सिर्फ़ आपके लिए कुछ तैयार कर रहा हूँ... ⏳',
  },
  reviewUnavailable: {
    en: 'I’m sorry — the review service is taking a short break. 😔 Please type *"hi"* to start again shortly. 🙏',
    hi: 'मुझे खेद है — समीक्षा सेवा अभी थोड़ी देर के लिए उपलब्ध नहीं है। 😔 कृपया थोड़ी देर में फिर से शुरू करने के लिए *"hi"* लिखिए। 🙏',
  },
  resultIntro: {
    en: ({ result }) => `🩺 *Based on everything you shared, here’s what I’ve prepared for you:*\n\n${result}`,
    hi: ({ result }) => `🩺 *आपने जो कुछ बताया, उसके आधार पर मैंने आपके लिए यह तैयार किया है:*\n\n${result}`,
  },
  medicinesList: {
    en: ({ items }) => `\n\n💊 *Recommended remedies:*\n${items}`,
    hi: ({ items }) => `\n\n💊 *सुझाई गई दवाएँ:*\n${items}`,
  },
  // ── Payment (Razorpay) ──────────────────────────────────────────────────────
  paymentPrompt: {
    en: ({ link, amount = '₹399' }) =>
      `💳 *Unlock your personalised plan*\n\n_"You didn't choose a shortcut. You chose understanding."_\n\nTo continue and choose how you'd like to proceed, please complete a one-time payment of *${amount}*.\n\n👉 Pay securely here:\n${link}\n\nOnce your payment is done, it’ll continue automatically — or tap *I’ve paid* below. 💚`,
    hi: ({ link, amount = '₹399' }) =>
      `💳 *अपनी विशेष योजना अनलॉक करें*\n\n_"You didn't choose a shortcut. You chose understanding."_\n\nआगे बढ़ने और अपना विकल्प चुनने के लिए, कृपया *${amount}* का एक बार भुगतान पूरा करें।\n\n👉 यहाँ सुरक्षित भुगतान करें:\n${link}\n\nभुगतान होते ही यह अपने आप आगे बढ़ जाएगा — या नीचे *भुगतान हो गया* पर टैप करें। 💚`,
  },
  paymentPaidButton: { en: 'I’ve paid ✅', hi: 'भुगतान हो गया ✅' },
  paymentHeader: { en: 'Payment', hi: 'भुगतान' },
  paymentNotReceived: {
    en: 'I haven’t received your payment yet. 🙏 Please complete it using the link above, then tap *I’ve paid* again. If you just paid, give it a few seconds. 💚',
    hi: 'मुझे अभी तक आपका भुगतान नहीं मिला है। 🙏 कृपया ऊपर दिए लिंक से भुगतान पूरा करें, फिर दोबारा *भुगतान हो गया* पर टैप करें। यदि आपने अभी भुगतान किया है, तो कुछ सेकंड दीजिए। 💚',
  },
  paymentConfirmed: {
    en: '✅ *Payment received — thank you!* 💚 Here’s your next step:',
    hi: '✅ *भुगतान प्राप्त हुआ — धन्यवाद!* 💚 आपका अगला कदम यह रहा:',
  },
  paymentUnavailable: {
    en: 'I’m so sorry — payment is taking a short break. 😔 Please type *"hi"* to try again in a moment. 🙏',
    hi: 'मुझे खेद है — भुगतान सेवा अभी थोड़ी देर के लिए उपलब्ध नहीं है। 😔 कृपया एक पल में दोबारा कोशिश करने के लिए *"hi"* लिखिए। 🙏',
  },
  nextStepPrompt: {
    en: 'What feels right for you as a next step? I’m here with you. 🤝💚',
    hi: 'आगे के लिए आपको क्या सही लगता है? मैं आपके साथ हूँ। 🤝💚',
  },
  nextStepHeader: { en: 'Next step', hi: 'अगला कदम' },
  nextStepFooter: {
    en: 'Informational only — not a substitute for a doctor. 🩺',
    hi: 'केवल जानकारी के लिए — डॉक्टर का विकल्प नहीं। 🩺',
  },
  actionOrder: { en: 'Order online 🛒', hi: 'ऑनलाइन ऑर्डर 🛒' },
  actionConsult: { en: 'Consult a doctor 👨‍⚕️', hi: 'डॉक्टर से सलाह 👨‍⚕️' },
  orderResponse: {
    en: '🛒 *Order online*\n\nWonderful choice! 💚 Our team will help you order the recommended remedies, and you’ll receive a secure ordering link very soon.\n\n_(Ordering integration coming soon.)_',
    hi: '🛒 *ऑनलाइन ऑर्डर*\n\nबहुत बढ़िया! 💚 हमारी टीम आपको सुझाई गई दवाएँ ऑर्डर करने में मदद करेगी, और जल्द ही आपको एक सुरक्षित ऑर्डर लिंक मिलेगा।\n\n_(ऑर्डर सुविधा जल्द आ रही है।)_',
  },
  consultResponse: {
    en: '👨‍⚕️ *Consult a doctor*\n\nThat’s a caring step for yourself. 💚 We’ll connect you with a qualified doctor, and you’ll receive an appointment link very soon.\n\n_(Consultation booking coming soon.)_',
    hi: '👨‍⚕️ *डॉक्टर से सलाह*\n\nयह अपने लिए एक अच्छा कदम है। 💚 हम आपको एक योग्य डॉक्टर से जोड़ेंगे, और जल्द ही आपको अपॉइंटमेंट लिंक मिलेगा।\n\n_(अपॉइंटमेंट सुविधा जल्द आ रही है।)_',
  },
  actionRetry: {
    en: 'Please tap *Order online* 🛒 or *Consult a doctor* 👨‍⚕️ to continue. 🙂',
    hi: 'कृपया आगे बढ़ने के लिए *ऑनलाइन ऑर्डर* 🛒 या *डॉक्टर से सलाह* 👨‍⚕️ चुनिए। 🙂',
  },
  thankYou: {
    en: 'Thank you for trusting me today. 🙏💚 Type *"hi"* anytime for a fresh reading and a caring chat. Take care of yourself! 🌸',
    hi: 'आज मुझ पर भरोसा करने के लिए धन्यवाद। 🙏💚 नई रीडिंग और बातचीत के लिए कभी भी *"hi"* लिखिए। अपना ख़याल रखिए! 🌸',
  },

  // ── Category labels (used inside questionnaire intro) ────────────────────────
  labelAddiction: { en: 'De-addiction / Substance Recovery', hi: 'व्यसन मुक्ति / नशा रिकवरी' },
  labelMental: { en: 'Mental / Emotional Wellness', hi: 'मानसिक / भावनात्मक कल्याण' },
  labelSex: { en: 'Sexual Health & Wellness', hi: 'यौन स्वास्थ्य और कल्याण' },

  // ── "Are you ready?" gate (after the intro messages) ─────────────────────────
  readyPrompt: {
    en: 'Good treatment doesn’t begin with the right medicine...\nbut with the right understanding. 🌱\n\nTo help you reach this understanding, I’ll ask you a few simple questions.\n\nShall we begin?',
    hi: 'अच्छा इलाज सही दवा से शुरू नहीं होता...\nबल्कि सही समझ से शुरू होता है। 🌱\n\nइस समझ तक पहुँचने में आपकी मदद के लिए, मैं आपसे कुछ आसान सवाल पूछूँगा।\n\nक्या हम शुरू करें?',
  },
  readyYes: { en: 'Yes, I’m ready ✅', hi: 'हाँ, मैं तैयार हूँ ✅' },
  readyNo: { en: 'Not yet', hi: 'अभी नहीं' },
  readyWelcome: {
    en: 'Welcome to AstroVaidhya. 🌿\n\nFirst of all, thank you for trusting us and deciding to come here. 💚\n\nNow, we’ll take the rest of the conversation slowly, step by step.',
    hi: 'AstroVaidhya में आपका स्वागत है। 🌿\n\nसबसे पहले, हम पर भरोसा करने और यहाँ आने का निर्णय लेने के लिए धन्यवाद। 💚\n\nअब, हम बाकी बातचीत धीरे-धीरे, कदम दर कदम आगे बढ़ाएँगे।',
  },
  beforeWeMove: {
    en: 'Before we move on, a small thing. 🌿',
    hi: 'आगे बढ़ने से पहले, एक छोटी सी बात। 🌿',
  },
  notReady: {
    en: 'No rush at all. 🌸 Whenever you feel ready, just type *hi* and we’ll begin together. I’m here for you. 💚',
    hi: 'बिल्कुल जल्दी नहीं है। 🌸 जब भी आप तैयार महसूस करें, बस *hi* लिखिए और हम साथ शुरू करेंगे। मैं आपके लिए यहाँ हूँ। 💚',
  },

  // ── Concern intake ───────────────────────────────────────────────────────────
  takeYourTime: {
    en: 'Now, let’s understand your biggest concern. 💚\n\nFrom the options below, choose the one that is closest to your problem today.\n\nIf none of the options fits perfectly, don’t worry—you’ll be able to describe it in your own words later.',
    hi: 'अब आपकी सबसे बड़ी चिंता को समझते हैं। 💚\n\nनीचे दिए गए विकल्पों में से वह चुनें, जो आज आपकी समस्या के सबसे करीब हो।\n\nअगर कोई विकल्प पूरी तरह मेल न खाए, तो चिंता की बात नहीं—आगे आप अपनी बात अपने शब्दों में भी बता सकेंगे।',
  },
  concernPrompt: {
    en: 'What are you troubled by?',
    hi: 'आप किस बात से परेशान हैं?',
  },
  concernButton: { en: 'Choose 👇', hi: 'चुनें 👇' },
  concernHeader: { en: 'What’s going on?', hi: 'क्या हो रहा है?' },
  concernSection: { en: 'I’m feeling…', hi: 'मैं महसूस कर रहा/रही हूँ…' },
  concernInWords: {
    en: 'Of course — tell me in your own words. ✍️ Please describe what you’re going through, in as much detail as you’d like.',
    hi: 'ज़रूर — अपने शब्दों में बताइए। ✍️ कृपया बताइए कि आप किस दौर से गुज़र रहे हैं, जितना चाहें उतने विस्तार से।',
  },
  concernInWordsRetry: {
    en: 'Please type a few words about what you’re going through so I can understand. ✍️🙂',
    hi: 'कृपया कुछ शब्दों में बताइए कि आप किस दौर से गुज़र रहे हैं, ताकि मैं समझ सकूँ। ✍️🙂',
  },
  concernRetry: {
    en: 'Please tap one of the options, or choose *In my words* ✍️ to type it yourself. 🙂',
    hi: 'कृपया किसी एक विकल्प को चुनिए, या ख़ुद लिखने के लिए *अपने शब्दों में* ✍️ चुनिए। 🙂',
  },
  concernThanks: {
    en: 'Now I want to understand you carefully. 💚\n\nSo write your entire story without hesitation.\n\nHow it all started, what has happened so far, what is your biggest concern, and what you expect from us—tell us all in your own words.',
    hi: 'अब मैं आपको ध्यान से समझना चाहता हूँ। 💚\n\nइसलिए बिना किसी झिझक के अपनी पूरी बात लिखिए।\n\nयह सब कैसे शुरू हुआ, अब तक क्या हुआ, आपकी सबसे बड़ी चिंता क्या है, और आप हमसे क्या उम्मीद रखते हैं—सब कुछ अपने शब्दों में बताइए।',
  },
  realizePrompt: {
    en: 'Rest assured, everything you say will remain completely confidential and will only be used to better assist you. ✍️',
    hi: 'निश्चिंत रहिए, आप जो कुछ भी बताएँगे वह पूरी तरह गोपनीय रहेगा और केवल आपकी बेहतर मदद के लिए ही उपयोग किया जाएगा। ✍️',
  },
  realizeRetry: {
    en: 'Whenever you’re ready, share a little about when you first realised it. ✍️🙂',
    hi: 'जब भी आप तैयार हों, थोड़ा बताइए कि आपको यह पहली बार कब महसूस हुआ। ✍️🙂',
  },
  affectPrompt: {
    en: 'I’d like to understand one more thing. 🌱 Where do you feel the greatest impact of this problem on your life? 💭',
    hi: 'मैं एक और बात समझना चाहता हूँ। 🌱 इस समस्या का सबसे ज़्यादा असर आप अपने जीवन में कहाँ महसूस करते हैं? 💭',
  },
  affectButton: { en: 'Choose 👇', hi: 'चुनें 👇' },
  affectHeader: { en: 'Most affected', hi: 'सबसे ज़्यादा प्रभावित' },
  affectSection: { en: 'It has affected…', hi: 'इसने प्रभावित किया…' },
  affectRetry: {
    en: 'Please tap one of the options above so I can understand you better. 🙂👆',
    hi: 'कृपया ऊपर दिए विकल्पों में से एक चुनिए ताकि मैं आपको बेहतर समझ सकूँ। 🙂👆',
  },
  severityPrompt: {
    en: 'I’d like to understand one last thing. 🧭\nHow much control do you feel over this problem today? Choose the option that best matches your current situation. 💚',
    hi: 'मैं एक आख़िरी बात समझना चाहता हूँ। 🧭\nआज आप इस समस्या पर कितना नियंत्रण महसूस करते हैं? वह विकल्प चुनिए जो आपकी मौजूदा स्थिति से सबसे मेल खाता हो। 💚',
  },
  severityButton: { en: 'Choose 👇', hi: 'चुनें 👇' },
  severityHeader: { en: 'Sense of control', hi: 'नियंत्रण की भावना' },
  severitySection: { en: 'Right now I have…', hi: 'अभी मेरे पास है…' },
  severityRetry: {
    en: 'Please tap one of the options above. 🙂👆',
    hi: 'कृपया ऊपर दिए विकल्पों में से एक चुनिए। 🙂👆',
  },

  // ── Summary + confirm ─────────────────────────────────────────────────────────
  summaryIntro: {
    en: 'Let me make sure I’ve understood you correctly. 💚',
    hi: 'मुझे यह पक्का कर लेने दीजिए कि मैंने आपको सही समझा है। 💚',
  },
  summaryBody: {
    en: ({ name, gender, concern, realize, affect, severity }) =>
      `📝 *Here’s what I heard:*\n\n` +
      `• *Name:* ${name}\n` +
      `• *Gender:* ${gender}\n` +
      `• *What’s going on:* ${concern}\n` +
      `• *When it became real:* ${realize}\n` +
      `• *Most affected:* ${affect}\n` +
      `• *Sense of control:* ${severity}`,
    hi: ({ name, gender, concern, realize, affect, severity }) =>
      `📝 *मैंने यह समझा:*\n\n` +
      `• *नाम:* ${name}\n` +
      `• *लिंग:* ${gender}\n` +
      `• *क्या चल रहा है:* ${concern}\n` +
      `• *कब असली समस्या बनी:* ${realize}\n` +
      `• *सबसे ज़्यादा प्रभावित:* ${affect}\n` +
      `• *नियंत्रण की भावना:* ${severity}`,
  },
  summaryConfirmPrompt: {
    en: 'Did I understand you correctly?',
    hi: 'क्या मैंने आपको सही समझा?',
  },
  summaryYes: { en: 'Yes, that’s right ✅', hi: 'हाँ, सही है ✅' },
  summaryNo: { en: 'Not quite ✏️', hi: 'बिल्कुल नहीं ✏️' },
  summaryRedo: {
    en: 'No problem at all — let’s go through it again so I get it right. 💚',
    hi: 'कोई बात नहीं — चलिए इसे दोबारा देखते हैं ताकि मैं सही समझ सकूँ। 💚',
  },
  summaryClarify: {
    en: 'If I missed something, tell me more in detail. ✍️',
    hi: 'अगर मुझसे कुछ छूट गया हो, तो मुझे विस्तार से और बताइए। ✍️',
  },
  summaryClarifyRetry: {
    en: 'Please share a little more in your own words so I can understand you better. ✍️🙂',
    hi: 'कृपया अपने शब्दों में थोड़ा और बताइए ताकि मैं आपको बेहतर समझ सकूँ। ✍️🙂',
  },
  summaryClarifyThanks: {
    en: 'Thank you for explaining that. 🙏 That really helps me understand you. 💚',
    hi: 'बताने के लिए धन्यवाद। 🙏 इससे मुझे आपको समझने में बहुत मदद मिलती है। 💚',
  },

  // ── Personality read (3–4 points, shown after the summary is confirmed) ───────
  personalityIntro: {
    en: 'From everything you’ve shared, here’s a little of what I sense about *you* 💚:',
    hi: 'आपने जो कुछ बताया, उससे मुझे *आपके* बारे में कुछ ऐसा महसूस होता है 💚:',
  },
  personalityError: {
    en: 'I couldn’t prepare your personality note just now, but that’s okay — let’s keep going. 💚',
    hi: 'मैं अभी आपका व्यक्तित्व नोट तैयार नहीं कर पाया, पर कोई बात नहीं — चलिए आगे बढ़ते हैं। 💚',
  },

  // ── Post-summary story (shown with the mm image, before path selection) ───────
  postSummaryImagine: {
    en: '✨ Imagine...\nIf someone understood not just your illness, but also your personality, your way of thinking, and your life patterns... 🌟💭',
    hi: '✨ ज़रा सोचिए...\nअगर कोई सिर्फ़ आपकी बीमारी को ही नहीं, बल्कि आपके व्यक्तित्व, आपके सोचने के तरीक़े और आपके जीवन के ढर्रे को भी समझे... 🌟💭',
  },
  postSummaryQuestions: {
    en: '📄 Some questions are answered by a medical report.\n🔮 The answers to some questions lie in a person’s personality, habits, and life patterns.',
    hi: '📄 कुछ सवालों के जवाब एक मेडिकल रिपोर्ट देती है।\n🔮 कुछ सवालों के जवाब इंसान के व्यक्तित्व, आदतों और जीवन के ढर्रों में छिपे होते हैं।',
  },
  postSummaryTwoPaths: {
    en:
      '🌿 That’s why at AstroVaidhya, we’ve created two paths:\n\n' +
      '🔮 *Astro.*\n\n' +
      'An attempt to understand the signs that help us gain a deeper understanding of ourselves.\n\n' +
      '🩺 *Vaidhya.*\n\n' +
      'A doctor who understands your current health problem based on science and experience and provides treatment.\n\n' +
      '💚 AstroVaidhya is the confluence of these two ideas.',
    hi:
      '🌿 इसीलिए AstroVaidhya में हमने दो रास्ते बनाए हैं:\n\n' +
      '🔮 *Astro.*\n\n' +
      'उन संकेतों को समझने का एक प्रयास, जो हमें ख़ुद को गहराई से समझने में मदद करते हैं।\n\n' +
      '🩺 *Vaidhya.*\n\n' +
      'एक डॉक्टर जो विज्ञान और अनुभव के आधार पर आपकी मौजूदा स्वास्थ्य समस्या को समझता है और उसका इलाज करता है।\n\n' +
      '💚 AstroVaidhya इन्हीं दो विचारों का संगम है।',
  },

  // ── Astro read (3–4 points, shown after kundli/DOB details) ───────────────────
  astroResultIntro: {
    en: 'Thank you. 🙏 Based on your birth details, here’s a short reading for *you* 🔮:',
    hi: 'धन्यवाद। 🙏 आपके जन्म विवरण के आधार पर, यह रही *आपके* लिए एक छोटी रीडिंग 🔮:',
  },
  astroResultError: {
    en: 'I couldn’t prepare your astro reading just now, but that’s okay — let’s continue. 💚',
    hi: 'मैं अभी आपकी ज्योतिष रीडिंग तैयार नहीं कर पाया, पर कोई बात नहीं — चलिए आगे बढ़ते हैं। 💚',
  },

  // ── Satisfaction check (after the astro reading, before the premium plans) ─────
  satisfactionPrompt: {
    en: 'How satisfied are you with this analysis so far? 🌟\n\nPlease pick the option that feels closest.',
    hi: 'अब तक के इस विश्लेषण से आप कितना संतुष्ट हैं? 🌟\n\nकृपया वह विकल्प चुनिए जो आपको सबसे सही लगे।',
  },
  satisfactionButton: { en: 'Choose 👇', hi: 'चुनें 👇' },
  satisfactionHeader: { en: 'Your satisfaction', hi: 'आपकी संतुष्टि' },
  satisfactionSection: { en: 'I’m satisfied…', hi: 'मैं संतुष्ट हूँ…' },
  satisfactionRetry: {
    en: 'Please tap one of the options above so I know how you feel. 🙂👆',
    hi: 'कृपया ऊपर दिए विकल्पों में से एक चुनिए ताकि मैं समझ सकूँ। 🙂👆',
  },
  satisfactionThanks: {
    en: 'Thank you for sharing that. 🙏💚',
    hi: 'बताने के लिए धन्यवाद। 🙏💚',
  },

  // ── Premium upsell (shown before payment on the astro path) ───────────────────
  premiumTeaser: {
    en: '✨ *Want to go deeper?* ✨\n\nUnlock your\n\n🔮 *AstroVaidhya Premium Analysis* 🌟',
    hi: '✨ *और गहराई में जाना चाहते हैं?* ✨\n\nअनलॉक करें\n\n🔮 *AstroVaidhya प्रीमियम विश्लेषण* 🌟',
  },
  plansIntro: {
    en:
      '*Plan 1 — Discover Yourself (Entry)*\n' +
      '🌱 स्वयं को जानें\n\n' +
      '_"Who am I?"_\n\n' +
      'Perfect for first-time users.\n' +
      '💰 *₹199*\n\n' +
      '━━━━━━━━━━━━━━━\n\n' +
      '*Plan 2 — Understand Your Life (Most Popular)*\n' +
      '🌿 स्वयं को समझें\n\n' +
      '_"Why does my life repeat the same patterns?"_\n\n' +
      '⭐ Most popular choice.\n' +
      '💰 *₹499*\n\n' +
      '━━━━━━━━━━━━━━━\n\n' +
      '*Plan 3 — Transform Yourself (Flagship)*\n' +
      '🌳 स्वयं को बदलें\n\n' +
      '_"Understand. Heal. Transform."_\n\n' +
      '💎 Our deepest, complete analysis.\n' +
      '💰 *₹999*',
    hi:
      '*Plan 1 — Discover Yourself (Entry)*\n' +
      '🌱 स्वयं को जानें\n\n' +
      '_"मैं कौन हूँ?"_\n\n' +
      'पहली बार आने वालों के लिए बिल्कुल सही।\n' +
      '💰 *₹199*\n\n' +
      '━━━━━━━━━━━━━━━\n\n' +
      '*Plan 2 — Understand Your Life (Most Popular)*\n' +
      '🌿 स्वयं को समझें\n\n' +
      '_"मेरी ज़िंदगी में वही ढर्रे बार-बार क्यों दोहराते हैं?"_\n\n' +
      '⭐ सबसे लोकप्रिय विकल्प।\n' +
      '💰 *₹499*\n\n' +
      '━━━━━━━━━━━━━━━\n\n' +
      '*Plan 3 — Transform Yourself (Flagship)*\n' +
      '🌳 स्वयं को बदलें\n\n' +
      '_"समझें। सँवारें। बदलें।"_\n\n' +
      '💎 हमारा सबसे गहरा, संपूर्ण विश्लेषण।\n' +
      '💰 *₹999*',
  },
  plansChoosePrompt: {
    en: 'Which plan feels right for you? 💚',
    hi: 'आपको कौन-सी योजना सही लगती है? 💚',
  },
  plansHeader: { en: 'Choose your plan', hi: 'अपनी योजना चुनें' },
  plansRetry: {
    en: 'Please tap *Plan 1* 🌱, *Plan 2* 🌿 or *Plan 3* 🌳 to continue. 🙂',
    hi: 'कृपया आगे बढ़ने के लिए *Plan 1* 🌱, *Plan 2* 🌿 या *Plan 3* 🌳 चुनिए। 🙂',
  },

  // ── Post-payment medical questions (asked before the expert handoff) ──────────
  medicalIntro: {
    en: '🩺 Before I connect you with our expert, I’d like to ask you a few short medical questions so they can help you better. Please answer honestly — there are no wrong answers. 💚',
    hi: '🩺 आपको हमारे विशेषज्ञ से जोड़ने से पहले, मैं आपसे कुछ छोटे मेडिकल सवाल पूछना चाहूँगा ताकि वे आपकी बेहतर मदद कर सकें। कृपया सच्चाई से उत्तर दें — कोई उत्तर ग़लत नहीं है। 💚',
  },
  medicalQuestion: {
    en: ({ n, text, options }) => `*Question ${n}:*\n${text}${options}`,
    hi: ({ n, text, options }) => `*प्रश्न ${n}:*\n${text}${options}`,
  },
  medicalOptionsHint: {
    en: '\n\n_Reply with the number of your choice._',
    hi: '\n\n_अपनी पसंद का नंबर लिखकर उत्तर दें।_',
  },
  medicalOptionsHintMulti: {
    en: '\n\n_Reply with the number(s) of your choice — separate multiple with commas._',
    hi: '\n\n_अपनी पसंद के नंबर लिखें — एक से अधिक हों तो कॉमा से अलग करें।_',
  },
  medicalRetry: {
    en: 'Please reply with a short answer to continue. 🙂',
    hi: 'आगे बढ़ने के लिए कृपया एक छोटा उत्तर लिखिए। 🙂',
  },
  medicalDone: {
    en: '✅ Thank You for completing your Clinical Assessment.\n\nWe have successfully received all your health details and concerns.\n\nOur expert physician will now carefully review your responses and understand your case in depth — because every person’s health journey is unique.\n\nYou will soon receive a personal communication from our team regarding the next steps.\n\nYour information is safe with us, and your health concern will be approached with complete attention and care. 🩺',
    hi: '✅ Thank You for completing your Clinical Assessment.\n\nWe have successfully received all your health details and concerns.\n\nOur expert physician will now carefully review your responses and understand your case in depth — because every person’s health journey is unique.\n\nYou will soon receive a personal communication from our team regarding the next steps.\n\nYour information is safe with us, and your health concern will be approached with complete attention and care. 🩺',
  },
  clinicalThanks: {
    en: '🙏 Thank you for trusting us with your health journey.',
    hi: '🙏 Thank you for trusting us with your health journey.',
  },

  // ── Path selection (Clinical vs Astro + Clinical) ─────────────────────────────
  pathIntro: {
    en: 'There are two ways we can work towards your cure together. 💚 You can choose whichever feels right for you.',
    hi: 'हम मिलकर आपके इलाज की ओर दो तरीक़ों से बढ़ सकते हैं। 💚 आप जो भी आपको सही लगे, वह चुन सकते हैं।',
  },
  pathThanks: {
    en: 'Thank you for choosing. 🙏 Let’s continue. 💚',
    hi: 'चुनने के लिए धन्यवाद। 🙏 चलिए आगे बढ़ते हैं। 💚',
  },
  pathPrompt: {
    en: 'Thank you for trusting me. 💚 How would you like to continue?',
    hi: 'मुझ पर भरोसा करने के लिए धन्यवाद। 💚 आप कैसे आगे बढ़ना चाहेंगे?',
  },
  pathHeader: { en: 'Choose your path', hi: 'अपना रास्ता चुनें' },
  pathClinical: { en: 'Clinical 🩺', hi: 'क्लिनिकल 🩺' },
  pathAstro: { en: 'Astro + Clinical 🔮', hi: 'ज्योतिष + क्लिनिकल 🔮' },
  pathRetry: {
    en: 'Please tap *Clinical* 🩺 or *Astro + Clinical* 🔮 to continue. 🙂',
    hi: 'कृपया आगे बढ़ने के लिए *क्लिनिकल* 🩺 या *ज्योतिष + क्लिनिकल* 🔮 चुनिए। 🙂',
  },
  clinicalChoice: {
    en: '🩺 Excellent Choice. You have chosen the Clinical Path',
    hi: '🩺 बहुत बढ़िया चुनाव। आपने क्लिनिकल पथ चुना है।',
  },
  clinicalIntro: {
    en: '🩺 In the Clinical Assessment, your case will be looked at beyond just symptoms — your health history, lifestyle, emotional patterns, and individual concerns will be carefully evaluated by a physician.\n\n💚 Because every person is different, your health journey deserves a personalised approach, not a one-size-fits-all solution.\n\n✨ You are now moving towards a deeper understanding of your health.',
    hi: '🩺 In the Clinical Assessment, your case will be looked at beyond just symptoms — your health history, lifestyle, emotional patterns, and individual concerns will be carefully evaluated by a physician.\n\n💚 Because every person is different, your health journey deserves a personalised approach, not a one-size-fits-all solution.\n\n✨ You are now moving towards a deeper understanding of your health.',
  },
  clinicalReceive: {
    en: 'You will receive:\n✅ Detailed case evaluation\n✅ Physician-reviewed analysis\n✅ Personalised health guidance\n✅ A structured approach based on your individual needs\n\n🌟 This is a premium medical consultation designed for people who want clarity, direction, and a deeper understanding of their health.\n\nReady to begin your Clinical Assessment? 🩺',
    hi: 'You will receive:\n✅ Detailed case evaluation\n✅ Physician-reviewed analysis\n✅ Personalised health guidance\n✅ A structured approach based on your individual needs\n\n🌟 This is a premium medical consultation designed for people who want clarity, direction, and a deeper understanding of their health.\n\nReady to begin your Clinical Assessment? 🩺',
  },
  doctorJoined: {
    en: '👨‍⚕️ *Dr. Jitendra Pal has joined the chat.*\n\nYou’re in caring hands now. 💚',
    hi: '👨‍⚕️ *डॉ. जितेन्द्र पाल चैट में शामिल हो गए हैं।*\n\nअब आप अच्छे हाथों में हैं। 💚',
  },
  astroExpertJoined: {
    en: '🔮 *Astro expert Jitendra Pal has joined the chat.*\n\nYou’re in caring hands now. 💚',
    hi: '🔮 *ज्योतिष विशेषज्ञ जितेन्द्र पाल चैट में शामिल हो गए हैं।*\n\nअब आप अच्छे हाथों में हैं। 💚',
  },

  // ── Astro path intro (shown when the user picks Astro + Clinical) ─────────────
  astroChoice: {
    en: 'Excellent choice! 💚',
    hi: 'बहुत बढ़िया चुनाव! 💚',
  },
  astroNature1: {
    en: '🌸 Every person has a different nature.\n\nSome are quick to make decisions, some have a tendency to overthink, and some have a habit of suppressing emotions. 💭\n\n✨ Understanding these tendencies is the purpose of Astro analysis.',
    hi: '🌸 हर इंसान का स्वभाव अलग होता है।\n\nकोई जल्दी फ़ैसले लेता है, किसी में ज़रूरत से ज़्यादा सोचने की प्रवृत्ति होती है, और किसी को भावनाओं को दबाने की आदत होती है। 💭\n\n✨ इन्हीं प्रवृत्तियों को समझना Astro विश्लेषण का उद्देश्य है।',
  },
  astroNature2: {
    en: '🔮 At AstroVaidhya, astrology isn’t just about predicting the future.\nWe’ll try to understand how your natural tendencies, mental patterns, and behavioral habits affect your health and life decisions. 🌱',
    hi: '🔮 AstroVaidhya में ज्योतिष सिर्फ़ भविष्य बताने के बारे में नहीं है।\nहम यह समझने की कोशिश करेंगे कि आपकी स्वाभाविक प्रवृत्तियाँ, मानसिक ढर्रे और व्यवहार की आदतें आपके स्वास्थ्य और जीवन के फ़ैसलों को कैसे प्रभावित करती हैं। 🌱',
  },
  astroNature3: {
    en: '🧭 This analysis combines your homeopathic constitution, your mental tendencies, and Vedic astrological indications to understand which behavioral and personality patterns may be affecting your health and life.\n💚 This is the purpose of this analysis.',
    hi: '🧭 यह विश्लेषण आपकी होम्योपैथिक प्रकृति, आपकी मानसिक प्रवृत्तियों और वैदिक ज्योतिषीय संकेतों को मिलाकर यह समझता है कि कौन-से व्यवहार और व्यक्तित्व के ढर्रे आपके स्वास्थ्य और जीवन को प्रभावित कर सकते हैं।\n💚 यही इस विश्लेषण का उद्देश्य है।',
  },
  kundliSkipOk: {
    en: 'It’s okay. 😊 It’s perfectly normal not to have a horoscope.',
    hi: 'कोई बात नहीं। 😊 कुंडली का न होना बिल्कुल सामान्य है।',
  },
  palmIntroSkip: {
    en: 'In such a situation, we will try to understand your personality, mental tendencies and some patterns of life through palmistry.',
    hi: 'ऐसी स्थिति में, हम हस्तरेखा के ज़रिए आपके व्यक्तित्व, मानसिक प्रवृत्तियों और जीवन के कुछ ढर्रों को समझने की कोशिश करेंगे।',
  },

  // ── Astro details (asked only on the Astro + Clinical path) ───────────────────
  askPalm: {
    en: 'Please send a clear *photo of both your palms* 🖐️ (both hands open, fingers spread, good lighting). This helps me read your palmistry cues alongside your birth chart.',
    hi: 'कृपया अपनी *दोनों हथेलियों की एक साफ़ फ़ोटो* भेजिए 🖐️ (दोनों हाथ खुले, उंगलियाँ फैलाकर, अच्छी रोशनी में)। इससे मैं आपकी जन्म कुंडली के साथ हस्तरेखा भी पढ़ सकूँगा।',
  },
  palmSendPrompt: {
    en: 'Please send a clear *photo of both your palms* 🖐️ — I need this to complete your reading. 🙂',
    hi: 'कृपया अपनी *दोनों हथेलियों की एक साफ़ फ़ोटो* भेजिए 🖐️ — आपकी रीडिंग पूरी करने के लिए यह ज़रूरी है। 🙂',
  },
  askKundli: {
    en: 'If you have your *Kundli (birth chart)*, please share it as a photo or PDF 📜.\n\n_(If you don’t have it handy, just type "skip".)_',
    hi: 'यदि आपके पास अपनी *कुंडली (जन्म कुंडली)* है, तो कृपया उसे फ़ोटो या PDF के रूप में भेजिए 📜।\n\n_(अगर अभी उपलब्ध नहीं है, तो बस "skip" लिखिए।)_',
  },
  kundliSendPrompt: {
    en: 'Please send a *photo or PDF* 📜, or type *"skip"* to continue. 🙂',
    hi: 'कृपया एक *फ़ोटो या PDF* 📜 भेजिए, या आगे बढ़ने के लिए *"skip"* लिखिए। 🙂',
  },
  uploading: {
    en: '⏳ Uploading, hold on just a moment... 📤',
    hi: '⏳ अपलोड हो रहा है, बस एक पल रुकिए... 📤',
  },
  uploadError: {
    en: ({ msg }) => `Oh no, I couldn’t upload that (${msg}). 😟 Please try again, or type "skip" to continue. 🙂`,
    hi: ({ msg }) => `अरे, मैं इसे अपलोड नहीं कर पाया (${msg})। 😟 कृपया दोबारा कोशिश कीजिए, या आगे बढ़ने के लिए "skip" लिखिए। 🙂`,
  },

  // ── Closing (after payment) ───────────────────────────────────────────────────
  consultClosing: {
    en: '🎉 *You’re all set!* 💚 Jitendra Pal will continue with you here shortly. Take care of yourself. 🌸',
    hi: '🎉 *सब तैयार है!* 💚 जितेन्द्र पाल जल्द ही यहीं आपके साथ आगे बढ़ेंगे। अपना ख़याल रखिए। 🌸',
  },
  // Sent after payment when a handoff number is configured: the user is moved to
  // a dedicated number to continue with the expert. {link} is a wa.me deep link.
  consultHandoff: {
    en: ({ link }) =>
      `🎉 *You’re all set — thank you!* 💚\n\nTo continue your consultation, please tap below to chat with our expert directly:\n👉 ${link}\n\nWe’ll take great care of you there. 🌸`,
    hi: ({ link }) =>
      `🎉 *सब तैयार है — धन्यवाद!* 💚\n\nअपनी सलाह जारी रखने के लिए, कृपया नीचे टैप करके सीधे हमारे विशेषज्ञ से बात करें:\n👉 ${link}\n\nहम वहाँ आपका पूरा ख़याल रखेंगे। 🌸`,
  },
  // Terminal auto-reply once the conversation has moved to the handoff number.
  chatShifted: {
    en: '🙏 Your chat has been shifted to our expert’s number — please continue there. Thank you! 💚',
    hi: '🙏 आपकी बातचीत हमारे विशेषज्ञ के नंबर पर स्थानांतरित कर दी गई है — कृपया वहीं आगे बढ़ें। धन्यवाद! 💚',
  },

  // ── Doctor consultation questionnaire (direct "Consult a doctor" path) ────────
  // Asked, one at a time, after payment on the direct doctor-consult path, so
  // Dr. Jit has full clinical context before the chat is handed off.
  diIntro: {
    en: '🙏 Thank you. To help Dr. Jit understand your case, I’ll ask you a few quick questions. It won’t take long. 💚',
    hi: '🙏 धन्यवाद। डॉ. जित को आपकी स्थिति समझने में मदद के लिए, मैं आपसे कुछ छोटे सवाल पूछूँगा। इसमें ज़्यादा समय नहीं लगेगा। 💚',
  },
  diAskArea: {
    en: 'Which area best describes your concern today?',
    hi: 'आज आपकी समस्या किस क्षेत्र से सबसे ज़्यादा जुड़ी है?',
  },
  diAskProblem: {
    en: 'In your own words, what is the main problem you’re facing right now?\n\nDescribe it as much as you’d like — there’s no fixed format, just tell me the way you would tell a doctor in person.',
    hi: 'अपने शब्दों में बताइए, अभी आपकी मुख्य समस्या क्या है?\n\nजितना चाहें उतना विस्तार से बताइए — कोई तय प्रारूप नहीं है, बस ऐसे बताइए जैसे आप किसी डॉक्टर को सामने बैठकर बताते।',
  },
  diAskSince: {
    en: 'Since when have you been experiencing this?\n\nTap an option below, or type it in your own words.',
    hi: 'यह समस्या आपको कब से है?\n\nनीचे कोई विकल्प चुनिए, या अपने शब्दों में लिखिए।',
  },
  diAskWorse: {
    en: 'Is there anything that makes it worse — certain weather, food, time of day, stress, after eating, at night?\n\nTap an option, tell me whatever you’ve noticed, or write "not sure".',
    hi: 'क्या कोई चीज़ इसे बढ़ाती है — कोई मौसम, भोजन, दिन का समय, तनाव, खाने के बाद, रात में?\n\nकोई विकल्प चुनिए, जो भी आपने महसूस किया हो बताइए, या "पता नहीं" लिखिए।',
  },
  diAskBetter: {
    en: 'And is there anything that makes it feel better — rest, warmth, a specific position, medicine?',
    hi: 'और क्या कोई चीज़ इसे बेहतर महसूस कराती है — आराम, गर्माहट, कोई ख़ास मुद्रा, दवा?',
  },
  diAskTreatment: {
    en: 'Have you taken any treatment for this already — allopathic, homeopathic, home remedies, or anything else?\n\nIf yes, please tell me what, and whether it helped.',
    hi: 'क्या आपने इसके लिए पहले कोई इलाज लिया है — एलोपैथिक, होम्योपैथिक, घरेलू उपाय, या कुछ और?\n\nयदि हाँ, तो कृपया बताइए क्या लिया और उससे आराम मिला या नहीं।',
  },
  diAskSleep: {
    en: 'How has your sleep been lately?',
    hi: 'आजकल आपकी नींद कैसी रही है?',
  },
  diAskEnergy: {
    en: 'How is your energy level through the day?',
    hi: 'दिनभर आपकी ऊर्जा (एनर्जी) कैसी रहती है?',
  },
  diAskAppetite: {
    en: 'How is your appetite?',
    hi: 'आपकी भूख कैसी है?',
  },
  diAskStress: {
    en: 'How would you rate your stress level these days?',
    hi: 'इन दिनों आप अपने तनाव के स्तर को कैसा बताएँगे?',
  },
  diAskReports: {
    en: 'Do you have any medical reports related to this — blood tests, prescriptions, scans, ultrasound, etc.?\n\nIf yes, you can upload them now (photo or PDF). This helps Dr. Jit understand your case better.\n\nIf not, just type "skip".',
    hi: 'क्या इससे जुड़ी आपके पास कोई मेडिकल रिपोर्ट है — ब्लड टेस्ट, पर्ची, स्कैन, अल्ट्रासाउंड आदि?\n\nयदि हाँ, तो आप अभी उन्हें भेज सकते हैं (फ़ोटो या PDF)। इससे डॉ. जित आपकी स्थिति बेहतर समझ पाएँगे।\n\nयदि नहीं, तो बस "skip" लिखिए।',
  },
  diAskOther: {
    en: 'Any other problem you’d like to mention?\n\nType it here, or type "skip" to submit.',
    hi: 'कोई और समस्या जो आप बताना चाहें?\n\nयहाँ लिखिए, या भेजने के लिए "skip" लिखिए।',
  },
  diSubmitted: {
    en: '🙏 Thank you! I’ve noted everything down for Dr. Jit. 💚',
    hi: '🙏 धन्यवाद! मैंने डॉ. जित के लिए सब कुछ नोट कर लिया है। 💚',
  },
  diPickOption: {
    en: 'Please tap one of the options above so I can note it down. 🙂👆',
    hi: 'कृपया ऊपर दिए विकल्पों में से एक चुनिए ताकि मैं उसे नोट कर सकूँ। 🙂👆',
  },
  diTypeAnswer: {
    en: 'Please type your answer in a few words so I can note it down. 🙂',
    hi: 'कृपया कुछ शब्दों में अपना उत्तर लिखिए ताकि मैं उसे नोट कर सकूँ। 🙂',
  },
  diReportsSendOrSkip: {
    en: 'Please send a *photo or PDF* of your report 📄, or type *"skip"* to continue. 🙂',
    hi: 'कृपया अपनी रिपोर्ट की *फ़ोटो या PDF* 📄 भेजिए, या आगे बढ़ने के लिए *"skip"* लिखिए। 🙂',
  },
  diChoose: { en: 'Choose', hi: 'चुनें' },
  diHeaderArea: { en: 'Your concern', hi: 'आपकी समस्या' },
  diHeaderSince: { en: 'Since when', hi: 'कब से' },
  diHeaderWorse: { en: 'Triggers', hi: 'कारण' },
};

// ── Tappable / sequential option sets (kept here so flows stay declarative) ─────

/**
 * The intro messages sent one-by-one right after language selection.
 * @param {string} lang
 * @returns {string[]}
 */
function introLines(lang = 'en') {
  const en = [
    'Hi, I’m Kiko, an AI assistant for AstroVaidhya.',
    '🌿 At AstroVaidhya, we combine Classical Homeopathy, psychological case analysis, and personalized lifestyle guidance to understand the root cause of your health concerns—not just the symptoms. 🩺',
    '🔒 Your privacy is our priority. 💚',
  ];
  const hi = [
    'नमस्ते, मैं Kiko हूँ, AstroVaidhya का एक AI सहायक।',
    '🌿 AstroVaidhya में, हम Classical Homeopathy, मनोवैज्ञानिक केस विश्लेषण और व्यक्तिगत जीवनशैली मार्गदर्शन को मिलाकर आपकी स्वास्थ्य समस्याओं की जड़ को समझते हैं—सिर्फ़ लक्षणों को नहीं। 🩺',
    '🔒 आपकी निजता हमारी प्राथमिकता है। 💚',
  ];
  return lang === 'hi' ? hi : en;
}

/**
 * The concern options. `id` is what comes back on a tap; `value` is the full
 * phrase stored as the user's answer; `title` is the (<=24 char) list row label;
 * `description` carries the sub-line (examples) shown under the title.
 * @param {string} lang
 * @returns {Array<{id:string,title:string,description:string,value:string}>}
 */
function concernOptions(lang = 'en') {
  const rows = [
    { id: 'stress',    hiT: '😔 तनाव व चिंता',        enT: '😔 Stress & anxiety',    hiH: 'तनाव, चिंता या मन की परेशानी', enH: 'Stress, anxiety or mental unrest' },
    { id: 'sleep',     hiT: '🌙 नींद की समस्या',      enT: '🌙 Sleep problems',      hiH: 'नींद की समस्या',              enH: 'Sleep problems' },
    { id: 'sexual',    hiT: '💑 यौन व निजी समस्या',   enT: '💑 Sexual & intimate',   hiH: 'यौन स्वास्थ्य एवं निजी समस्याएँ', enH: 'Sexual health & intimate concerns' },
    { id: 'addiction', hiT: '🚭 नशा या आदत',          enT: '🚭 Addiction / habit',   hiH: 'नशा या किसी आदत से छुटकारा',   enH: 'Quitting an addiction or habit' },
    { id: 'weight',    hiT: '⚖️ वजन व हार्मोन',       enT: '⚖️ Weight & hormones',   hiH: 'वजन, थायरॉइड व हार्मोन संतुलन', enH: 'Weight, thyroid & hormone balance' },
    { id: 'chronic',   hiT: '🩺 पुरानी शारीरिक समस्या', enT: '🩺 Long-term physical', hiH: 'लंबे समय से चल रही शारीरिक समस्या', enH: 'A long-standing physical problem' },
    { id: 'women',     hiT: '👩 महिला स्वास्थ्य',      enT: '👩 Women’s health',       hiH: 'महिलाओं का स्वास्थ्य',        enH: 'Women’s health' },
    { id: 'other',     hiT: '📋 कुछ और',              enT: '📋 Something else',      hiH: 'कुछ और (अपने शब्दों में बताएँ)', enH: 'Something else (in your own words)' },
  ];
  const l = lang === 'hi' ? 'hi' : 'en';
  return rows.map((r) => ({
    id: `concern:${r.id}`,
    title: l === 'hi' ? r.hiT : r.enT,
    value: l === 'hi' ? r.hiH : r.enH,
  }));
}

/** The "where do you feel the greatest impact" options. */
function affectOptions(lang = 'en') {
  const rows = [
    { id: 'sleep',     en: '😴 Sleep and Rest',            hi: '😴 नींद और आराम' },
    { id: 'work',      en: '💼 Work, Studies, Performance', hi: '💼 काम, पढ़ाई या प्रदर्शन' },
    { id: 'family',    en: '👨‍👩‍👧 Family & Relationships',    hi: '👨‍👩‍👧 परिवार और रिश्ते' },
    { id: 'marital',  en: '❤️ Marital/Personal Life',      hi: '❤️ वैवाहिक/निजी जीवन' },
    { id: 'mood',      en: '😊 Mood, Confidence, Peace',    hi: '😊 मनोदशा, आत्मविश्वास, शांति' },
    { id: 'energy',    en: '💪 Energy & Daily Activities',  hi: '💪 ऊर्जा और दैनिक गतिविधियाँ' },
    { id: 'financial', en: '💰 Financial/Career Impact',    hi: '💰 आर्थिक या करियर पर असर' },
    { id: 'other',     en: '📌 Other',                      hi: '📌 अन्य' },
  ];
  const l = lang === 'hi' ? 'hi' : 'en';
  return rows.map((r) => ({ id: `affect:${r.id}`, title: r[l], value: r[l] }));
}

/** The 4 sense-of-control (severity) options. */
function severityOptions(lang = 'en') {
  const rows = [
    { id: 'almost', en: 'Almost complete control', hi: 'लगभग पूरा नियंत्रण', enD: '😊 I think I’m able to handle it to a large extent.',   hiD: '😊 मुझे लगता है कि मैं इसे काफ़ी हद तक संभाल सकता हूँ।' },
    { id: 'some',   en: 'Some control',            hi: 'थोड़ा नियंत्रण',      enD: '🙂 Sometimes I can handle it, sometimes it’s difficult.', hiD: '🙂 कभी संभाल पाता हूँ, कभी मुश्किल होती है।' },
    { id: 'little', en: 'Very little control',      hi: 'बहुत कम नियंत्रण',    enD: '😟 Most of the time it’s difficult to handle.',          hiD: '😟 ज़्यादातर समय इसे संभालना मुश्किल होता है।' },
    { id: 'none',   en: 'No control at all',        hi: 'बिल्कुल नियंत्रण नहीं', enD: '😞 Now it feels out of my control.',                    hiD: '😞 अब यह मेरे नियंत्रण से बाहर लगता है।' },
  ];
  const l = lang === 'hi' ? 'hi' : 'en';
  return rows.map((r) => ({
    id: `sev:${r.id}`,
    title: r[l],
    description: l === 'hi' ? r.hiD : r.enD,
    value: r[l],
  }));
}

/** The 4 satisfaction options (25% / 50% / 75% / 100%). */
function satisfactionOptions(lang = 'en') {
  const rows = [
    { id: '25',  en: '😐 25% satisfied',   hi: '😐 25% संतुष्ट' },
    { id: '50',  en: '🙂 50% satisfied',   hi: '🙂 50% संतुष्ट' },
    { id: '75',  en: '😊 75% satisfied',   hi: '😊 75% संतुष्ट' },
    { id: '100', en: '🤩 100% satisfied',  hi: '🤩 100% संतुष्ट' },
  ];
  const l = lang === 'hi' ? 'hi' : 'en';
  return rows.map((r) => ({ id: `sat:${r.id}`, title: r[l], value: `${r.id}%` }));
}

/**
 * The 3 premium plans. `amountPaise` is the (demo) price charged when the plan
 * is chosen; `value` is the English label stored for the care team.
 */
function planOptions(lang = 'en') {
  const rows = [
    { id: 'plan1', en: '🌱 Plan 1', hi: '🌱 Plan 1', value: 'Plan 1 — Discover Yourself', amountPaise: 19900 },
    { id: 'plan2', en: '🌿 Plan 2 ⭐', hi: '🌿 Plan 2 ⭐', value: 'Plan 2 — Understand Your Life', amountPaise: 49900 },
    { id: 'plan3', en: '🌳 Plan 3', hi: '🌳 Plan 3', value: 'Plan 3 — Transform Yourself', amountPaise: 99900 },
  ];
  const l = lang === 'hi' ? 'hi' : 'en';
  return rows.map((r) => ({ id: `plan:${r.id}`, title: r[l], value: r.value, amountPaise: r.amountPaise }));
}

// ── Doctor consultation questionnaire option sets ───────────────────────────────
// The stored `value` is always the English label so the doctor's intake email
// reads consistently regardless of the language the user chose.
function diAreaOptions(lang = 'en') {
  const rows = [
    { id: 'sexual',    en: 'Sexual Health',            hi: 'यौन स्वास्थ्य' },
    { id: 'hair',      en: 'Hair & Scalp',             hi: 'बाल और सिर की त्वचा' },
    { id: 'skin',      en: 'Skin & Beauty',            hi: 'त्वचा और सुंदरता' },
    { id: 'weight',    en: 'Weight Loss',              hi: 'वज़न घटाना' },
    { id: 'stress',    en: 'Stress, Anxiety & Sleep',  hi: 'तनाव, चिंता और नींद' },
    { id: 'pcos',      en: "PCOS & Women's Health",     hi: 'PCOS और महिला स्वास्थ्य' },
    { id: 'diabetes',  en: 'Diabetes & Thyroid Care',  hi: 'मधुमेह और थायरॉइड' },
    { id: 'digestion', en: 'Digestion & Gut Health',   hi: 'पाचन और पेट स्वास्थ्य' },
    { id: 'joint',     en: 'Joint & Back Pain',        hi: 'जोड़ और कमर दर्द' },
    { id: 'child',     en: 'Child Health & Immunity',  hi: 'बाल एवं इम्युनिटी' },
  ];
  const l = lang === 'hi' ? 'hi' : 'en';
  return rows.map((r) => ({ id: `diarea:${r.id}`, title: r[l], value: r.en }));
}

function diSinceOptions(lang = 'en') {
  const rows = [
    { id: 'lt1w',  en: 'Less than 1 week',  hi: '1 सप्ताह से कम' },
    { id: '1to4w', en: '1–4 weeks',         hi: '1–4 सप्ताह' },
    { id: '1to6m', en: '1–6 months',        hi: '1–6 महीने' },
    { id: 'gt6m',  en: 'More than 6 months', hi: '6 महीने से ज़्यादा' },
  ];
  const l = lang === 'hi' ? 'hi' : 'en';
  return rows.map((r) => ({ id: `disince:${r.id}`, title: r[l], value: r.en }));
}

function diWorseOptions(lang = 'en') {
  const rows = [
    { id: 'weather',  en: 'Weather',           hi: 'मौसम' },
    { id: 'food',     en: 'Food',              hi: 'भोजन' },
    { id: 'stress',   en: 'Stress',            hi: 'तनाव' },
    { id: 'timeofday',en: 'Time of day',       hi: 'दिन का समय' },
    { id: 'activity', en: 'Physical activity', hi: 'शारीरिक गतिविधि' },
    { id: 'notsure',  en: 'Not sure',          hi: 'पता नहीं' },
  ];
  const l = lang === 'hi' ? 'hi' : 'en';
  return rows.map((r) => ({ id: `diworse:${r.id}`, title: r[l], value: r.en }));
}

function diSleepOptions(lang = 'en') {
  const rows = [
    { id: 'good',      en: 'Good',      hi: 'अच्छी' },
    { id: 'disturbed', en: 'Disturbed', hi: 'बाधित' },
    { id: 'verypoor',  en: 'Very poor', hi: 'बहुत ख़राब' },
  ];
  const l = lang === 'hi' ? 'hi' : 'en';
  return rows.map((r) => ({ id: `disleep:${r.id}`, title: r[l], value: r.en }));
}

function diEnergyOptions(lang = 'en') {
  const rows = [
    { id: 'good',    en: 'Good',     hi: 'अच्छी' },
    { id: 'low',     en: 'Low',      hi: 'कम' },
    { id: 'verylow', en: 'Very low', hi: 'बहुत कम' },
  ];
  const l = lang === 'hi' ? 'hi' : 'en';
  return rows.map((r) => ({ id: `dienergy:${r.id}`, title: r[l], value: r.en }));
}

function diAppetiteOptions(lang = 'en') {
  const rows = [
    { id: 'normal',    en: 'Normal',    hi: 'सामान्य' },
    { id: 'increased', en: 'Increased', hi: 'बढ़ी हुई' },
    { id: 'reduced',   en: 'Reduced',   hi: 'घटी हुई' },
  ];
  const l = lang === 'hi' ? 'hi' : 'en';
  return rows.map((r) => ({ id: `diappetite:${r.id}`, title: r[l], value: r.en }));
}

function diStressOptions(lang = 'en') {
  const rows = [
    { id: 'low',      en: 'Low',      hi: 'कम' },
    { id: 'moderate', en: 'Moderate', hi: 'मध्यम' },
    { id: 'high',     en: 'High',     hi: 'ज़्यादा' },
  ];
  const l = lang === 'hi' ? 'hi' : 'en';
  return rows.map((r) => ({ id: `distress:${r.id}`, title: r[l], value: r.en }));
}

/**
 * Short, warm "human touch" lines dropped in between questions to keep the
 * questionnaire feeling like a caring conversation rather than a form. Picked in
 * rotation so a single session sees variety.
 */
const ENCOURAGEMENTS = {
  en: [
    'You’re doing really well — thank you for being so open with me. 💚',
    'I appreciate you sharing this. Let’s keep going, you’ve got this. 🌟',
    'Every answer helps me understand you better. You’re doing great. 🤝',
    'Take a breath — you’re doing wonderfully. Just a few more. 🌸',
    'Thank you for trusting me with this. We’re almost there. 💪',
  ],
  hi: [
    'आप बहुत अच्छा कर रहे हैं — मुझ पर भरोसा करने के लिए धन्यवाद। 💚',
    'आपका साझा करना मेरे लिए मायने रखता है। चलिए आगे बढ़ते हैं, आप कर सकते हैं। 🌟',
    'आपका हर जवाब आपको बेहतर समझने में मदद करता है। आप बढ़िया कर रहे हैं। 🤝',
    'एक गहरी साँस लीजिए — आप बहुत अच्छा कर रहे हैं। बस कुछ और सवाल। 🌸',
    'इस पर भरोसा करने के लिए धन्यवाद। हम लगभग पहुँच ही गए हैं। 💪',
  ],
};

/**
 * Pick a localized encouragement line. `n` (e.g. how many questions answered so
 * far) rotates through the list so the user doesn't see the same line twice.
 * @param {string} lang - 'en' | 'hi'
 * @param {number} [n]  - rotation index
 * @returns {string}
 */
function encouragement(lang = 'en', n = 0) {
  const list = ENCOURAGEMENTS[lang === 'hi' ? 'hi' : 'en'] || ENCOURAGEMENTS.en;
  return list[Math.abs(n) % list.length];
}

/**
 * Translate a key into the given language, interpolating vars when the entry
 * is a function.
 * @param {string} key  - key in STRINGS
 * @param {string} lang - 'en' | 'hi' (defaults to 'en')
 * @param {Object} [vars] - interpolation values
 * @returns {string}
 */
function t(key, lang = 'en', vars = {}) {
  const entry = STRINGS[key];
  if (!entry) return key;
  const l = lang === 'hi' ? 'hi' : 'en';
  const value = entry[l] != null ? entry[l] : entry.en;
  return typeof value === 'function' ? value(vars) : value;
}

/** Convenience: localized category label. */
function categoryLabel(category, lang = 'en') {
  const map = { addiction: 'labelAddiction', mental: 'labelMental', sex: 'labelSex' };
  return map[category] ? t(map[category], lang) : category;
}

module.exports = {
  t,
  categoryLabel,
  encouragement,
  introLines,
  concernOptions,
  affectOptions,
  severityOptions,
  satisfactionOptions,
  planOptions,
  diAreaOptions,
  diSinceOptions,
  diWorseOptions,
  diSleepOptions,
  diEnergyOptions,
  diAppetiteOptions,
  diStressOptions,
};
