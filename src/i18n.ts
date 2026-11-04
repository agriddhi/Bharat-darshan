/* ============================================================
   i18n.ts — the switch the archive never had.

   WHAT WAS ALREADY TRUE
   The record has been bilingual since v1: nameHi, descriptionHi,
   historyHi, and a titleHi/bodyHi pair on all 125 story stages. That
   is 100% coverage of the prose a reader actually reads. None of it
   was ever rendered — the data was bilingual and the app was not.

   WHAT THIS FILE ADDS
   1. `pick()` — choose the right field from a record for a language,
      falling back to English rather than leaving a hole. Nothing is
      machine-translated to fill a gap; if there is no Hindi, the
      English stands and that is the honest result.
   2. `UI` — the chrome: nav labels, section headings, buttons. These
      are interface, not archive material, so they are written here
      once rather than sourced from sites.json.
   3. `useT()` — the hook components call.

   WHY THE CHROME IS TRANSLATED TOO
   An earlier pass on SitePage deliberately left the chrome in
   English on the reasoning that navigation is not archive content.
   That reasoning was sound and it is now wrong: a reader who presses
   हिं and then sees "Quick facts" sitting above a Hindi paragraph is
   being told the toggle is half-broken. Either the page is in Hindi
   or it is not. The prose was always going to be the harder half and
   it is already done — so the chrome comes along.
   ============================================================ */

import { useStore } from './state/store'

export type Lang = 'en' | 'hi'

/**
 * Pick the language-appropriate field from a record.
 *
 * Hindi wins only when it exists AND is non-empty. A blank string is
 * not a translation, so it falls through to English rather than
 * rendering an empty paragraph.
 */
export function pick(lang: Lang, en: string | null | undefined, hi?: string | null): string {
  if (lang === 'hi' && hi && hi.trim().length > 0) return hi
  return en ?? ''
}

/* ============================================================
   Chrome strings. Keys are stable; values are the two languages.
   ============================================================ */

const STRINGS = {
  /* ---- navigation ---- */
  navSites: { en: 'Sites', hi: 'स्थल' },
  navStories: { en: 'Stories', hi: 'कहानियाँ' },
  navTimeline: { en: 'Timeline', hi: 'कालक्रम' },
  navMap: { en: 'Map', hi: 'नक्शा' },
  navJourney: { en: 'Journey', hi: 'यात्रा' },
  navQuiz: { en: 'Quiz', hi: 'प्रश्नोत्तरी' },
  navAbout: { en: 'About', hi: 'परिचय' },
  navMain: { en: 'Main', hi: 'मुख्य' },

  /* ---- the language switch itself ---- */
  langLabel: { en: 'Language', hi: 'भाषा' },
  langEn: { en: 'EN', hi: 'EN' },
  langHi: { en: 'हिं', hi: 'हिं' },

  /* ---- site page ---- */
  whatThisIs: { en: 'What this is', hi: 'यह क्या है' },
  quickFacts: { en: 'Quick facts', hi: 'त्वरित तथ्य' },
  theStory: { en: 'The story', hi: 'कहानी' },
  fiveStages: { en: 'Five stages', hi: 'पाँच चरण' },
  sections: { en: 'sections', hi: 'खंड' },
  history: { en: 'History', hi: 'इतिहास' },
  view360: { en: '360° view', hi: '360° दृश्य' },
  openPanorama: { en: 'Open the panorama of', hi: 'पैनोरामा खोलें:' },
  sources: { en: 'Sources', hi: 'स्रोत' },
  officialRecord: { en: 'Official record', hi: 'आधिकारिक अभिलेख' },
  imageCredit: { en: 'Image credit', hi: 'चित्र श्रेय' },
  photographer: { en: 'Photographer', hi: 'छायाकार' },
  licence: { en: 'Licence', hi: 'लाइसेंस' },
  file: { en: 'File', hi: 'फ़ाइल' },
  governmentRecord: { en: 'Government record', hi: 'सरकारी अभिलेख' },
  unescoWorld: { en: 'UNESCO World Heritage', hi: 'यूनेस्को विश्व धरोहर' },
  officiallyProtected: { en: 'Officially protected', hi: 'आधिकारिक संरक्षित' },
  previous: { en: '← Previous', hi: '← पिछला' },
  next: { en: 'Next →', hi: 'अगला →' },
  of: { en: 'of', hi: 'में से' },

  /* ---- actions ---- */
  addToJourney: { en: '＋ Add to journey', hi: '＋ यात्रा में जोड़ें' },
  inJourney: { en: '✓ In your journey', hi: '✓ आपकी यात्रा में' },
  journeyFull: { en: 'Journey full (5)', hi: 'यात्रा पूरी (5)' },
  journeyFullTitle: {
    en: 'The route already has 5 stops — remove one first',
    hi: 'मार्ग में पहले से 5 पड़ाव हैं — पहले एक हटाएँ',
  },
  markVisited: { en: 'Mark as visited', hi: 'देखा हुआ चिह्नित करें' },
  visited: { en: '✓ Visited', hi: '✓ देखा हुआ' },

  /* ---- missing record ---- */
  notInArchive: { en: 'Not in the archive', hi: 'संग्रह में नहीं' },
  noSiteMatches: { en: 'No site matches', hi: 'कोई स्थल मेल नहीं खाता' },
  missingBody: {
    en: 'The link may be mistyped, or the record may have been renamed. Every site in the archive is listed on the index page.',
    hi: 'लिंक ग़लत हो सकता है, या अभिलेख का नाम बदल गया हो। संग्रह के सभी स्थल अनुक्रमणिका पेज पर सूचीबद्ध हैं।',
  },
  browseAll: { en: 'Browse all', hi: 'सभी देखें' },
  sitesWord: { en: 'sites', hi: 'स्थल' },

  /* ---- timeline ---- */
  timelineEyebrow: { en: 'Timeline', hi: 'कालक्रम' },
  timelineTitle1: { en: 'Twenty-five monuments,', hi: 'पच्चीस स्मारक,' },
  timelineTitle2: { en: 'in the order they were made.', hi: 'बनने के क्रम में।' },
  timelineLede: {
    en: 'The archive index answers what is here. This answers when. Four periods, oldest first, each one lit by its own colour as you pass through it.',
    hi: 'संग्रह अनुक्रमणिका बताती है यहाँ क्या है। यह बताती है कब। चार कालखंड, सबसे पुराने पहले — हर एक अपने रंग में रोशन।',
  },
  methodHead: {
    en: 'The record holds no date field, so sites are placed by era — that is the only ordering the data supports.',
    hi: 'अभिलेख में तिथि-क्षेत्र नहीं है, इसलिए स्थलों को कालखंड के अनुसार रखा गया है — यही एकमात्र क्रम है जो डेटा समर्थित करता है।',
  },
  methodTail: {
    en: 'carry a genuine construction year, printed here exactly as the source states it. UNESCO listing dates, excavations and rediscoveries are not used: those date our knowledge of a place, not the place itself.',
    hi: 'में वास्तविक निर्माण-वर्ष है, जो यहाँ स्रोत के शब्दों में ज्यों का त्यों छपा है। यूनेस्को सूची-तिथियाँ, उत्खनन और पुनर्खोज का उपयोग नहीं किया गया: वे किसी स्थान के बारे में हमारे ज्ञान की तिथि बताती हैं, स्थान की नहीं।',
  },
  jumpTo: { en: 'Jump to', hi: 'जाएँ' },
  sitesWordCap: { en: 'sites', hi: 'स्थल' },
  dated: { en: 'dated', hi: 'तिथिसहित' },
  notDated: { en: 'not dated', hi: 'तिथि नहीं' },

  /* ---- landing screen ---- */
  brandDevanagari: { en: 'भारत दर्शन', hi: 'भारत दर्शन' },
  heroArchive: { en: 'Archive', hi: 'संग्रह' },
  heroPassport: { en: 'Passport', hi: 'पासपोर्ट' },
  heroEyebrow: {
    en: 'An unstructured archive, made legible',
    hi: 'असंगठित अभिलेख, पठनीय बनाया गया',
  },
  heroTitle1: { en: 'Twenty-five monuments,', hi: 'पच्चीस स्मारक,' },
  heroTitle2: { en: 'one atlas of India.', hi: 'भारत का एक एटलस।' },
  heroLead: {
    en: 'Photographs, inscriptions and official citations, pulled together from scattered heritage records — then given a map, a search, and a route you can actually travel. Every claim carries its source.',
    hi: 'बिखरे हुए धरोहर अभिलेखों से जुटाए गए छायाचित्र, अभिलेख-शिलाएँ और आधिकारिक हवाले — फिर उन्हें नक़्शा, खोज और एक ऐसा मार्ग दिया गया जिसे वाक़ई तय किया जा सके। हर दावे के साथ उसका स्रोत है।',
  },
  enterArchive: { en: 'Enter the archive', hi: 'संग्रह में प्रवेश करें' },
  factSites: { en: 'Sites', hi: 'स्थल' },
  factRegions: { en: 'Regions', hi: 'क्षेत्र' },
  factEras: { en: 'Eras', hi: 'कालखंड' },
  factSourced: { en: 'Sourced', hi: 'स्रोतसहित' },
  nowShowing: { en: 'Now showing', hi: 'अभी दिख रहा है' },
  viewInArchive: { en: 'View in archive', hi: 'संग्रह में देखें' },
  heroHint: {
    en: 'Click the card to open this record',
    hi: 'अभिलेख खोलने के लिए कार्ड पर क्लिक करें',
  },
  heroPhotos: { en: 'Hero photographs', hi: 'मुख्य छायाचित्र' },

  /* ---- archive index ---- */
  sitesEyebrow: { en: 'The archive', hi: 'संग्रह' },
  sitesTitle1: { en: 'Twenty-five sites,', hi: 'पच्चीस स्थल,' },
  sitesTitle2: { en: 'each with its sources.', hi: 'हर एक के स्रोतों के साथ।' },
  sitesLede: {
    en: 'Every entry carries the photograph, the licence that permits its use, the official record it was checked against, and a written account of what the place is and why it matters. Nothing here is stated without a citation.',
    hi: 'हर प्रविष्टि में छायाचित्र, उसके उपयोग की अनुमति देने वाला लाइसेंस, जिस आधिकारिक अभिलेख के विरुद्ध जाँचा गया, और यह लिखित विवरण शामिल है कि स्थान क्या है और क्यों महत्वपूर्ण है। यहाँ कुछ भी बिना हवाले के नहीं कहा गया।',
  },
  filterRegion: { en: 'Region', hi: 'क्षेत्र' },
  filterType: { en: 'Type', hi: 'प्रकार' },
  filterEra: { en: 'Era', hi: 'कालखंड' },
  filterDoc: { en: 'Has a linked document', hi: 'जुड़ा दस्तावेज़ है' },
  anyRecord: { en: 'Any record type', hi: 'कोई भी अभिलेख प्रकार' },
  hasLinked: { en: 'Has a linked document', hi: 'जुड़ा दस्तावेज़ है' },
  allRegions: { en: 'All regions', hi: 'सभी क्षेत्र' },
  allTypes: { en: 'All types', hi: 'सभी प्रकार' },
  allEras: { en: 'All eras', hi: 'सभी कालखंड' },
  searchPlaceholder: { en: 'Search sites, states, types…', hi: 'स्थल, राज्य, प्रकार खोजें…' },
  searchLabel: { en: 'Search the archive', hi: 'संग्रह में खोजें' },
  clearSearch: { en: 'Clear search', hi: 'खोज हटाएँ' },
  shown: { en: 'shown', hi: 'दिखाए गए' },
  clearAll: { en: 'Clear all', hi: 'सब हटाएँ' },
  nothingMatches: { en: 'Nothing matches that', hi: 'कुछ मेल नहीं खाता' },
  emptyBody: {
    en: 'No site in the archive satisfies every filter you have set. Try removing one, or search for something broader.',
    hi: 'संग्रह में कोई ऐसा स्थल नहीं है जो आपके चुने हुए हर छान-बीन को पूरा करता हो। एक हटाकर देखें, या कुछ व्यापक खोजें।',
  },
  showAll: { en: 'Show all', hi: 'सभी दिखाएँ' },
  visitedTitle: { en: 'You marked this as visited', hi: 'आपने इसे देखा हुआ चिह्नित किया है' },
  unescoShort: { en: 'UNESCO', hi: 'यूनेस्को' },
  protected: { en: 'Protected', hi: 'संरक्षित' },

  /* ---- stories ---- */
  storiesEyebrow: { en: 'Stories', hi: 'कहानियाँ' },
  storiesTitle1: { en: 'Every monument,', hi: 'हर स्मारक,' },
  storiesTitle2: { en: 'told in five parts.', hi: 'पाँच भागों में।' },
  storiesLede: {
    en: 'Why it was built, who built it, what to notice in its architecture, how it changed over time, and why it matters today. Each account is written from the record and carries the sources it was drawn from.',
    hi: 'क्यों बनाया गया, किसने बनाया, उसकी वास्तुकला में क्या देखने लायक है, समय के साथ वह कैसे बदला, और आज वह क्यों मायने रखता है। हर विवरण अभिलेख से लिखा गया है और उसके स्रोत साथ लिए हुए हैं।',
  },
  storiesByRegion: {
    en: 'Filter stories by region',
    hi: 'क्षेत्र के अनुसार कहानियाँ छानें',
  },
  noStoriesTitle: {
    en: 'No stories from this region',
    hi: 'इस क्षेत्र की कोई कहानी नहीं',
  },
  noStoriesBody: {
    en: 'Nothing in the archive carries a written narrative for',
    hi: 'संग्रह में अभी तक इस क्षेत्र की कोई लिखित कथा नहीं है:',
  },
  stages: { en: 'stages', hi: 'चरण' },
  moreStages: { en: 'more stages', hi: 'और चरण' },
  readStory: { en: 'Read', hi: 'पढ़ें' },

  /* ---- story page ---- */
  noStoryMatches: { en: 'No story matches', hi: 'कोई कहानी मेल नहीं खाती' },
  noStoryBody: {
    en: 'The link may be mistyped. Every narrative in the archive is listed on the stories page.',
    hi: 'लिंक ग़लत हो सकता है। संग्रह की हर कथा कहानी पेज पर सूचीबद्ध है।',
  },
  contentLanguage: { en: 'Content language', hi: 'सामग्री की भाषा' },
  stageImagePending: {
    en: 'Image for this stage — TODO. v1 carried no licensed photograph for it and none has been sourced since.',
    hi: 'इस चरण का चित्र — TODO. v1 में इसका कोई लाइसेंस प्राप्त छायाचित्र नहीं था और तब से कोई जुटाया भी नहीं गया।',
  },
  noNarrativeYet: {
    en: 'This record has no written narrative yet. The archive does not summarise a site it has no account for — see the site page for the verified facts and sources that do exist.',
    hi: 'इस अभिलेख में अभी तक कोई लिखित कथा नहीं है। संग्रह उस स्थान का सारांश नहीं बनाता जिसका कोई विवरण उसके पास नहीं — जो तथ्य और स्रोत वास्तव में हैं, उनके लिए स्थल पेज देखें।',
  },
  writtenFromRecord: {
    en: 'Written from the record. The site page carries the official source, every citation, the image licence and the quick facts.',
    hi: 'अभिलेख से लिखा गया। स्थल पेज पर आधिकारिक स्रोत, हर हवाला, चित्र लाइसेंस और त्वरित तथ्य हैं।',
  },
  openFullRecord: { en: 'Open the full record', hi: 'पूरा अभिलेख खोलें' },

  /* ---- journey / passport ---- */
  journeyEyebrow: { en: 'Your passport', hi: 'आपका पासपोर्ट' },
  journeyStops: { en: 'stops', hi: 'पड़ाव' },
  journeyBadges: { en: 'badges.', hi: 'प्रतीक।' },
  journeyLede: {
    en: 'Build a route of up to five monuments and the archive will work out how far apart they are. Badges are earned by marking sites as visited — which is a different thing from putting them on a route, and the two are counted separately for that reason.',
    hi: 'पाँच स्मारकों तक का मार्ग बनाएँ और संग्रह बता देगा कि वे कितनी दूर हैं। प्रतीक स्थलों को देखा हुआ चिह्नित करने पर मिलते हैं — यह मार्ग में रखने से अलग बात है, और इसी कारण दोनों अलग-अलग गिने जाते हैं।',
  },
  yourRoute: { en: 'Your route', hi: 'आपका मार्ग' },
  noStopsYet: { en: 'No stops yet', hi: 'अभी कोई पड़ाव नहीं' },
  noStops1: { en: 'Open any site and choose', hi: 'कोई भी स्थल खोलें और चुनें' },
  addJourneyQuote: { en: '“Add to journey”', hi: '“यात्रा में जोड़ें”' },
  noStops2: {
    en: '. Five is the maximum — a route you cannot hold in your head is not a route.',
    hi: '। पाँच अधिकतम है — जो मार्ग आप दिमाग़ में नहीं रख सकते, वह मार्ग नहीं।',
  },
  browseArchive: { en: 'Browse the archive', hi: 'संग्रह देखें' },
  stopWord: { en: 'Stop', hi: 'पड़ाव' },
  fromPrev: {
    en: 'from the previous stop (approx. straight line)',
    hi: 'पिछले पड़ाव से (लगभग सीधी रेखा)',
  },
  removeFromRoute: { en: 'Remove from route', hi: 'मार्ग से हटाएँ' },
  totalLength: { en: 'Total length', hi: 'कुल लंबाई' },
  totalNote: {
    en: 'Approx. straight-line distance across all legs. Not a road distance.',
    hi: 'सभी खंडों की लगभग सीधी-रेखा दूरी। सड़क-दूरी नहीं।',
  },
  relaxedPace: { en: 'At a relaxed pace', hi: 'आरामदायक गति से' },
  paceNote: {
    en: 'A rough estimate at 55 km/h, offered only as a sense of scale.',
    hi: '55 किमी/घंटा पर एक मोटा अनुमान, केवल अनुपात का अंदाज़ा देने के लिए।',
  },
  stopsRemaining: { en: 'Stops remaining', hi: 'शेष पड़ाव' },
  routeFull: {
    en: 'The route is full. Remove a stop to add another.',
    hi: 'मार्ग भरा हुआ है। दूसरा जोड़ने के लिए एक हटाएँ।',
  },
  addAnother: {
    en: 'Add another monument from any site page.',
    hi: 'किसी भी स्थल पेज से एक और स्मारक जोड़ें।',
  },
  yesClearAll: { en: 'Yes, clear all', hi: 'हाँ, सब हटाएँ' },
  keepRoute: { en: 'Keep the route', hi: 'मार्ग बनाए रखें' },
  clearRoute: { en: 'Clear route', hi: 'मार्ग हटाएँ' },
  badgesTitle: { en: 'Badges', hi: 'प्रतीक' },
  earned: { en: 'earned', hi: 'अर्जित' },
  earnedDash: { en: 'Earned —', hi: 'अर्जित —' },
  sitesVisited: { en: 'sites visited', hi: 'स्थल देखे गए' },
  markedVisited: { en: 'Marked as visited', hi: 'देखा हुआ चिह्नित' },
  nothingMarked: {
    en: 'Nothing marked yet. “Visited” is separate from the route — it is the archive’s record of what you have actually seen, and four of the five badges are counted against it rather than against your route.',
    hi: 'अभी कुछ चिह्नित नहीं। “देखा हुआ” मार्ग से अलग है — यह संग्रह का उसका अभिलेख है कि आपने वास्तव में क्या देखा, और पाँच में से चार प्रतीक इसी के विरुद्ध गिने जाते हैं, आपके मार्ग के विरुद्ध नहीं।',
  },

  /* ---- quiz ---- */
  quizEyebrow: { en: 'Quiz', hi: 'प्रश्नोत्तरी' },
  questions: { en: 'questions,', hi: 'प्रश्न,' },
  quizTitle2: { en: 'drawn from the archive.', hi: 'संग्रह से लिए गए।' },
  quizLede: {
    en: 'Every question, option and explanation below comes straight from the data file — the same text the site pages cite. Answer, then read where the fact came from.',
    hi: 'नीचे का हर प्रश्न, विकल्प और व्याख्या सीधे डेटा फ़ाइल से आया है — वही पाठ जो स्थल पेज उद्धृत करते हैं। उत्तर दें, फिर पढ़ें कि तथ्य कहाँ से आया।',
  },
  inARow: { en: 'in a row', hi: 'लगातार' },
  quizProgress: { en: 'Quiz progress', hi: 'प्रश्नोत्तरी प्रगति' },
  detail: { en: 'Detail', hi: 'विवरण' },
  correct: { en: 'Correct', hi: 'सही' },
  notQuite: { en: 'Not quite', hi: 'ठीक नहीं' },
  openRecordFor: { en: 'Open the record for', hi: 'अभिलेख खोलें' },
  seeScore: { en: 'See your score', hi: 'अपना स्कोर देखें' },
  nextQuestion: { en: 'Next question', hi: 'अगला प्रश्न' },
  shuffleAgain: { en: 'Shuffle again', hi: 'फिर से मिलाएँ' },
  pctCorrect: { en: '% correct ·', hi: '% सही ·' },
  bestStreak: { en: 'best streak', hi: 'सर्वश्रेष्ठ श्रृंखला' },
  scoreHigh: { en: 'You were paying attention.', hi: 'आप ध्यान से पढ़ रहे थे।' },
  scoreMid: {
    en: 'A fair start — the stories will fill the gaps.',
    hi: 'ठीक-ठाक शुरुआत — कहानियाँ बाक़ी कसर पूरी कर देंगी।',
  },
  scoreLow: {
    en: 'The archive is there when you want it.',
    hi: 'संग्रह आपके लिए यहीं है जब आप चाहें।',
  },
  scoreBodyHigh: {
    en: 'You know these places well. The stories section goes deeper on the ones you have not opened yet.',
    hi: 'आप इन स्थानों को अच्छी तरह जानते हैं। कहानी अनुभाग उन पर और गहराई से जाता है जो आपने अभी नहीं खोले।',
  },
  scoreBodyRest: {
    en: 'Every question above links to the record it came from. Read the ones you missed and run the quiz again — the questions are reshuffled each time.',
    hi: 'ऊपर का हर प्रश्न उस अभिलेख से जुड़ा है जहाँ से वह आया। जो ग़लत हुए उन्हें पढ़ें और प्रश्नोत्तरी फिर चलाएँ — प्रश्न हर बार नए क्रम में आते हैं।',
  },
  runAnother: { en: 'Run another', hi: 'एक और चलाएँ' },
  readStories: { en: 'Read the stories', hi: 'कहानियाँ पढ़ें' },
  browseAllSites: { en: 'Browse all sites', hi: 'सभी स्थल देखें' },
  noQuestions: { en: 'No questions in the archive', hi: 'संग्रह में कोई प्रश्न नहीं' },
  noQuestionsBody: {
    en: 'This build has no quiz items, so there is nothing to ask. The archive does not invent questions to fill the space.',
    hi: 'इस बिल्ड में कोई प्रश्न-सामग्री नहीं है, इसलिए पूछने को कुछ नहीं। संग्रह जगह भरने के लिए प्रश्न नहीं गढ़ता।',
  },

  /* ---- about ---- */
  aboutEyebrow: { en: 'About this archive', hi: 'इस संग्रह के बारे में' },
  aboutTitle1: { en: 'Every claim,', hi: 'हर दावा,' },
  aboutTitle2: { en: 'with its source attached.', hi: 'उसके स्रोत के साथ।' },
  aboutLede1: { en: 'monuments.', hi: 'स्मारक।' },
  aboutLede2: { en: 'credited photographs.', hi: 'श्रेय-सहित छायाचित्र।' },
  aboutLede3: { en: 'distinct citations.', hi: 'अलग-अलग हवाले।' },
  aboutLede4: {
    en: 'Plus a written account of what this project chose not to do.',
    hi: 'साथ में उन बातों का लिखित विवरण जो इस परियोजना ने जान-बूझकर नहीं कीं।',
  },
  didNotDo: { en: 'What we deliberately did not do', hi: 'हमने जान-बूझकर क्या नहीं किया' },
  rulesNote: { en: 'The rules this build was held to', hi: 'नियम जिन पर यह बिल्ड बँधा था' },
  dontFacts: { en: 'No invented facts.', hi: 'कोई गढ़ा तथ्य नहीं।' },
  dontFactsBody: {
    en: 'No dates, dimensions, quotations or transcriptions were added to fill a gap. Where a field was empty in the source archive, it is empty here.',
    hi: 'किसी खाली जगह को भरने के लिए कोई तिथि, माप, उद्धरण या प्रतिलिपि नहीं जोड़ी गई। जहाँ स्रोत-संग्रह में कोई क्षेत्र खाली था, वह यहाँ भी खाली है।',
  },
  dontSources: { en: 'No invented sources.', hi: 'कोई गढ़ा स्रोत नहीं।' },
  dontSourcesBody: {
    en: 'Every URL on this site was already in the archive or was verified as a real, reachable page. No placeholder links, no “coming soon” citations.',
    hi: 'इस साइट का हर URL पहले से संग्रह में था या उसे वास्तव, पहुँचने योग्य पृष्ठ के रूप में जाँचा गया। कोई खाली-लिंक नहीं, कोई “जल्द आ रहा है” हवाला नहीं।',
  },
  dontFolklore: { en: 'No folklore was written.', hi: 'कोई लोककथा नहीं लिखी गई।' },
  dontFolkloreA: {
    en: 'The schema has a folklore field. It is',
    hi: 'स्कीमा में एक लोककथा क्षेत्र है। वह',
  },
  dontFolkloreOn: { en: 'on all', hi: 'सभी' },
  sitesOblique: { en: 'sites', hi: 'स्थलों' },
  dontFolkloreB: {
    en: ', because fabricating folk narrative to satisfy a field would be the single easiest way to break this project’s premise.',
    hi: ' पर है, क्योंकि किसी क्षेत्र को संतुष्ट करने के लिए लोक-कथा गढ़ना इस परियोजना की शर्त को तोड़ने का सबसे आसान तरीक़ा होता।',
  },
  dontUnesco: { en: 'No unverified UNESCO labels.', hi: 'कोई अन-जाँचा यूनेस्को लेबल नहीं।' },
  dontUnescoBody: {
    en: 'A site is marked as a World Heritage property only where the official inscription reference exists in the data.',
    hi: 'किसी स्थल को केवल तभी विश्व धरोहर घोषित किया जाता है जब डेटा में आधिकारिक अभिलेख-संदर्भ मौजूद हो।',
  },
  dontHidden: { en: 'No hidden incompleteness.', hi: 'कोई छिपी अपूर्णता नहीं।' },
  dontHiddenBody: {
    en: 'Where v1 marked a field TODO — most often the image for one of the five story stages — the TODO is shown rather than quietly dropped or filled with a stock photograph.',
    hi: 'जहाँ v1 ने किसी क्षेत्र पर TODO लिखा था — अक्सर पाँच कहानी-चरणों में से किसी एक की छवि — वह TODO दिखाया जाता है, चुपचाप हटाया या कोई स्टॉक चित्र लगाकर भरा नहीं जाता।',
  },
  dontBackend: { en: 'No backend, no accounts, no keys.', hi: 'कोई बैकएंड नहीं, कोई खाता नहीं, कोई कुंजी नहीं।' },
  dontBackendBody: {
    en: 'The whole archive is a static bundle plus a data file. It runs offline after first load, costs nothing to host, and there is no database to keep patched.',
    hi: 'पूरा संग्रह एक स्थिर बंडल और एक डेटा फ़ाइल है। पहली बार लोड के बाद यह ऑफ़लाइन चलता है, होस्ट करने का कोई ख़र्च नहीं, और न कोई डेटाबेस है जिसे अपडेट रखना हो।',
  },
  dontDesign: { en: 'No borrowed design.', hi: 'कोई उधार लिया डिज़ाइन नहीं।' },
  dontDesignBody: {
    en: 'Layout, type and colour were built for this project. Photographs are the only third-party material, and each one is credited below.',
    hi: 'लेआउट, टाइप और रंग इसी परियोजना के लिए बनाए गए। छायाचित्र ही एकमात्र तृतीय-पक्ष सामग्री हैं, और हर एक का श्रेय नीचे दिया गया है।',
  },
  photoCredits: { en: 'Photograph credits', hi: 'छायाचित्र श्रेय' },
  photographers: { en: 'photographers', hi: 'छायाकार' },
  images: { en: 'images', hi: 'छायाचित्र' },
  creditsIntro: {
    en: 'Generated directly from the data file rather than maintained by hand, so a credit can never disagree with the record it describes. Each row links to the site that uses the image.',
    hi: 'सीधे डेटा फ़ाइल से बनाया गया, हाथ से नहीं रखा गया, ताकि कोई श्रेय उस अभिलेख से असहमत न हो जिसे वह बताता है। हर पंक्ति उस स्थल से जुड़ी है जहाँ चित्र इस्तेमाल होता है।',
  },
  sourceIndexTitle: { en: 'Source index', hi: 'स्रोत अनुक्रमणिका' },
  citations: { en: 'distinct citations', hi: 'अलग-अलग हवाले' },
  sourceIntro: {
    en: 'Every external reference used anywhere in the archive, de-duplicated. A citation used by several sites appears once, with the sites listed.',
    hi: 'संग्रह में कहीं भी इस्तेमाल हर बाहरी संदर्भ, दोहराव हटाकर। कई स्थलों द्वारा इस्तेमाल एक हवाला एक बार आता है, स्थलों की सूची के साथ।',
  },
  thSite: { en: 'Site', hi: 'स्थल' },
  thPhotographer: { en: 'Photographer', hi: 'छायाकार' },
  thLicence: { en: 'Licence', hi: 'लाइसेंस' },
  thFile: { en: 'File', hi: 'फ़ाइल' },
  thSource: { en: 'Source', hi: 'स्रोत' },
  thAddress: { en: 'Address', hi: 'पता' },
  thUsedBy: { en: 'Used by', hi: 'इस्तेमाल करने वाले' },
  more: { en: 'more', hi: 'और' },
  howBuilt: { en: 'How it was built', hi: 'इसे कैसे बनाया गया' },
  howBuilt1: {
    en: 'The archive began as a static site with its records held in a single JavaScript data file. Those records were migrated field by field into a typed JSON schema for this build — the mapping is written down in',
    hi: 'संग्रह की शुरुआत एक स्थिर साइट से हुई जिसके अभिलेख एक ही जावास्क्रिप्ट डेटा फ़ाइल में थे। उन अभिलेखों को इस बिल्ड के लिए क्षेत्र-दर-क्षेत्र टाइप्ड JSON स्कीमा में ले जाया गया — मैपिंग',
  },
  howBuilt1b: {
    en: ', which is generated by the migration script itself so the notes cannot drift away from what the script actually did.',
    hi: 'में लिखी गई है, जिसे स्वयं माइग्रेशन स्क्रिप्ट बनाती है ताकि टिप्पणियाँ स्क्रिप्ट के वास्तव काम से अलग न हों।',
  },
  howBuilt2: {
    en: 'Nothing is fetched at runtime. Filtering, search, distances, badges and the quiz all read the same data file, which is why the count in the archive header always matches the cards underneath it — there is only one definition of “currently shown” in the codebase.',
    hi: 'रनटाइम पर कुछ भी नहीं लाया जाता। छान-बीन, खोज, दूरियाँ, प्रतीक और प्रश्नोत्तरी सब एक ही डेटा फ़ाइल पढ़ते हैं, इसीलिए संग्रह-शीर्षक में गिनती हमेशा नीचे के कार्डों से मेल खाती है — कोड में “अभी दिख रहा” की एक ही परिभाषा है।',
  },
  howBuilt3: {
    en: 'Distances use the haversine formula and are always labelled approximate, because a straight-line figure presented as a journey would be misleading. Badges and their tests are carried over from the first version verbatim, so the two builds agree about what has been earned.',
    hi: 'दूरियाँ हैवरसाइन सूत्र से निकलती हैं और हमेशा “लगभग” लिखी जाती हैं, क्योंकि सीधी-रेखा आँकड़ा यात्रा के रूप में पेश करना भ्रामक होता। प्रतीक और उनकी जाँच पहले संस्करण से शब्द-शब्द कॉपी किए गए हैं, ताकि दोनों बिल्ड इस बात पर सहमत रहें कि क्या अर्जित हुआ।',
  },
  team: { en: 'Team', hi: 'टीम' },
  threeRoles: { en: 'Three roles', hi: 'तीन भूमिकाएँ' },
  roleArchitecture: { en: 'Architecture & data', hi: 'संरचना और डेटा' },
  roleInterface: { en: 'Interface & interaction', hi: 'इंटरफ़ेस और अंतःक्रिया' },
  roleContent: { en: 'Content & sources', hi: 'सामग्री और स्रोत' },
  noteArchitecture: {
    en: 'Schema design, the migration pipeline, the source-verification rules and the build system.',
    hi: 'स्कीमा डिज़ाइन, माइग्रेशन पाइपलाइन, स्रोत-सत्यापन नियम और बिल्ड सिस्टम।',
  },
  noteInterface: {
    en: 'The archive interface, the site and story pages, the timeline, and the type and colour system.',
    hi: 'संग्रह इंटरफ़ेस, स्थल और कहानी पेज, कालक्रम, और टाइप व रंग प्रणाली।',
  },
  noteContent: {
    en: 'The written records, the citation checking, the Hindi translations and the quiz material.',
    hi: 'लिखित अभिलेख, हवाला-जाँच, हिन्दी अनुवाद और प्रश्नोत्तरी सामग्री।',
  },
  todoName: { en: 'TODO: name and contact', hi: 'TODO: नाम और संपर्क' },

  /* ---- map ---- */
  mapEyebrow: { en: 'The map', hi: 'नक्शा' },
  mapTitle1: { en: 'Twenty-five sites,', hi: 'पच्चीस स्थल,' },
  mapTitle2: { en: 'on the map.', hi: 'नक्शे पर।' },
  mapLede: {
    en: 'Every site in the archive, placed where it stands. Click a marker to open its record. The map is the one part of this site that fetches tiles from the open map — everything else runs on the data file alone.',
    hi: 'संग्रह का हर स्थल, जहाँ वह खड़ा है वहीं रखा गया। अभिलेख खोलने के लिए चिह्न पर क्लिक करें। नक्शा इस साइट का वह एकमात्र हिस्सा है जो खुला नक्शा (ओपन मैप) से टाइलें लाता है — बाक़ी सब केवल डेटा फ़ाइल पर चलता है।',
  },
  openRecord: { en: 'Open the record', hi: 'अभिलेख खोलें' },

  /* ---- era names ---- */
  eraAncient: { en: 'Ancient', hi: 'प्राचीन' },
  eraMedieval: { en: 'Medieval', hi: 'मध्यकालीन' },
  eraMughal: { en: 'Mughal', hi: 'मुग़ल' },
  eraColonial: { en: 'Colonial', hi: 'औपनिवेशिक' },

  /* ---- era notes (timeline) ---- */
  noteAncient: {
    en: 'Rock-cut caves, stupas and the earliest surviving masonry.',
    hi: 'चट्टान में कटी गुफाएँ, स्तूप और सबसे पुरानी बची हुई निर्माण-कला।',
  },
  noteMedieval: {
    en: 'Temple cities, stepwells and the great southern dynasties.',
    hi: 'मंदिर-नगर, बावड़ियाँ और दक्षिण की महान वंश-परंपराएँ।',
  },
  noteMughal: {
    en: 'Garden tombs, red sandstone forts and planned capitals.',
    hi: 'बाग़-समाधियाँ, लाल बलुआ पत्थर के क़िले और योजनाबद्ध राजधानियाँ।',
  },
  noteColonial: {
    en: 'The most recent layer — civic buildings and royal residences.',
    hi: 'सबसे नया तबक़ा — नागरिक भवन और शाही निवास।',
  },

  /* ---- region names ---- */
  regionNorth: { en: 'North India', hi: 'उत्तर भारत' },
  regionSouth: { en: 'South India', hi: 'दक्षिण भारत' },
  regionWest: { en: 'West India', hi: 'पश्चिम भारत' },
  regionEast: { en: 'East India', hi: 'पूर्वी भारत' },
  regionCentral: { en: 'Central India', hi: 'मध्य भारत' },
  regionNortheast: { en: 'Northeast India', hi: 'पूर्वोत्तर भारत' },

  /* ---- type names ---- */
  typeCave: { en: 'Cave', hi: 'गुफ़ा' },
  typeFort: { en: 'Fort', hi: 'क़िला' },
  typeMonument: { en: 'Monument', hi: 'स्मारक' },
  typePalace: { en: 'Palace', hi: 'महल' },
  typeStepwell: { en: 'Stepwell', hi: 'बावड़ी' },
  typeTemple: { en: 'Temple', hi: 'मंदिर' },
  typeTomb: { en: 'Tomb', hi: 'समाधि' },
} as const

export type StringKey = keyof typeof STRINGS

/** Chrome string for a language, falling back to English. */
export function t(key: StringKey, lang: Lang): string {
  const row = STRINGS[key]
  return lang === 'hi' && row.hi ? row.hi : row.en
}

/**
 * The hook. Returns a function so components read the current
 * language on every render and re-render when it changes — the
 * toggle lives in the store, so one press repaints every string on
 * screen without any component needing to know about the switch.
 */
export function useT(): (key: StringKey) => string {
  const lang = useStore((st) => st.lang)
  return (key: StringKey) => t(key, lang)
}

/** The current language, for components that need to branch on it. */
export function useLang(): Lang {
  return useStore((st) => st.lang)
}

/** Era slug -> display name, in the current language. */
export function eraLabel(era: string, lang: Lang): string {
  switch (era) {
    case 'ancient':
      return t('eraAncient', lang)
    case 'medieval':
      return t('eraMedieval', lang)
    case 'mughal':
      return t('eraMughal', lang)
    case 'colonial':
      return t('eraColonial', lang)
    default:
      return era
  }
}

/** The one-line description of a period, in the current language. */
export function eraNote(era: string, lang: Lang): string {
  switch (era) {
    case 'ancient':
      return t('noteAncient', lang)
    case 'medieval':
      return t('noteMedieval', lang)
    case 'mughal':
      return t('noteMughal', lang)
    case 'colonial':
      return t('noteColonial', lang)
    default:
      return ''
  }
}

/** Region slug -> display name, in the current language. */
export function regionLabel(region: string, lang: Lang): string {
  switch (region) {
    case 'North':
      return t('regionNorth', lang)
    case 'South':
      return t('regionSouth', lang)
    case 'West':
      return t('regionWest', lang)
    case 'East':
      return t('regionEast', lang)
    case 'Central':
      return t('regionCentral', lang)
    case 'Northeast':
      return t('regionNortheast', lang)
    default:
      return region
  }
}

/** Type slug -> display name, in the current language. */
export function typeLabel(type: string, lang: Lang): string {
  switch (type) {
    case 'cave':
      return t('typeCave', lang)
    case 'fort':
      return t('typeFort', lang)
    case 'monument':
      return t('typeMonument', lang)
    case 'palace':
      return t('typePalace', lang)
    case 'stepwell':
      return t('typeStepwell', lang)
    case 'temple':
      return t('typeTemple', lang)
    case 'tomb':
      return t('typeTomb', lang)
    default:
      return type
  }
}
