/* Gramática práctica: explicación sencilla + ejemplos + ejercicios.
   ex: [frase con ___, respuesta, [opciones], explicación] */
window.GRAMMAR = [
{ id: 'present', title: 'Present simple vs present continuous', es: 'Rutinas o lo que pasa ahora',
  intro: 'El present simple se usa para cosas habituales o permanentes. El present continuous, para lo que está pasando ahora o en esta época, y para planes ya organizados.',
  points: [
    ['Rutinas, hábitos y verdades generales → present simple.', ['I work in Valencia.', 'She usually takes the train.', 'Water boils at 100 degrees.']],
    ['Algo que pasa justo ahora o estos días → present continuous.', ['I\'m reading a great book at the moment.', 'He\'s working from home this week.']],
    ['Verbos de estado (know, like, want, need, believe, understand) casi nunca van en continuous.', ['I know the answer. (no: I\'m knowing)', 'Do you understand?']],
    ['Planes ya cerrados para el futuro → present continuous.', ['I\'m meeting Laura tomorrow.']]
  ],
  ex: [
    ['I usually ___ to work by bike.', 'go', ['go', 'am going', 'goes'], 'Es una rutina (usually), así que present simple.'],
    ['Look! It ___ outside.', 'is snowing', ['snows', 'is snowing', 'snowed'], '«Look!» indica que está pasando ahora.'],
    ['I ___ what you mean.', 'know', ['know', 'am knowing', 'knowing'], '«Know» es un verbo de estado: no va en continuous.'],
    ['She ___ for an exam this week, so she\'s busy.', 'is studying', ['studies', 'is studying', 'study'], 'Algo temporal, de esta semana.'],
    ['What time ___ the shop open?', 'does', ['does', 'is', 'do'], 'Horario fijo → present simple con does.'],
    ['We ___ dinner with my parents on Saturday.', 'are having', ['have', 'are having', 'will having'], 'Plan ya organizado → present continuous.'],
    ['He ___ coffee. He prefers tea.', 'doesn\'t drink', ['isn\'t drinking', 'doesn\'t drink', 'don\'t drink'], 'Hábito/gusto general → present simple.'],
    ['Why ___ you laughing?', 'are', ['do', 'are', 'is'], 'Está pasando ahora → are you laughing.']
  ] },
{ id: 'pastperfect', title: 'Past simple vs present perfect', es: 'Ayer o «alguna vez / ya / todavía»',
  intro: 'El past simple habla de un momento terminado y concreto (yesterday, in 2020, last week). El present perfect conecta el pasado con el presente: experiencias, cosas recientes o que siguen.',
  points: [
    ['Momento terminado y concreto → past simple.', ['I saw him yesterday.', 'We went to London in 2023.']],
    ['Experiencias en tu vida, sin decir cuándo → present perfect.', ['Have you ever been to Ireland?', 'I\'ve never tried sushi.']],
    ['Con just, already, yet → present perfect (en inglés británico).', ['I\'ve just finished.', 'Have you finished yet?']],
    ['Algo que empezó en el pasado y sigue → present perfect + for/since.', ['I\'ve lived here for five years.', 'She\'s worked here since 2022.']]
  ],
  ex: [
    ['I ___ to Paris last summer.', 'went', ['went', 'have gone', 'have been'], '«Last summer» es un momento terminado.'],
    ['___ you ever ___ a famous person?', 'Have / met', ['Did / meet', 'Have / met', 'Have / meet'], 'Experiencia sin fecha → present perfect.'],
    ['She ___ here since January.', 'has worked', ['works', 'worked', 'has worked'], '«Since» + algo que sigue → present perfect.'],
    ['I ___ my keys. I can\'t find them anywhere.', 'have lost', ['lost', 'have lost', 'was losing'], 'Resultado en el presente (no las encuentro).'],
    ['When ___ you arrive?', 'did', ['have', 'did', 'were'], 'Preguntar «cuándo» exige past simple.'],
    ['We ___ just ___ lunch.', 'have / had', ['did / have', 'have / had', 'had / had'], '«Just» va con present perfect.'],
    ['I ___ him for ten years. We met at school.', 'have known', ['know', 'knew', 'have known'], 'Le conozco desde hace diez años y sigo conociéndole.'],
    ['He ___ the exam two days ago.', 'passed', ['has passed', 'passed', 'passes'], '«Ago» siempre con past simple.']
  ] },
{ id: 'future', title: 'El futuro: will, going to, present continuous', es: 'Decisiones, planes y predicciones',
  intro: 'Will se usa para decisiones en el momento, promesas y predicciones sin pruebas. Going to, para intenciones y predicciones con pruebas. Present continuous, para planes ya organizados.',
  points: [
    ['Decisión en el momento, ofrecimiento, promesa → will.', ['I\'ll get it!', 'I\'ll call you tonight, I promise.']],
    ['Intención ya pensada → going to.', ['I\'m going to study law in London.']],
    ['Predicción con pruebas → going to.', ['Look at those clouds. It\'s going to rain.']],
    ['Cita o plan organizado → present continuous.', ['I\'m flying to Dublin on Friday.']]
  ],
  ex: [
    ['The phone\'s ringing. — I ___ it.', '\'ll get', ['\'ll get', '\'m going to get', 'get'], 'Decisión en el momento → will.'],
    ['I ___ learn to drive next year. I\'ve already saved the money.', '\'m going to', ['will', '\'m going to', 'am'], 'Intención ya decidida.'],
    ['Careful! You ___ fall!', '\'re going to', ['will', '\'re going to', 'fall'], 'Predicción con pruebas que veo ahora.'],
    ['I ___ my dentist at 4 tomorrow.', '\'m seeing', ['\'m seeing', 'will see', 'see'], 'Cita organizada → present continuous.'],
    ['I think Spain ___ the match.', 'will win', ['will win', 'is winning', 'wins'], 'Opinión/predicción personal → will.'],
    ['Don\'t worry, I ___ tell anyone.', 'won\'t', ['won\'t', 'don\'t', '\'m not going'], 'Promesa → will not = won\'t.'],
    ['What ___ you ___ this weekend?', 'are / doing', ['will / do', 'are / doing', 'do / do'], 'Preguntar por planes → present continuous.'],
    ['It\'s cold. I ___ close the window.', '\'ll', ['\'ll', '\'m', 'going to'], 'Decisión espontánea.']
  ] },
{ id: 'conditionals', title: 'Condicionales (if)', es: 'Si pasa esto, pasará aquello',
  intro: 'Hay cuatro estructuras básicas. Lo más útil para hablar con soltura es dominar el primero (real) y el segundo (imaginario).',
  points: [
    ['Zero: verdades generales. If + present, present.', ['If you heat ice, it melts.']],
    ['First: situaciones reales y posibles. If + present, will.', ['If it rains, we\'ll stay home.']],
    ['Second: situaciones imaginarias. If + past, would.', ['If I won the lottery, I\'d travel the world.', 'If I were you, I\'d accept.']],
    ['Third: pasado que no ocurrió. If + had + participio, would have + participio.', ['If I had studied, I would have passed.']],
    ['Nunca pongas will justo después de if.', ['If you come… (no: If you will come)']]
  ],
  ex: [
    ['If it ___ tomorrow, we\'ll cancel the trip.', 'rains', ['rains', 'will rain', 'rained'], 'Primer condicional: if + present.'],
    ['If I ___ more money, I\'d buy a flat.', 'had', ['have', 'had', 'would have'], 'Situación imaginaria → past.'],
    ['If I were you, I ___ talk to him.', 'would', ['will', 'would', 'did'], 'Consejo con segundo condicional.'],
    ['If she ___ harder, she would have passed.', 'had studied', ['studied', 'had studied', 'would study'], 'Tercer condicional: pasado que no pasó.'],
    ['If you mix red and white, you ___ pink.', 'get', ['get', 'will got', 'would get'], 'Verdad general → zero conditional.'],
    ['I\'ll call you if I ___ any news.', 'get', ['will get', 'get', 'got'], 'Después de if, present (no will).'],
    ['What would you do if you ___ the president?', 'were', ['are', 'were', 'will be'], 'Imaginario → were.'],
    ['If we had left earlier, we ___ the train.', 'wouldn\'t have missed', ['didn\'t miss', 'wouldn\'t miss', 'wouldn\'t have missed'], 'Tercer condicional.']
  ] },
{ id: 'modals', title: 'Consejo y obligación: should, must, have to', es: 'Lo que debes, tienes o no hace falta hacer',
  intro: 'Should es para consejos. Must es una obligación que siente quien habla o una norma escrita. Have to es una obligación externa. Ojo, mustn\'t significa prohibido, pero don\'t have to significa que no hace falta.',
  points: [
    ['Consejo → should / shouldn\'t.', ['You should get some rest.']],
    ['Obligación fuerte o norma → must / have to.', ['I have to wear a suit at work.', 'Passengers must wear seatbelts.']],
    ['Prohibición → mustn\'t.', ['You mustn\'t smoke here.']],
    ['No es necesario → don\'t have to / needn\'t.', ['You don\'t have to come if you don\'t want to.']],
    ['En pasado, must se convierte en had to.', ['I had to work late yesterday.']]
  ],
  ex: [
    ['You look tired. You ___ go to bed early.', 'should', ['should', 'must', 'have'], 'Es un consejo.'],
    ['It\'s Sunday, so I ___ get up early.', 'don\'t have to', ['mustn\'t', 'don\'t have to', 'shouldn\'t to'], 'No es necesario.'],
    ['You ___ use your phone during the exam. It\'s forbidden.', 'mustn\'t', ['mustn\'t', 'don\'t have to', 'needn\'t'], 'Prohibido.'],
    ['Yesterday I ___ wait two hours at the doctor\'s.', 'had to', ['must', 'had to', 'should'], 'Pasado de obligación → had to.'],
    ['Lawyers ___ keep client information confidential.', 'must', ['must', 'should to', 'have'], 'Norma profesional obligatoria.'],
    ['Do I ___ bring anything to the party?', 'have to', ['must', 'have to', 'should to'], 'Pregunta sobre obligación → do I have to.'],
    ['You ___ try the paella here. It\'s amazing.', 'should', ['should', 'must to', 'have'], 'Recomendación (also: must, más enfático).'],
    ['She ___ wear a uniform at her job.', 'has to', ['have to', 'has to', 'must to'], 'Tercera persona → has to.']
  ] },
{ id: 'usedto', title: 'Used to, be used to, get used to', es: 'Lo que solías hacer y a lo que estás acostumbrado',
  intro: 'Tres estructuras muy parecidas que confunden mucho. Used to + verbo habla del pasado. Be used to + -ing significa estar acostumbrado. Get used to + -ing significa acostumbrarse.',
  points: [
    ['Hábito en el pasado que ya no existe → used to + infinitivo.', ['I used to play football every day.']],
    ['Estar acostumbrado → be used to + -ing / nombre.', ['I\'m used to working late.']],
    ['Acostumbrarse (proceso) → get used to + -ing / nombre.', ['I\'m getting used to the cold weather.']],
    ['Negativa y pregunta: didn\'t use to / did you use to.', ['I didn\'t use to like coffee.']]
  ],
  ex: [
    ['I ___ smoke, but I stopped years ago.', 'used to', ['used to', 'am used to', 'get used to'], 'Hábito pasado.'],
    ['She\'s from Finland, so she ___ cold weather.', 'is used to', ['used to', 'is used to', 'uses to'], 'Está acostumbrada.'],
    ['It took me months to ___ driving on the left.', 'get used to', ['use to', 'get used to', 'be use to'], 'Proceso de acostumbrarse.'],
    ['I\'m not used to ___ up so early.', 'getting', ['get', 'getting', 'got'], 'Be used to + -ing.'],
    ['Did you ___ live in Madrid?', 'use to', ['used to', 'use to', 'using to'], 'En preguntas con did → use to.'],
    ['We ___ go to the beach every summer when I was a kid.', 'used to', ['used to', 'were used to', 'got used'], 'Hábito pasado.'],
    ['You\'ll soon get used to ___ in English.', 'working', ['work', 'working', 'worked'], 'Get used to + -ing.'],
    ['He didn\'t ___ be so serious.', 'use to', ['used to', 'use to', 'using'], 'Negativa con didn\'t → use to.']
  ] },
{ id: 'gerund', title: 'Gerundio (-ing) o infinitivo (to)', es: 'Enjoy doing, want to do',
  intro: 'Después de algunos verbos va -ing y después de otros va to + verbo. Después de preposición siempre va -ing. Hay que memorizar los más comunes.',
  points: [
    ['+ -ing: enjoy, avoid, mind, finish, suggest, keep, consider, can\'t stand.', ['I enjoy reading.', 'Do you mind waiting?']],
    ['+ to: want, decide, hope, plan, agree, refuse, manage, seem, afford.', ['I decided to stay.', 'We can\'t afford to wait.']],
    ['Después de preposición → -ing.', ['I\'m interested in learning.', 'Thanks for helping me.']],
    ['Stop + -ing (dejar de) ≠ stop + to (pararse para).', ['I stopped smoking.', 'I stopped to smoke.']],
    ['Remember/forget + to (algo pendiente) ≠ + -ing (recuerdo del pasado).', ['Remember to call him.', 'I remember meeting him.']]
  ],
  ex: [
    ['I really enjoy ___ in the sea.', 'swimming', ['swimming', 'to swim', 'swim'], 'Enjoy + -ing.'],
    ['She decided ___ the job.', 'to take', ['taking', 'to take', 'take'], 'Decide + to.'],
    ['Would you mind ___ the window?', 'opening', ['to open', 'opening', 'open'], 'Mind + -ing.'],
    ['I\'m looking forward to ___ you.', 'seeing', ['see', 'seeing', 'to see'], '«To» aquí es preposición → -ing.'],
    ['He managed ___ the problem.', 'to solve', ['solving', 'to solve', 'solve'], 'Manage + to.'],
    ['Don\'t forget ___ the door.', 'to lock', ['locking', 'to lock', 'lock'], 'Algo pendiente → forget to.'],
    ['I\'m thinking of ___ abroad.', 'moving', ['to move', 'moving', 'move'], 'Después de preposición → -ing.'],
    ['They refused ___ the contract.', 'to sign', ['signing', 'to sign', 'sign'], 'Refuse + to.']
  ] },
{ id: 'questions', title: 'Preguntas: indirectas y question tags', es: 'Preguntar con educación y sonar natural',
  intro: 'Las preguntas indirectas suenan más educadas y no invierten el orden. Las question tags (¿verdad?, ¿no?) son muy típicas del inglés hablado.',
  points: [
    ['Pregunta indirecta: Could you tell me / Do you know + orden normal.', ['Where is the station? → Do you know where the station is?']],
    ['Sin auxiliar do/does/did en la indirecta.', ['What time does it start? → Could you tell me what time it starts?']],
    ['Question tag: frase afirmativa → tag negativa, y al revés.', ['It\'s cold, isn\'t it?', 'You don\'t smoke, do you?']],
    ['El tag repite el auxiliar de la frase.', ['She can swim, can\'t she?', 'You went there, didn\'t you?']]
  ],
  ex: [
    ['Do you know where the bank ___?', 'is', ['is', 'does', 'is it'], 'Orden normal en indirectas.'],
    ['Could you tell me what time the train ___?', 'leaves', ['does leave', 'leaves', 'leave'], 'Sin do/does en indirectas.'],
    ['It\'s a lovely day, ___?', 'isn\'t it', ['isn\'t it', 'is it', 'doesn\'t it'], 'Afirmativa → tag negativa con is.'],
    ['You haven\'t seen my keys, ___?', 'have you', ['haven\'t you', 'have you', 'did you'], 'Negativa → tag afirmativa.'],
    ['She works with you, ___?', 'doesn\'t she', ['isn\'t she', 'doesn\'t she', 'don\'t she'], 'Present simple → does.'],
    ['I wonder why he ___ so upset.', 'is', ['is', 'is he', 'does'], 'Indirecta → orden normal.'],
    ['You\'ll help me, ___?', 'won\'t you', ['will you', 'won\'t you', 'don\'t you'], 'Will → won\'t.'],
    ['Can you tell me how much it ___?', 'costs', ['does cost', 'costs', 'cost'], 'Indirecta sin does.']
  ] },
{ id: 'articles', title: 'Artículos: a, an, the o nada', es: 'El gran lío de los españoles',
  intro: 'En español usamos «el/la» mucho más que en inglés. En inglés, cuando hablamos de algo en general (plural o incontable), no se pone artículo.',
  points: [
    ['Hablar en general → sin artículo.', ['I love dogs. (no: the dogs)', 'Life is short.', 'Money isn\'t everything.']],
    ['Algo concreto que ya sabemos cuál es → the.', ['The dog next door barks all night.']],
    ['Profesiones → a / an.', ['She\'s a lawyer. (no: She\'s lawyer)']],
    ['Sin artículo: at home, at work, go to bed, by car, next week, in hospital (UK).', ['I\'m at work.', 'See you next Monday.']]
  ],
  ex: [
    ['I think ___ education is very important.', '—', ['the', '—', 'an'], 'Concepto general → sin artículo.'],
    ['My brother is ___ engineer.', 'an', ['—', 'a', 'an'], 'Profesión → a/an; an delante de vocal.'],
    ['Can you close ___ door, please?', 'the', ['a', 'the', '—'], 'Una puerta concreta.'],
    ['She goes to work by ___ bus.', '—', ['the', 'a', '—'], '«By bus» sin artículo.'],
    ['___ people in this town are very friendly.', 'The', ['—', 'The', 'A'], 'Gente concreta de este pueblo → the.'],
    ['I don\'t like ___ coffee.', '—', ['the', '—', 'a'], 'Coffee en general.'],
    ['We\'re going to ___ cinema tonight.', 'the', ['—', 'the', 'a'], 'Expresión fija: go to the cinema.'],
    ['What ___ beautiful day!', 'a', ['—', 'a', 'the'], 'What + a + adjetivo + nombre contable.']
  ] },
{ id: 'prepositions', title: 'In, on, at (tiempo y lugar)', es: 'Las preposiciones más usadas',
  intro: 'Regla rápida: at para puntos exactos, on para días y superficies, in para periodos largos y espacios cerrados.',
  points: [
    ['Tiempo: at + hora / at night / at the weekend (UK).', ['at 7 o\'clock', 'at night']],
    ['Tiempo: on + día / fecha.', ['on Monday', 'on 4 November', 'on my birthday']],
    ['Tiempo: in + mes / año / estación / parte del día.', ['in May', 'in 2027', 'in the morning']],
    ['Lugar: at = punto; in = dentro; on = encima / medios de transporte grandes.', ['at the bus stop', 'in the kitchen', 'on the train']]
  ],
  ex: [
    ['The meeting is ___ Monday.', 'on', ['in', 'on', 'at'], 'Días → on.'],
    ['I was born ___ 2005.', 'in', ['in', 'on', 'at'], 'Años → in.'],
    ['See you ___ 6 o\'clock.', 'at', ['in', 'on', 'at'], 'Hora exacta → at.'],
    ['I\'ll be ___ home all evening.', 'at', ['in', 'at', 'on'], 'Expresión fija: at home.'],
    ['I always read ___ the train.', 'on', ['in', 'on', 'at'], 'Transporte público → on.'],
    ['We usually go skiing ___ winter.', 'in', ['in', 'on', 'at'], 'Estaciones → in.'],
    ['Wait for me ___ the entrance.', 'at', ['in', 'on', 'at'], 'Un punto concreto → at.'],
    ['I study better ___ the morning.', 'in', ['in', 'on', 'at'], 'Partes del día → in the morning.']
  ] },
{ id: 'makedo', title: 'Make vs do', es: 'Dos verbos para «hacer»',
  intro: 'Do se usa para tareas, trabajos y actividades. Make se usa para crear o producir algo y en muchas expresiones fijas. Hay que memorizarlas.',
  points: [
    ['Do: homework, the housework, a job, business, sport, your best, a favour, research.', ['Could you do me a favour?']],
    ['Make: a mistake, a decision, money, a phone call, a plan, a noise, friends, progress, an effort.', ['I made a mistake.']]
  ],
  ex: [
    ['I need to ___ a phone call.', 'make', ['make', 'do'], 'Make a phone call.'],
    ['Can you ___ me a favour?', 'do', ['make', 'do'], 'Do someone a favour.'],
    ['He ___ a lot of money in his first job.', 'made', ['made', 'did'], 'Make money.'],
    ['I\'ll ___ my best.', 'do', ['make', 'do'], 'Do your best.'],
    ['You\'re ___ great progress!', 'making', ['making', 'doing'], 'Make progress.'],
    ['Have you ___ your homework?', 'done', ['made', 'done'], 'Do homework.'],
    ['We have to ___ a decision today.', 'make', ['make', 'do'], 'Make a decision.'],
    ['She ___ business with Chinese companies.', 'does', ['makes', 'does'], 'Do business.']
  ] },
{ id: 'passive', title: 'La pasiva', es: 'Cuando importa lo que pasa, no quién lo hace',
  intro: 'Se forma con be + participio. Es muy común en noticias, en el trabajo y en el inglés jurídico.',
  points: [
    ['Presente: is/are + participio.', ['English is spoken all over the world.']],
    ['Pasado: was/were + participio.', ['The contract was signed yesterday.']],
    ['Present perfect: has/have been + participio.', ['The meeting has been cancelled.']],
    ['Con modales: will / must / can be + participio.', ['The documents must be submitted by Friday.']],
    ['Si importa quién lo hizo → by.', ['The book was written by a Spanish author.']]
  ],
  ex: [
    ['The contract ___ by both parties last week.', 'was signed', ['signed', 'was signed', 'is signed'], 'Pasado → was + participio.'],
    ['Spanish ___ in many countries.', 'is spoken', ['speaks', 'is spoken', 'is speaking'], 'Presente pasivo.'],
    ['The meeting ___ cancelled.', 'has been', ['has been', 'have been', 'is been'], 'Present perfect pasivo.'],
    ['The forms must ___ by Friday.', 'be submitted', ['submit', 'be submitted', 'been submitted'], 'Modal + be + participio.'],
    ['He ___ by the police yesterday.', 'was arrested', ['arrested', 'was arrested', 'has arrested'], 'Pasado pasivo.'],
    ['A new hospital ___ next year.', 'will be built', ['will build', 'will be built', 'is build'], 'Futuro pasivo.'],
    ['These cars ___ in Germany.', 'are made', ['are made', 'make', 'are making'], 'Presente pasivo.'],
    ['The case ___ by a judge in Madrid.', 'was heard', ['was heard', 'heard', 'was hear'], 'Pasado pasivo (hear-heard-heard).']
  ] },
{ id: 'reported', title: 'Estilo indirecto (reported speech)', es: 'Contar lo que otro dijo',
  intro: 'Cuando contamos lo que alguien dijo, el verbo suele «retroceder» un tiempo. Say no lleva persona detrás; tell sí.',
  points: [
    ['Present → past.', ['"I\'m tired." → He said he was tired.']],
    ['Past / present perfect → past perfect.', ['"I saw it." → She said she had seen it.']],
    ['Will → would; can → could.', ['"I\'ll call." → He said he would call.']],
    ['Say something / tell someone something.', ['She said that… / She told me that…']],
    ['Preguntas: asked if / asked what + orden normal.', ['"Are you OK?" → He asked if I was OK.']]
  ],
  ex: [
    ['"I\'m busy." → She said she ___ busy.', 'was', ['is', 'was', 'were'], 'Present → past.'],
    ['He ___ me that he would be late.', 'told', ['said', 'told', 'says'], 'Tell + persona.'],
    ['"I will help you." → He said he ___ help me.', 'would', ['will', 'would', 'can'], 'Will → would.'],
    ['She asked me where I ___.', 'lived', ['lived', 'did live', 'do live'], 'Orden normal, sin did.'],
    ['"I have finished." → He said he ___ finished.', 'had', ['has', 'had', 'have'], 'Present perfect → past perfect.'],
    ['They ___ that the deal was off.', 'said', ['told', 'said', 'told us that'], 'Say sin persona.'],
    ['He asked ___ I wanted a coffee.', 'if', ['that', 'if', 'what'], 'Pregunta de sí/no → if.'],
    ['"I can swim." → She said she ___ swim.', 'could', ['can', 'could', 'would'], 'Can → could.']
  ] },
{ id: 'errors', title: 'Errores típicos de hispanohablantes', es: 'Lo que delata que eres español',
  intro: 'Estos fallos son muy comunes al traducir directamente del español. Corregirlos hace que suenes mucho más natural.',
  points: [
    ['La edad: be, no have.', ['I\'m 20. (no: I have 20 years)']],
    ['People es plural.', ['People are friendly. (no: people is)']],
    ['Explain / say / suggest no llevan persona directa.', ['Can you explain it to me? (no: explain me)']],
    ['Information, advice, news y furniture son incontables.', ['some advice (no: an advice / advices)']],
    ['Depend on, no depend of. Married to, no with.', ['It depends on the weather.']],
    ['Falsos amigos: actually (en realidad), eventually (al final), assist (ayudar), sensible (sensato), constipated (estreñido).', ['I have a cold. (no: I\'m constipated)']]
  ],
  ex: [
    ['My sister ___ 25 years old.', 'is', ['has', 'is', 'have'], 'La edad va con be.'],
    ['The people here ___ very nice.', 'are', ['is', 'are', 'was'], 'People es plural.'],
    ['Can you explain ___?', 'it to me', ['me it', 'it to me', 'me'], 'Explain something to someone.'],
    ['Let me give you some ___.', 'advice', ['advices', 'advice', 'an advice'], 'Advice es incontable.'],
    ['It depends ___ the price.', 'on', ['of', 'on', 'from'], 'Depend on.'],
    ['I ___ a cold, so I\'m staying home.', 'have', ['am constipated', 'have', 'am'], '«Constipated» significa estreñido.'],
    ['___, I prefer tea to coffee.', 'Actually', ['Actually', 'Currently', 'Nowadays'], 'Actually = en realidad.'],
    ['She\'s married ___ a doctor.', 'to', ['with', 'to', 'by'], 'Married to.']
  ] }
];
