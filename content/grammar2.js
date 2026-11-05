/* Gramática (ampliación) */
window.GRAMMAR.push(
{ id: 'pastcont', title: 'Past continuous y past perfect', es: 'Contar historias en pasado',
  intro: 'Para contar algo que pasó, el past simple cuenta las acciones principales, el past continuous describe lo que estaba pasando de fondo y el past perfect habla de algo anterior a otro momento del pasado.',
  points: [
    ['Acción en progreso en el pasado → was/were + -ing.', ['I was having dinner when you called.']],
    ['Acción que interrumpe → past simple.', ['While I was walking home, it started to rain.']],
    ['Algo anterior a otro pasado → had + participio.', ['When I arrived, the film had already started.']],
    ['Con by the time, already, before → muy típico el past perfect.', ['By the time we got there, everyone had left.']]
  ],
  ex: [
    ['I ___ TV when the lights went out.', 'was watching', ['watched', 'was watching', 'had watched'], 'Acción en progreso interrumpida.'],
    ['When we arrived, the train ___.', 'had left', ['left', 'was leaving', 'had left'], 'Ya se había ido antes de llegar.'],
    ['What ___ you doing at 10 last night?', 'were', ['did', 'were', 'had'], 'En progreso en un momento concreto.'],
    ['She ___ her keys, so she couldn\'t get in.', 'had lost', ['lost', 'had lost', 'was losing'], 'Algo anterior a otro pasado.'],
    ['While they ___, the phone rang.', 'were talking', ['talked', 'were talking', 'had talked'], 'While + acción en progreso.'],
    ['I ___ him before the party, so I recognised him.', 'had met', ['met', 'had met', 'was meeting'], 'Anterior al momento de la fiesta.'],
    ['It ___ when I left the house.', 'was raining', ['rained', 'was raining', 'had rained'], 'Descripción de fondo.'],
    ['By the time the police came, the thief ___.', 'had escaped', ['escaped', 'was escaping', 'had escaped'], 'By the time → past perfect.']
  ] },
{ id: 'perfectcont', title: 'Present perfect continuous', es: 'Llevo X tiempo haciendo algo',
  intro: 'Se usa para actividades que empezaron en el pasado y siguen ahora, o que acaban de terminar y se notan sus efectos. Es lo que en español decimos con «llevo… haciendo».',
  points: [
    ['Duración hasta ahora → have been + -ing + for/since.', ['I\'ve been studying English for ten years.']],
    ['Efecto visible de algo reciente.', ['You look tired. Have you been running?']],
    ['How long…? se responde con este tiempo.', ['How long have you been waiting?']],
    ['Con verbos de estado se usa present perfect simple.', ['I\'ve known her for years. (no: been knowing)']]
  ],
  ex: [
    ['I ___ here since 9 o\'clock.', 'have been waiting', ['wait', 'have been waiting', 'am waiting'], 'Llevo esperando desde las 9.'],
    ['How long ___ you been learning English?', 'have', ['did', 'have', 'are'], 'How long + present perfect continuous.'],
    ['Your eyes are red. ___ you been crying?', 'Have', ['Did', 'Have', 'Were'], 'Efecto visible ahora.'],
    ['She ___ for the firm for three years.', 'has been working', ['works', 'is working', 'has been working'], 'Duración hasta ahora.'],
    ['I ___ him since we were kids.', 'have known', ['have been knowing', 'have known', 'know'], 'Know es de estado.'],
    ['It ___ all day. The streets are wet.', 'has been raining', ['rains', 'has been raining', 'rained'], 'Actividad que se nota ahora.'],
    ['We ___ about this for hours and still don\'t agree.', 'have been talking', ['talk', 'have been talking', 'talked'], 'Actividad continuada.'],
    ['He ___ to the gym since January.', 'has been going', ['goes', 'went', 'has been going'], 'Desde enero hasta ahora.']
  ] },
{ id: 'relative', title: 'Oraciones de relativo', es: 'Who, which, that, whose, where',
  intro: 'Sirven para dar información sobre algo o alguien sin empezar una frase nueva. Who para personas, which para cosas, that para ambas (en las definitorias), whose para posesión y where para lugares.',
  points: [
    ['Personas → who / that.', ['The lawyer who represented me was great.']],
    ['Cosas → which / that.', ['The book that I bought is amazing.']],
    ['Posesión → whose.', ['That\'s the man whose car was stolen.']],
    ['Lugares → where.', ['This is the café where we met.']],
    ['Información extra entre comas: no se usa that.', ['My brother, who lives in London, is a doctor.']],
    ['Si el relativo es objeto, se puede omitir.', ['The film (that) we saw was great.']]
  ],
  ex: [
    ['The woman ___ lives next door is a judge.', 'who', ['who', 'which', 'whose'], 'Persona → who.'],
    ['This is the restaurant ___ we had our first date.', 'where', ['which', 'where', 'that'], 'Lugar → where.'],
    ['The client ___ company we bought is very happy.', 'whose', ['who', 'whose', 'which'], 'Posesión → whose.'],
    ['The contract, ___ was signed yesterday, is now binding.', 'which', ['that', 'which', 'who'], 'Entre comas no va that.'],
    ['Is this the phone ___ you lost?', 'that', ['who', 'that', 'where'], 'Cosa → that/which.'],
    ['My sister, ___ is a doctor, lives in Dublin.', 'who', ['that', 'who', 'which'], 'Persona entre comas → who.'],
    ['I know a guy ___ brother plays for Valencia.', 'whose', ['who', 'whose', 'that'], 'Posesión.'],
    ['That\'s the reason ___ I called you.', 'why', ['why', 'which', 'where'], 'Reason why.']
  ] },
{ id: 'comparatives', title: 'Comparativos y superlativos', es: 'Más, menos, el más…',
  intro: 'Adjetivos cortos añaden -er / -est. Los largos usan more / the most. Hay irregulares que hay que memorizar.',
  points: [
    ['Cortos → -er than / the -est.', ['Madrid is bigger than Valencia.', 'It\'s the tallest building in Spain.']],
    ['Largos → more … than / the most …', ['This exam is more difficult than the last one.']],
    ['Irregulares: good-better-best, bad-worse-worst, far-further-furthest.', ['This is the best paella I\'ve ever had.']],
    ['Igualdad → as … as. Desigualdad → not as … as.', ['He\'s as tall as me.', 'It\'s not as cold as yesterday.']],
    ['Cuanto más… más → the + comparativo, the + comparativo.', ['The more you practise, the better you get.']]
  ],
  ex: [
    ['London is ___ than Valencia.', 'bigger', ['more big', 'bigger', 'biggest'], 'Corto → -er.'],
    ['This is the ___ day of my life!', 'best', ['better', 'best', 'goodest'], 'Superlativo irregular de good.'],
    ['English is ___ than Chinese.', 'easier', ['more easy', 'easier', 'easyer'], 'Easy → easier.'],
    ['He\'s ___ intelligent person I know.', 'the most', ['the more', 'the most', 'most'], 'Largo → the most.'],
    ['My English isn\'t as good ___ yours.', 'as', ['than', 'as', 'like'], 'As … as.'],
    ['The more you read, the ___ you learn.', 'more', ['most', 'more', 'much'], 'The more… the more.'],
    ['Today is ___ than yesterday.', 'worse', ['badder', 'worse', 'worst'], 'Bad → worse.'],
    ['This is the ___ expensive hotel in town.', 'least', ['less', 'least', 'fewer'], 'El menos → the least.']
  ] },
{ id: 'wish', title: 'Wish e if only', es: 'Ojalá, lamentos y deseos',
  intro: 'Wish sirve para expresar deseos sobre el presente (con past) o lamentos sobre el pasado (con past perfect). Wish + would se usa para quejarse de lo que hace otra persona.',
  points: [
    ['Deseo sobre el presente → wish + past.', ['I wish I had more time.', 'I wish I were taller.']],
    ['Lamento sobre el pasado → wish + had + participio.', ['I wish I had studied harder.']],
    ['Queja sobre otra persona → wish + would.', ['I wish you would stop talking.']],
    ['If only es igual pero más intenso.', ['If only I had listened to you!']]
  ],
  ex: [
    ['I wish I ___ speak Chinese.', 'could', ['can', 'could', 'will'], 'Deseo presente → could.'],
    ['I wish I ___ that. I\'m sorry.', 'hadn\'t said', ['didn\'t say', 'hadn\'t said', 'wouldn\'t say'], 'Lamento pasado.'],
    ['I wish it ___ so cold today.', 'wasn\'t', ['isn\'t', 'wasn\'t', 'won\'t be'], 'Deseo presente → past.'],
    ['I wish you ___ stop interrupting me!', 'would', ['will', 'would', 'did'], 'Queja → would.'],
    ['If only I ___ more money!', 'had', ['have', 'had', 'would have'], 'Deseo presente.'],
    ['She wishes she ___ to the party last night.', 'had gone', ['went', 'had gone', 'would go'], 'Pasado → had gone.'],
    ['I wish I ___ in London.', 'lived', ['live', 'lived', 'will live'], 'Deseo presente → past.'],
    ['I wish I ___ the job. It was a great opportunity.', 'had accepted', ['accepted', 'had accepted', 'would accept'], 'Lamento pasado.']
  ] },
{ id: 'modalsdeduction', title: 'Must, might, can\'t (deducción)', es: 'Debe de, puede que, no puede ser',
  intro: 'Los modales también sirven para hacer suposiciones. Must indica casi seguro que sí, might o may que es posible y can\'t que es casi seguro que no. Para el pasado se usa modal + have + participio.',
  points: [
    ['Casi seguro → must.', ['She\'s not answering. She must be busy.']],
    ['Posible → might / may / could.', ['He might be at the gym.']],
    ['Imposible → can\'t.', ['That can\'t be true!']],
    ['Pasado → must have / might have / can\'t have + participio.', ['He must have forgotten.', 'She can\'t have seen us.']]
  ],
  ex: [
    ['The lights are off. They ___ be out.', 'must', ['must', 'can\'t', 'should'], 'Deducción casi segura.'],
    ['He ___ be 50! He looks 30.', 'can\'t', ['must', 'can\'t', 'might'], 'Imposible.'],
    ['I\'m not sure. She ___ come later.', 'might', ['must', 'might', 'can\'t'], 'Posibilidad.'],
    ['You ___ have been very tired after the flight.', 'must', ['must', 'can\'t', 'should'], 'Deducción sobre el pasado.'],
    ['He ___ have stolen it. He was with me all day.', 'can\'t', ['must', 'can\'t', 'might'], 'Imposible en el pasado.'],
    ['Where\'s my phone? I ___ have left it at the office.', 'might', ['must', 'might', 'can'], 'Posibilidad en el pasado.'],
    ['You\'ve been working all day. You ___ be exhausted.', 'must', ['must', 'can\'t', 'mustn\'t'], 'Casi seguro.'],
    ['She ___ have heard the news yet. She\'d have called.', 'can\'t', ['must', 'can\'t', 'should'], 'Deducción negativa.']
  ] },
{ id: 'causative', title: 'Have / get something done', es: 'Encargar que te hagan algo',
  intro: 'Se usa cuando otra persona hace algo por ti, normalmente porque lo pagas. En español decimos «me corto el pelo» aunque no te lo cortes tú.',
  points: [
    ['have + objeto + participio.', ['I had my hair cut yesterday.']],
    ['get es más informal.', ['I need to get my car fixed.']],
    ['También para cosas malas que te pasan.', ['He had his phone stolen.']]
  ],
  ex: [
    ['I\'m going to have my hair ___ tomorrow.', 'cut', ['cut', 'cutting', 'to cut'], 'Participio.'],
    ['We had our house ___ last year.', 'painted', ['paint', 'painted', 'painting'], 'Participio.'],
    ['She got her car ___ at the garage.', 'repaired', ['repair', 'repaired', 'to repair'], 'Get + objeto + participio.'],
    ['He ___ his wallet stolen on the metro.', 'had', ['had', 'made', 'did'], 'Algo malo que le pasó.'],
    ['Where do you get your suits ___?', 'made', ['make', 'made', 'making'], 'Participio.'],
    ['I need to ___ my eyes tested.', 'get', ['make', 'get', 'do'], 'Get something done.'],
    ['They\'re having a new kitchen ___.', 'installed', ['install', 'installed', 'installing'], 'Participio.'],
    ['I ___ the contract translated by a professional.', 'had', ['had', 'did', 'made'], 'Have something done.']
  ] },
{ id: 'countable', title: 'Contables e incontables', es: 'Much, many, a lot of, few, little',
  intro: 'En inglés muchas cosas son incontables (no tienen plural): information, advice, money, furniture, news, work, luggage. Con ellas se usa much y little; con contables, many y few.',
  points: [
    ['Contables → many, few, a few, how many.', ['How many people came?']],
    ['Incontables → much, little, a little, how much.', ['How much time do we have?']],
    ['A lot of / lots of sirven para los dos.', ['A lot of money / a lot of friends.']],
    ['Few / little = poco (negativo). A few / a little = algunos (positivo).', ['I have a few friends here.', 'There\'s little hope.']]
  ],
  ex: [
    ['How ___ money do you need?', 'much', ['many', 'much', 'few'], 'Money es incontable.'],
    ['There aren\'t ___ people here.', 'many', ['much', 'many', 'little'], 'People es contable.'],
    ['Can you give me ___ advice?', 'some', ['an', 'some', 'many'], 'Advice incontable.'],
    ['I have ___ friends in London, so I won\'t be lonely.', 'a few', ['a few', 'a little', 'few'], 'Contable y positivo.'],
    ['We have very ___ time left.', 'little', ['few', 'little', 'many'], 'Time incontable, negativo.'],
    ['The ___ is good today.', 'news', ['new', 'news', 'newses'], 'News es incontable, verbo singular.'],
    ['How many ___ do you have?', 'suitcases', ['luggages', 'luggage', 'suitcases'], 'Luggage no tiene plural; suitcase sí.'],
    ['I need ___ information about the course.', 'some', ['an', 'some', 'many'], 'Information incontable.']
  ] },
{ id: 'inversion', title: 'Inversión y énfasis', es: 'Never have I…, What I need is…',
  intro: 'Para sonar más formal o enfático, el inglés invierte el orden después de expresiones negativas, o usa frases hendidas como «What I need is…». Muy útil en discursos y escritos.',
  points: [
    ['Never / rarely / seldom + auxiliar + sujeto.', ['Never have I seen such a mess.']],
    ['Not only… but also.', ['Not only is it cheap, but it\'s also good.']],
    ['No sooner… than / Hardly… when.', ['No sooner had I arrived than it started raining.']],
    ['Frases hendidas: What I need is… / It was John who…', ['What I really need is a holiday.', 'It was Laura who found the mistake.']]
  ],
  ex: [
    ['Never ___ such a beautiful view.', 'have I seen', ['I have seen', 'have I seen', 'I saw'], 'Inversión tras never.'],
    ['Not only ___ late, but he also forgot the documents.', 'was he', ['he was', 'was he', 'he is'], 'Not only + inversión.'],
    ['No sooner had we sat down ___ the phone rang.', 'than', ['when', 'than', 'that'], 'No sooner… than.'],
    ['What I need ___ a good night\'s sleep.', 'is', ['is', 'are', 'it\'s'], 'What I need is…'],
    ['It was my sister ___ told me.', 'who', ['who', 'which', 'what'], 'It was… who.'],
    ['Rarely ___ such good results.', 'do we see', ['we see', 'do we see', 'we do see'], 'Inversión con do.'],
    ['Hardly had I left ___ it started to snow.', 'when', ['than', 'when', 'that'], 'Hardly… when.'],
    ['Under no circumstances ___ open this door.', 'should you', ['you should', 'should you', 'you must'], 'Inversión formal.']
  ] },
{ id: 'formalinformal', title: 'Formal vs informal', es: 'Hablar con un amigo o con un cliente',
  intro: 'El inglés cambia mucho según con quién hablas. En el trabajo y con clientes se usan frases más largas, verbos de origen latino y fórmulas de cortesía. Con amigos se usan phrasal verbs, contracciones y frases cortas.',
  points: [
    ['Informal: phrasal verbs y contracciones. Formal: verbos latinos.', ['find out → discover', 'get → receive / obtain', 'ask for → request']],
    ['Peticiones más educadas con could / would.', ['Give me the file → Could you send me the file, please?']],
    ['Suavizar con I\'m afraid, unfortunately, it seems.', ['I\'m afraid we can\'t accept that.']],
    ['En emails formales, nada de abreviaturas ni emojis.', ['Thanks! → Thank you for your help.']]
  ],
  ex: [
    ['Formal version of "get": We ___ your application yesterday.', 'received', ['got', 'received', 'took'], 'Receive es más formal.'],
    ['More polite: ___ you send me the report, please?', 'Could', ['Can', 'Could', 'Will'], 'Could es más educado.'],
    ['Formal for "find out": We need to ___ the cause.', 'determine', ['find out', 'determine', 'figure'], 'Determine es formal.'],
    ['Softening bad news: ___, the meeting has been cancelled.', 'Unfortunately', ['Anyway', 'Unfortunately', 'Basically'], 'Unfortunately suaviza.'],
    ['Formal: I would like to ___ a meeting.', 'request', ['ask', 'request', 'want'], 'Request es formal.'],
    ['Informal: Let\'s ___ for a coffee later.', 'meet up', ['convene', 'meet up', 'assemble'], 'Meet up es informal.'],
    ['Formal email ending:', 'Kind regards', ['Cheers', 'Kind regards', 'See ya'], 'Kind regards es neutral-formal.'],
    ['Formal for "help": We will ___ you with the process.', 'assist', ['help out', 'assist', 'give a hand'], 'Assist es formal.']
  ] },
{ id: 'futureperfect', title: 'Futuro continuo y futuro perfecto', es: 'Estaré haciendo, habré hecho',
  intro: 'Will be + -ing describe algo que estará en progreso en un momento del futuro. Will have + participio habla de algo que ya estará terminado antes de un momento futuro.',
  points: [
    ['Futuro continuo → will be + -ing.', ['This time tomorrow I\'ll be flying to London.']],
    ['Futuro perfecto → will have + participio (+ by).', ['By June, I\'ll have finished my degree.']],
    ['Para preguntar con educación por planes.', ['Will you be using the car tonight?']]
  ],
  ex: [
    ['This time next week, I ___ on a beach.', 'will be lying', ['will lie', 'will be lying', 'will have lain'], 'En progreso en el futuro.'],
    ['By 2030, I ___ as a lawyer for five years.', 'will have worked', ['will work', 'will be working', 'will have worked'], 'Terminado antes de un momento futuro.'],
    ['Don\'t call at 8. We ___ dinner.', 'will be having', ['will have', 'will be having', 'have had'], 'En progreso.'],
    ['By the time you arrive, I ___ the report.', 'will have finished', ['will finish', 'will have finished', 'finish'], 'By the time → futuro perfecto.'],
    ['___ you be using your laptop later?', 'Will', ['Do', 'Will', 'Are'], 'Pregunta educada.'],
    ['In ten years, they ___ a cure.', 'will have found', ['will find', 'will have found', 'found'], 'Terminado antes de esa fecha.'],
    ['At midnight I ___ still studying.', 'will be', ['will be', 'will have', 'am'], 'Futuro continuo.'],
    ['She ___ her exams by Friday.', 'will have done', ['will do', 'will have done', 'does'], 'By + futuro perfecto.']
  ] }
);
