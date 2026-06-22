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
    en: "Wonderful, let's begin this journey together! 🌟\n\nFirst things first — what should I call you? Please share your *full name*. 😊",
    hi: 'बहुत बढ़िया, चलिए यह सफ़र साथ में शुरू करते हैं! 🌟\n\nसबसे पहले — मैं आपको किस नाम से बुलाऊँ? कृपया अपना *पूरा नाम* बताइए। 😊',
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
    en: ({ age }) => `Got it — *${age} years young*! 🎉\n\nAnd how do you identify? This helps me care for you better. 💙`,
    hi: ({ age }) => `समझ गया — *${age} साल*! 🎉\n\nऔर आप अपनी पहचान किस रूप में करते हैं? इससे मैं आपकी बेहतर देखभाल कर पाऊँगा। 💙`,
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
    en: 'Almost done — and these last details make your reading truly yours! 🔮✨\n\nWhat’s your *date of birth*? Please use *dd-mm-yyyy* (e.g. 21-05-1990). 🎈',
    hi: 'बस हो ही गया — और ये आख़िरी जानकारियाँ आपकी रीडिंग को सच में आपका बनाती हैं! 🔮✨\n\nआपकी *जन्म तिथि* क्या है? कृपया *dd-mm-yyyy* में लिखिए (जैसे 21-05-1990)। 🎈',
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
    en: 'To begin — what brings you here today? 🙂',
    hi: 'शुरू करने से पहले — आज आप यहाँ किस लिए आए हैं? 🙂',
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
    en: 'And do you know your *time of birth*? ⏰ Please share it in 24-hour format (e.g. 14:30). If you’re not sure, just type *"skip"*. 🙂',
    hi: 'और क्या आपको अपना *जन्म समय* पता है? ⏰ कृपया 24-घंटे के प्रारूप में बताइए (जैसे 14:30)। यदि निश्चित नहीं हैं, तो बस *"skip"* लिखिए। 🙂',
  },
  invalidBirthTime: {
    en: 'That time doesn’t look right. 🤔 Please use 24-hour format like *14:30*, or type *"skip"* if you’re not sure. ⏰',
    hi: 'यह समय सही नहीं लग रहा। 🤔 कृपया *14:30* जैसे 24-घंटे प्रारूप में लिखिए, या निश्चित न होने पर *"skip"* लिखिए। ⏰',
  },

  // ── Gender button titles ─────────────────────────────────────────────────────
  genderMale: { en: 'Male', hi: 'पुरुष' },
  genderFemale: { en: 'Female', hi: 'महिला' },
  genderOther: { en: 'Other', hi: 'अन्य' },

  // ── Consult: astrology + satisfaction ────────────────────────────────────────
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
    en: ({ label, count }) => `✅ Let’s begin the *${label}* journey together — just ${count} gentle questions. Take your time, there are no wrong answers. 💛`,
    hi: ({ label, count }) => `✅ चलिए साथ मिलकर *${label}* की शुरुआत करते हैं — बस ${count} सरल सवाल। आराम से जवाब दीजिए, कोई जवाब ग़लत नहीं होता। 💛`,
  },
  questionHeader: {
    en: ({ index, total }) => `Question ${index} of ${total}`,
    hi: ({ index, total }) => `सवाल ${index} / ${total}`,
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
    en: ({ link }) =>
      `💳 *Unlock your personalised plan*\n\nTo continue and choose how you'd like to proceed, please complete a one-time payment of *₹399*.\n\n👉 Pay securely here:\n${link}\n\nOnce your payment is done, it’ll continue automatically — or tap *I’ve paid* below. 💚`,
    hi: ({ link }) =>
      `💳 *अपनी विशेष योजना अनलॉक करें*\n\nआगे बढ़ने और अपना विकल्प चुनने के लिए, कृपया *₹399* का एक बार भुगतान पूरा करें।\n\n👉 यहाँ सुरक्षित भुगतान करें:\n${link}\n\nभुगतान होते ही यह अपने आप आगे बढ़ जाएगा — या नीचे *भुगतान हो गया* पर टैप करें। 💚`,
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
};

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

module.exports = { t, categoryLabel, encouragement };
