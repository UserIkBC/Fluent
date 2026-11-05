/* Inglés rápido: cómo suenan las frases dichas de verdad.
   [cómo se escribe, cómo suena (aprox.), qué es, explicación] */
window.CONNECTED = [
["I'm going to call her.", "I'm gonna call her.", "going to → gonna", "«Going to» se reduce casi siempre a «gonna» cuando va seguido de verbo."],
["I want to go home.", "I wanna go home.", "want to → wanna", "«Want to» suena «wanna». Ojo, «wants to» no se reduce."],
["I've got to leave.", "I've gotta leave.", "got to → gotta", "«Have got to» (tener que) suena «gotta»."],
["What do you want?", "Whaddaya want?", "what do you → whaddaya", "Las tres palabras se funden en una sola."],
["What are you doing?", "Whatcha doing?", "what are you → whatcha", "Muy típico en conversación rápida."],
["Did you eat?", "Didja eat?", "did you → didja", "La d + y suena como «ya» con una d delante: «dja»."],
["Would you like a drink?", "Wouldja like a drink?", "would you → wouldja", "D + you se convierte en «ja»."],
["Could you help me?", "Couldja help me?", "could you → couldja", "Igual que «would you»."],
["Don't you know?", "Doncha know?", "don't you → doncha", "T + you suena «cha»."],
["I should have told you.", "I shoulda told you.", "should have → shoulda", "«Have» se reduce a una vocal débil."],
["You could have called.", "You coulda called.", "could have → coulda", "Mismo patrón que «shoulda»."],
["It would have been great.", "It woulda been great.", "would have → woulda", "Mismo patrón."],
["I must have left it at home.", "I musta left it at home.", "must have → musta", "Deducción en pasado, muy reducida al hablar."],
["Let me see.", "Lemme see.", "let me → lemme", "La t desaparece."],
["Give me a minute.", "Gimme a minute.", "give me → gimme", "Muy común en inglés hablado."],
["I don't know.", "I dunno.", "don't know → dunno", "Casi siempre se dice así en conversación."],
["Do you want to come?", "D'you wanna come?", "do you → d'you", "«Do you» pierde la vocal."],
["Kind of tired.", "Kinda tired.", "kind of → kinda", "«Of» se reduce a una vocal débil."],
["Sort of strange.", "Sorta strange.", "sort of → sorta", "Igual que «kinda»."],
["A lot of people.", "A lotta people.", "lot of → lotta", "«Of» casi desaparece."],
["Out of time.", "Outta time.", "out of → outta", "La t entre vocales suena suave (en EE. UU. casi como una d)."],
["Cup of tea.", "Cuppa tea.", "cup of → cuppa", "Tan común en Reino Unido que «a cuppa» es ya una palabra."],
["Fish and chips.", "Fish 'n' chips.", "and → 'n'", "«And» se reduce a una «n»."],
["Rock and roll.", "Rock 'n' roll.", "and → 'n'", "Mismo fenómeno."],
["I'll tell them.", "I'll tell 'em.", "them → 'em", "«Them» pierde la th."],
["Tell him I said hi.", "Tell 'im I said hi.", "him → 'im", "La h de «him», «her» y «his» se pierde en medio de la frase."],
["Is he there?", "Izzy there?", "is he → izzy", "La h desaparece y las palabras se unen."],
["Get out of here!", "Geddoudda here!", "get out of → geddoudda", "Americano muy rápido: las t entre vocales suenan como d."],
["Not at all.", "No-ta-tall.", "unión consonante + vocal", "La t final se une a la vocal siguiente: no-ta-tall."],
["Pick it up.", "Pi-ki-tup.", "unión consonante + vocal", "Las palabras se encadenan como si fueran una."],
["Turn it off.", "Tur-ni-toff.", "unión consonante + vocal", "Encadenamiento: cada consonante final se pega a la vocal que sigue."],
["Next stop.", "Neks stop.", "elisión de t", "Entre consonantes, la t suele desaparecer."],
["Last night.", "Lass night.", "elisión de t", "La t de «last» casi no se oye."],
["I don't think so.", "I don' think so.", "elisión de t", "La t de «don't» se pierde antes de consonante."],
["Did you see it?", "Didja see it?", "did you → didja", "Muy frecuente en preguntas."],
["Got you!", "Gotcha!", "got you → gotcha", "Significa «¡te pillé!» o «entendido»."],
["Bet you can't.", "Betcha can't.", "bet you → betcha", "T + you = «cha»."],
["Want a coffee?", "Wanna coffee?", "want a → wanna", "«Want a» también suena «wanna»."],
["Isn't it?", "Innit?", "isn't it → innit", "Muy típico de Londres en conversación informal."],
["What is up?", "Wassup?", "what is up → wassup", "Saludo informal."],
["Come on!", "C'mon!", "come on → c'mon", "La primera vocal casi desaparece."],
["Probably.", "Prob'ly.", "sílaba que desaparece", "Muchas palabras pierden una sílaba al hablar rápido."],
["Interesting.", "Intresting.", "sílaba que desaparece", "La e del medio no se pronuncia."],
["Comfortable.", "Cumftable.", "sílaba que desaparece", "Se dice en tres sílabas, no en cuatro."],
["Every.", "Evry.", "sílaba que desaparece", "Dos sílabas, no tres."],
["Chocolate.", "Choclet.", "sílaba que desaparece", "Dos sílabas."],
["Different.", "Diffrent.", "sílaba que desaparece", "Dos sílabas."],
["Family.", "Famly.", "sílaba que desaparece", "Casi siempre dos sílabas."],
["Have a good one.", "Hava good one.", "unión consonante + vocal", "«Have a» se une: «hava»."],
["Thank you.", "Thankyou → thanks / ta.", "formas cortas", "En Reino Unido se oye mucho «ta» o «cheers» en vez de «thank you»."]
];

/* Frases para reconocer acentos (se leen con voces de distintos países) */
window.ACCENT_LINES = [
"Could you tell me the way to the nearest station, please?",
"I'm going to grab a coffee before the meeting starts.",
"We had a lovely time at the beach last weekend.",
"The weather has been absolutely terrible all week.",
"Have you seen the new film everyone is talking about?",
"I'll give you a call when I get home tonight.",
"Can you believe how expensive everything is these days?",
"My brother works as a lawyer in the city centre.",
"Let's meet at half past eight outside the restaurant.",
"I can't find my car keys anywhere."
];
window.ACCENTS_INFO = {
'en-GB': { name: 'Británico', flag: '🇬🇧', tip: 'La r final no suena (car = «caa»). La t suele ser clara y la «a» de «bath» es larga.' },
'en-US': { name: 'Americano', flag: '🇺🇸', tip: 'La r se pronuncia siempre. La t entre vocales suena como una d suave (water = «wader»).' },
'en-AU': { name: 'Australiano', flag: '🇦🇺', tip: 'Las vocales se alargan y cambian («day» suena casi «die»). Entonación que sube al final.' },
'en-IE': { name: 'Irlandés', flag: '🇮🇪', tip: 'La r se pronuncia, la «th» suena casi como t o d, y tiene un ritmo muy melódico.' },
'en-IN': { name: 'Indio', flag: '🇮🇳', tip: 'Consonantes muy marcadas, la t y la d se hacen con la lengua más atrás y el ritmo es más silábico.' },
'en-ZA': { name: 'Sudafricano', flag: '🇿🇦', tip: 'Vocales cortas y cerradas; algo entre británico y australiano.' },
'en-NZ': { name: 'Neozelandés', flag: '🇳🇿', tip: 'La «i» corta suena casi como una vocal neutra (fish ≈ «fush»).' },
'en-SC': { name: 'Escocés', flag: '🏴', tip: 'La r se hace vibrar y las vocales son cortas.' }
};

/* Recursos de nativos reales: canales y podcasts para escuchar inglés auténtico */
window.RESOURCES = [
{ group: 'Para empezar a acostumbrar el oído', items: [
  ['BBC Learning English · 6 Minute English', 'Conversaciones cortas sobre temas de actualidad, con vocabulario explicado. Ideal cada día.', 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english'],
  ['BBC Learning English (YouTube)', 'Vídeos cortos de pronunciación, expresiones y noticias para estudiantes.', 'https://www.youtube.com/@bbclearningenglish'],
  ['English with Lucy (YouTube)', 'Pronunciación británica, vocabulario y errores típicos.', 'https://www.youtube.com/@EnglishwithLucy'],
  ['Rachel\'s English (YouTube)', 'Pronunciación americana y connected speech explicado al detalle.', 'https://www.youtube.com/@rachelsenglish']
] },
{ group: 'Inglés real de nativos (para el día a día)', items: [
  ['The Rest Is Politics', 'Dos británicos charlando con naturalidad de política y actualidad.', 'https://www.youtube.com/channel/UCsufaClk5if2RGqABb-09Uw'],
  ['Desert Island Discs (BBC Radio 4)', 'Entrevistas largas y muy naturales a personajes británicos.', 'https://www.bbc.co.uk/programmes/b006qnmr'],
  ['TED Talks', 'Charlas de 10-15 minutos con subtítulos y transcripción.', 'https://www.ted.com/talks'],
  ['The Diary of a CEO (YouTube)', 'Entrevistas largas sobre negocios y vida, inglés británico informal.', 'https://www.youtube.com/@TheDiaryOfACEO']
] },
{ group: 'Inglés jurídico y de negocios', items: [
  ['The Economist Podcasts', 'Economía y actualidad en inglés británico cuidado.', 'https://www.economist.com/podcasts'],
  ['Financial Times · Behind the Money', 'Historias de empresas y mercados.', 'https://podcasts.apple.com/podcast/id1376303362'],
  ['UK Supreme Court (YouTube)', 'Resúmenes de sentencias leídos por los propios jueces del Tribunal Supremo británico.', 'https://www.youtube.com/user/UKSupremeCourt'],
  ['Legal Cheek', 'Noticias y consejos para futuros abogados en el Reino Unido.', 'https://www.legalcheek.com']
] },
{ group: 'Series y películas recomendadas para aprender', items: [
  ['The Office (UK) / Ted Lasso / Fleabag', 'Humor británico y conversaciones cotidianas, con muchas expresiones coloquiales.', ''],
  ['Suits / The Good Wife', 'Inglés jurídico americano en contexto (con mucha ficción, ojo).', ''],
  ['Consejo', 'Primero con subtítulos en inglés, nunca en español. Repite en voz alta las frases que te gusten y guárdalas en Mío.', '']
] }
];
