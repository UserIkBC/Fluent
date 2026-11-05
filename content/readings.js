/* Lecturas cortas con audio. quiz: [pregunta, [opciones], índice correcto] */
window.READINGS = [
{ id: 'r-language', level: 'B1+', topic: 'Aprender', legal: false,
  headline: 'Why adults can still learn a language well',
  standfirst: 'Children are not the only ones who can become fluent. Adults just need a different strategy.',
  body: [
    'Many people believe that if you don\'t learn a language as a child, you will never speak it well. It is true that children often end up with a better accent. But adults have important advantages: they can read, they understand grammar, and they know how to organise their time.',
    'The biggest difference is not age, but exposure. A child hears the language for hours every day, without pressure. Most adults, on the other hand, study for an hour a week and then wonder why they can\'t follow a conversation.',
    'Experts agree on a few simple ideas. First, listen a lot, even if you don\'t understand everything. Your brain gets used to the rhythm and the sounds. Second, learn words in groups, not alone. It is more useful to learn "make a decision" than just "decision". Third, speak from the beginning. Mistakes are not a problem; they are part of the process.',
    'Finally, be patient. Fluency doesn\'t arrive one morning. It grows slowly, and one day you realise you have been talking for ten minutes without thinking about it.'
  ],
  vocab: [['to end up with', 'acabar teniendo', 'Children often end up with a better accent.'], ['exposure', 'exposición, contacto', 'Exposure to the language is the key.'], ['to wonder', 'preguntarse', 'I wonder why he left.'], ['to get used to', 'acostumbrarse a', 'Your brain gets used to the sounds.'], ['to realise', 'darse cuenta', 'I realised I was late.']],
  quiz: [['What is the main difference between children and adults, according to the text?', ['Age', 'Exposure to the language', 'Intelligence'], 1], ['Why is it better to learn words in groups?', ['They are easier to spell', 'They are more useful when speaking', 'Teachers prefer it'], 1], ['What does the text say about mistakes?', ['You should avoid them', 'They are part of learning', 'They show you are not ready'], 1]],
  questions: ['How do you usually learn new words? Does it work for you?', 'What is the most difficult part of English for you, and why?'] },
{ id: 'r-dinner', level: 'B1', topic: 'Cultura', legal: false,
  headline: 'Why do Spaniards eat so late?',
  standfirst: 'Lunch at three and dinner at ten surprise most visitors. The reason may be a clock.',
  body: [
    'Visitors to Spain are often surprised by the timetable. Shops close in the afternoon, people have lunch at around two or three o\'clock, and restaurants are almost empty before nine in the evening.',
    'One popular explanation is the time zone. Geographically, most of Spain should be in the same time zone as the United Kingdom and Portugal. But in 1940, Spain moved its clocks forward one hour to match Germany and central Europe, and it never changed them back.',
    'As a result, the sun rises and sets later in Spain than the clock suggests. When it is two o\'clock in Madrid, the sun is closer to its highest point than it would normally be at that hour. So, in a way, Spaniards are not eating late; their clocks are early.',
    'Of course, culture also matters. Long lunches with family, the heat of the summer and a strong social life all play a role. Some experts argue that Spain should change its time zone, but for now, the late dinners are here to stay.'
  ],
  vocab: [['a timetable', 'un horario', 'The timetable changes in summer.'], ['to move the clocks forward', 'adelantar los relojes', 'We move the clocks forward in March.'], ['to rise / to set', 'salir / ponerse (el sol)', 'The sun sets at nine in July.'], ['to play a role', 'influir, tener un papel', 'Culture plays a role too.'], ['here to stay', 'para quedarse', 'Remote work is here to stay.']],
  quiz: [['When did Spain change its time zone?', ['In 1940', 'In 1975', 'In 1992'], 0], ['Which country did Spain match?', ['Portugal', 'The UK', 'Germany'], 2], ['According to the text, what else explains the timetable?', ['Only the weather', 'Culture, heat and social life', 'Work laws'], 1]],
  questions: ['Would you like Spain to change its time zone? Why?', 'Describe a typical day in your life, with times.'] },
{ id: 'r-remote', level: 'B1+', topic: 'Trabajo', legal: false,
  headline: 'Working from home: freedom or loneliness?',
  standfirst: 'Millions of people now work from home at least once a week. Not everyone is happy about it.',
  body: [
    'Before 2020, working from home was a privilege for a few. Today, it is normal in many offices, and a large number of workers spend at least one or two days a week at home.',
    'The advantages are clear. People save time and money on commuting, they can organise their day more freely, and many say they concentrate better without the noise of an open-plan office.',
    'However, there are downsides. Some workers feel lonely and miss the small conversations by the coffee machine. Young employees, in particular, say it is harder to learn from experienced colleagues when everyone is at home. Others find it difficult to switch off, because their kitchen table has become their desk.',
    'Many companies have chosen a middle way, known as hybrid working. Employees come to the office on some days and work from home on others. It is not perfect, but for many people it offers the best of both worlds.'
  ],
  vocab: [['a privilege', 'un privilegio', 'Travelling is a privilege.'], ['commuting', 'desplazamientos al trabajo', 'Commuting takes me an hour a day.'], ['a downside', 'una desventaja', 'The only downside is the price.'], ['to switch off', 'desconectar', 'I can\'t switch off at weekends.'], ['the best of both worlds', 'lo mejor de los dos mundos', 'Living near the city and the sea is the best of both worlds.']],
  quiz: [['Why do some young workers dislike working from home?', ['They earn less', 'It\'s harder to learn from colleagues', 'They have no computer'], 1], ['What is hybrid working?', ['Working only at night', 'Mixing office days and home days', 'Working for two companies'], 1], ['Which is NOT mentioned as an advantage?', ['Saving money', 'Better concentration', 'A higher salary'], 2]],
  questions: ['Would you prefer to work from home or in an office? Why?', 'What do you think law firms lose if lawyers work from home?'] },
{ id: 'r-sleep', level: 'B1+', topic: 'Salud', legal: false,
  headline: 'Sleep: the secret weapon of good students',
  standfirst: 'Staying up all night before an exam may be the worst thing you can do.',
  body: [
    'Many students believe that sleeping less gives them more time to study. Research suggests the opposite. While we sleep, the brain organises what we learned during the day and stores it in long-term memory.',
    'In several experiments, people who slept after learning new information remembered much more the next day than people who stayed awake. Sleep also helps us to make connections between ideas, which is essential for solving problems.',
    'Lack of sleep, on the other hand, affects concentration, mood and even our ability to make decisions. After a night without sleep, a person can perform as badly as someone who has drunk alcohol.',
    'So, what is the advice? Try to sleep seven to nine hours a night, go to bed at roughly the same time every day, and avoid screens just before bed. And the night before an exam, close your books and get some rest.'
  ],
  vocab: [['the opposite', 'lo contrario', 'He did the opposite of what I said.'], ['to store', 'almacenar', 'The brain stores information while we sleep.'], ['to stay awake', 'quedarse despierto', 'I stayed awake all night.'], ['lack of', 'falta de', 'Lack of sleep is dangerous.'], ['roughly', 'más o menos', 'It takes roughly an hour.']],
  quiz: [['What does the brain do while we sleep?', ['Nothing important', 'Organises and stores what we learned', 'Forgets everything'], 1], ['How many hours of sleep does the text recommend?', ['Five to six', 'Seven to nine', 'Ten or more'], 1], ['What should you do the night before an exam?', ['Study all night', 'Rest', 'Drink coffee'], 1]],
  questions: ['How many hours do you usually sleep? Is it enough?', 'What do you do to relax before going to bed?'] },
{ id: 'r-london', level: 'B1', topic: 'Viajes', legal: false,
  headline: 'Getting around London like a local',
  standfirst: 'A few simple tips to survive the Tube and look less like a tourist.',
  body: [
    'London is huge, but it is easy to get around if you know a few tricks. The underground, known as the Tube, is usually the fastest option. You don\'t need to buy paper tickets: just tap your contactless bank card or your phone at the barrier when you go in and when you come out.',
    'On the escalators, stand on the right and walk on the left. Londoners take this rule very seriously, and blocking the left side is one of the quickest ways to annoy them.',
    'Buses are cheaper than the Tube and a great way to see the city. Sit upstairs at the front of a red double-decker bus and you get a free sightseeing tour.',
    'Finally, remember that the city is full of surprises. Some stations are very close to each other, so walking is often faster than taking the train. And always carry an umbrella. Even in summer, the weather can change in minutes.'
  ],
  vocab: [['to get around', 'moverse (por una ciudad)', 'It\'s easy to get around by bike.'], ['to tap', 'pasar, acercar (una tarjeta)', 'Tap your card at the barrier.'], ['to annoy', 'molestar, fastidiar', 'Loud music annoys me.'], ['upstairs', 'arriba, en el piso de arriba', 'Let\'s sit upstairs.'], ['to carry', 'llevar (encima)', 'I always carry a charger.']],
  quiz: [['How do you pay on the Tube, according to the text?', ['With a paper ticket', 'By tapping a contactless card or phone', 'You pay the driver'], 1], ['Which side of the escalator should you stand on?', ['Left', 'Right', 'Either side'], 1], ['Why is it a good idea to sit upstairs on a bus?', ['It\'s cheaper', 'You get great views of the city', 'It\'s faster'], 1]],
  questions: ['Describe how to get around your city to a foreign visitor.', 'Which city would you like to live in for a year, and why?'] },
{ id: 'r-four-day', level: 'B2', topic: 'Sociedad', legal: false,
  headline: 'Is the four-day week the future?',
  standfirst: 'Several trials suggest that working less does not always mean producing less.',
  body: [
    'The idea sounds too good to be true: work four days a week, keep the same salary, and do the same amount of work. Yet in recent years, companies in the United Kingdom, Spain, Iceland and other countries have tested exactly that.',
    'Supporters say the results are encouraging. In many trials, employees reported less stress and fewer sick days, while productivity stayed the same or even improved. Companies also found it easier to attract and keep talented staff.',
    'Critics are more cautious. They point out that a four-day week works better in offices than in hospitals, schools or shops, which need people every day. Others worry that some workers simply squeeze five days of work into four, which can lead to burnout.',
    'For now, the four-day week remains an experiment rather than the norm. But the debate has made many people question something we rarely think about: why do we work five days in the first place?'
  ],
  vocab: [['too good to be true', 'demasiado bueno para ser verdad', 'The offer seemed too good to be true.'], ['a trial', 'una prueba, un ensayo (también: juicio)', 'The trial lasted six months.'], ['encouraging', 'alentador', 'The first results are encouraging.'], ['to squeeze into', 'meter a presión en', 'I squeezed a lot of work into one day.'], ['burnout', 'agotamiento (laboral), estar quemado', 'Long hours can lead to burnout.']],
  quiz: [['What happened to productivity in many trials?', ['It fell sharply', 'It stayed the same or improved', 'Nobody measured it'], 1], ['Why are critics cautious?', ['It\'s illegal', 'It doesn\'t suit every type of job', 'Workers don\'t want it'], 1], ['What is the risk of squeezing five days into four?', ['Burnout', 'Lower salaries', 'More holidays'], 0]],
  questions: ['Would a four-day week work in a law firm? Why or why not?', 'If you had an extra free day every week, what would you do with it?'] },
{ id: 'r-trainee', level: 'B2', topic: 'Jurídico', legal: true,
  headline: 'A day in the life of a trainee lawyer in London',
  standfirst: 'Long hours, big deals and a lot of learning. What is it really like to start at a top firm?',
  body: [
    'Sofia is a trainee solicitor at a large law firm in the City of London. Her training contract lasts two years and is divided into four "seats" of six months each, in different departments such as corporate, litigation, real estate and banking.',
    'Her day usually starts at around nine. The first hour is for emails: clients, partners and lawyers from other firms all expect quick answers. Then comes the real work. This week she is in the corporate team, helping with due diligence on a company that a client wants to buy. That means reading dozens of contracts and flagging anything unusual, such as change of control clauses or unlimited liability.',
    'In the afternoon she joins a call with the client. Her job is mainly to listen and take notes, but sometimes the partner asks her to explain a point. "The first time, I was terrified," she says. "Now I prepare a few key points before every call."',
    'Some days finish at seven. Others, when a deal is about to close, finish well after midnight. "It\'s intense," Sofia admits, "but you learn more in one year than in all your years at university."'
  ],
  vocab: [['a training contract', 'contrato de formación (periodo de prácticas en Reino Unido)', 'She has a training contract at a City firm.'], ['a seat', 'rotación (en un departamento)', 'My next seat is in litigation.'], ['to flag', 'señalar, marcar', 'Flag any unusual clauses.'], ['change of control clause', 'cláusula de cambio de control', 'The contract has a change of control clause.'], ['to be about to', 'estar a punto de', 'The deal is about to close.']],
  quiz: [['How long is Sofia\'s training contract?', ['One year', 'Two years', 'Four years'], 1], ['What is she doing in the corporate team?', ['Going to court', 'Due diligence on a company', 'Writing laws'], 1], ['What does she do now before every call?', ['She prepares key points', 'She asks the partner to speak', 'She records the call'], 0]],
  questions: ['What would you find most difficult about Sofia\'s job?', 'Which department would you like to work in first, and why?'] },
{ id: 'r-contract', level: 'B2', topic: 'Jurídico', legal: true,
  headline: 'Five clauses every contract lawyer checks first',
  standfirst: 'Contracts can be long and boring, but a few clauses usually decide who wins if something goes wrong.',
  body: [
    'When an experienced lawyer receives a contract to review, they rarely start on page one. Instead, they go straight to the clauses that matter most if the relationship breaks down.',
    'The first is the limitation of liability clause. It says how much each party can be forced to pay if it breaches the contract. A cap that is too low can leave your client without real protection.',
    'Next come the termination provisions. Can your client end the contract early? With how much notice? And what happens to payments already made? Closely linked is the force majeure clause, which explains what happens when events outside anyone\'s control, such as a natural disaster, make performance impossible.',
    'Fourth, the governing law and jurisdiction clauses. They decide which country\'s law applies and which courts, or which arbitration tribunal, will hear a dispute. For an international deal, this can change everything.',
    'Finally, lawyers check the indemnities, which are promises by one party to cover specific losses of the other. They are often the most negotiated part of the whole document.'
  ],
  vocab: [['to break down', 'romperse (una relación, unas negociaciones)', 'The relationship broke down after a year.'], ['a cap', 'un límite máximo', 'There\'s a cap on liability.'], ['notice', 'preaviso', 'You must give 30 days\' notice.'], ['to hear a dispute', 'conocer de un litigio', 'A London tribunal will hear the dispute.'], ['to cover a loss', 'cubrir una pérdida', 'The indemnity covers tax losses.']],
  quiz: [['What does a limitation of liability clause do?', ['Sets the price', 'Limits how much a party can be made to pay', 'Ends the contract'], 1], ['What does force majeure deal with?', ['Events outside the parties\' control', 'Late payments', 'Tax'], 0], ['Which clauses decide which courts hear a dispute?', ['Indemnities', 'Governing law and jurisdiction', 'Termination'], 1]],
  questions: ['Explain in English what a force majeure clause is, as if to a client.', 'Why do you think indemnities are so heavily negotiated?'] }
];
