/* Role-plays interactivos: en cada turno eliges qué dirías.
   steps: { say: [hablante, frase], opts: [[respuesta, 'best'|'ok'|'bad', comentario]] } */
window.ROLEPLAYS = [
{ id: 'rp-cafe', title: 'Pedir en una cafetería de Londres', es: 'Sonar natural al pedir', partner: 'Barista',
  steps: [
    { say: ['Barista', 'Hiya, what can I get you?'], opts: [
      ['Can I get a flat white, please?', 'best', 'Perfecto. «Can I get…» es lo más natural al pedir.'],
      ['I want a flat white.', 'ok', 'Se entiende, pero «I want» suena brusco. Mejor «Can I get…» o «Could I have…».'],
      ['Give me a flat white.', 'bad', 'Suena muy maleducado en inglés. Usa «Can I get…, please?».']] },
    { say: ['Barista', 'Sure. Is that to have in or take away?'], opts: [
      ['To have in, please.', 'best', 'Correcto. También vale «I\'ll have it here».'],
      ['For here.', 'ok', 'Es más americano, pero te entenderán perfectamente.'],
      ['For to eat here.', 'bad', '«For to» no existe. Di «To have in» o «For here».']] },
    { say: ['Barista', 'Any milk preference? We\'ve got oat, soy and almond.'], opts: [
      ['Oat would be great, thanks.', 'best', 'Muy natural y educado.'],
      ['Oat milk, yes.', 'ok', 'Correcto pero algo seco.'],
      ['I prefer the oat.', 'bad', 'Sobra «the». Mejor «Oat, please» u «Oat would be great».']] },
    { say: ['Barista', 'Lovely. Anything else for you?'], opts: [
      ['No, that\'s all, thanks.', 'best', 'Perfecto.'],
      ['That\'s it, cheers.', 'best', 'Muy británico y natural.'],
      ['Nothing more.', 'ok', 'Se entiende, pero suena traducido.']] },
    { say: ['Barista', 'That\'s three pounds forty. Card or cash?'], opts: [
      ['Card, please.', 'best', 'Natural y breve.'],
      ['With card.', 'ok', 'Se entiende, pero lo natural es «Card, please».'],
      ['I pay with the card.', 'bad', 'Suena traducido del español. Di «Card, please».']] }
  ] },
{ id: 'rp-late', title: 'Llegas tarde a una cena con amigos', es: 'Disculparte con naturalidad', partner: 'Emma',
  steps: [
    { say: ['Emma', 'There you are! We were starting to think you weren\'t coming.'], opts: [
      ['Sorry, sorry! The traffic was a nightmare.', 'best', 'Natural: doble «sorry» y una excusa rápida.'],
      ['I apologise for my delay.', 'ok', 'Correcto pero demasiado formal entre amigos.'],
      ['Sorry for the late.', 'bad', '«The late» no existe. Di «Sorry I\'m late».']] },
    { say: ['Emma', 'Don\'t worry about it. We\'ve already ordered starters, hope that\'s OK.'], opts: [
      ['Of course, no worries.', 'best', 'Perfecto y relajado.'],
      ['Yes, it is OK.', 'ok', 'Correcto pero poco natural.'],
      ['Is no problem.', 'bad', 'Falta el sujeto: «It\'s no problem» o mejor «No worries».']] },
    { say: ['Emma', 'So, how\'s work been? You look shattered.'], opts: [
      ['Don\'t get me started. It\'s been manic this week.', 'best', 'Muy nativo: «don\'t get me started» y «manic».'],
      ['Yes, I am very tired because I have much work.', 'ok', 'Se entiende, pero «much work» suena raro. Mejor «a lot of work».'],
      ['I am shattered of work.', 'bad', 'No se dice «shattered of». Di «I\'m shattered» o «Work\'s been crazy».']] },
    { say: ['Emma', 'Oh no. Well, you\'re here now. What are you having?'], opts: [
      ['I think I\'ll go for the risotto.', 'best', '«Go for» es perfecto para elegir algo.'],
      ['I will take the risotto.', 'ok', 'Correcto, aunque «have» o «go for» suenan más naturales.'],
      ['I am going to eat me the risotto.', 'bad', '«Eat me» calca el español «comerme». Di «I\'ll have the risotto».']] }
  ] },
{ id: 'rp-client', title: 'Llamada con un cliente enfadado', es: 'Mantener la calma y ofrecer solución', partner: 'Client',
  steps: [
    { say: ['Client', 'I\'ve been waiting for your draft for three days. This is completely unacceptable.'], opts: [
      ['I completely understand your frustration, and I\'m sorry for the delay.', 'best', 'Reconoces el problema y te disculpas: perfecto.'],
      ['It\'s not my fault, the partner was on holiday.', 'bad', 'Nunca culpes a otro con un cliente.'],
      ['Sorry, we are very busy.', 'ok', 'Te disculpas, pero «estamos ocupados» no ayuda al cliente.']] },
    { say: ['Client', 'I need it today. We have a board meeting tomorrow morning.'], opts: [
      ['I\'ll make sure you have it by five o\'clock today.', 'best', 'Compromiso concreto y claro.'],
      ['I will try to send it today maybe.', 'ok', '«Try» y «maybe» transmiten inseguridad.'],
      ['Today is impossible.', 'bad', 'Demasiado cortante. Si no puedes, ofrece una alternativa.']] },
    { say: ['Client', 'And will it cover the tax issues we discussed?'], opts: [
      ['Yes, I\'ll flag the key tax points in a short cover note as well.', 'best', 'Das más de lo pedido: muy profesional.'],
      ['Yes.', 'ok', 'Correcto pero demasiado corto con un cliente molesto.'],
      ['I don\'t remember what we discussed.', 'bad', 'Nunca lo digas así. Pide que te lo recuerde con tacto.']] },
    { say: ['Client', 'OK. Thank you. I appreciate it.'], opts: [
      ['Not at all. Thanks for your patience, and I\'ll be in touch shortly.', 'best', 'Cierre profesional y cálido.'],
      ['You\'re welcome. Bye.', 'ok', 'Correcto pero un poco frío.'],
      ['Of nothing.', 'bad', 'Calco de «de nada». Di «You\'re welcome» o «Not at all».']] }
  ] },
{ id: 'rp-neighbour', title: 'Hablar con un vecino ruidoso', es: 'Quejarte sin crear un conflicto', partner: 'Neighbour',
  steps: [
    { say: ['Neighbour', 'Oh, hi! Everything alright?'], opts: [
      ['Hi! Sorry to bother you. Have you got a minute?', 'best', 'Empiezas con educación y sin atacar.'],
      ['Your music is too loud.', 'ok', 'Directo, pero puede sonar agresivo de entrada.'],
      ['You are making very much noise.', 'bad', '«Very much noise» es incorrecto. Además suena acusador.']] },
    { say: ['Neighbour', 'Sure, what\'s up?'], opts: [
      ['It\'s just that the music\'s been quite loud late at night, and I\'ve got work early.', 'best', '«It\'s just that…» suaviza la queja.'],
      ['I can\'t sleep for your music.', 'ok', 'Se entiende, pero «because of your music».'],
      ['Your music molests me.', 'bad', '¡Cuidado! «Molest» significa abusar sexualmente. Di «bothers me».']] },
    { say: ['Neighbour', 'Oh God, I\'m so sorry. I had no idea you could hear it.'], opts: [
      ['Don\'t worry, it\'s not a big deal. Maybe just keep it down after eleven?', 'best', 'Propones una solución concreta y amable.'],
      ['OK, but don\'t do it again.', 'ok', 'Un poco seco.'],
      ['Yes, is very loud, every night.', 'bad', 'Falta el sujeto «it». Y suena a reproche.']] },
    { say: ['Neighbour', 'Of course. Thanks for being so nice about it.'], opts: [
      ['No worries at all. Have a good evening!', 'best', 'Cierre perfecto.'],
      ['Thank you too.', 'ok', 'Correcto, aunque algo raro.'],
      ['Nothing.', 'bad', 'Calco de «de nada». Usa «No worries».']] }
  ] },
{ id: 'rp-networking', title: 'Networking con una socia', es: 'Causar buena impresión en un evento', partner: 'Partner',
  steps: [
    { say: ['Partner', 'Hi, I don\'t think we\'ve met. I\'m Helen.'], opts: [
      ['Nice to meet you, Helen. I\'m Iker, I\'m in my final year of law.', 'best', 'Presentación clara y completa.'],
      ['Hello. My name is Iker and I am student.', 'ok', 'Falta «a»: «I\'m a student». Y es algo rígido.'],
      ['Encantado. I am Iker.', 'bad', 'Nada de español, y mejor «I\'m Iker».']] },
    { say: ['Partner', 'Lovely. And what area are you interested in?'], opts: [
      ['Mainly M&A. I love the mix of law and business strategy.', 'best', 'Concreto y con un motivo.'],
      ['I am interested in all areas.', 'ok', 'Suena indeciso. Mejor mostrar interés concreto.'],
      ['I am interesting in M&A.', 'bad', '«Interesting» es «interesante». Di «I\'m interested in».']] },
    { say: ['Partner', 'Good choice. It\'s hard work, though. Long hours.'], opts: [
      ['I\'m used to working hard. I actually enjoy it when there\'s a lot going on.', 'best', '«Be used to + -ing» bien usado y actitud positiva.'],
      ['Yes, I know it. No problem.', 'ok', '«I know it» suena raro; mejor «I know».'],
      ['I am use to work hard.', 'bad', 'Es «I\'m used to working hard».']] },
    { say: ['Partner', 'Well, it was nice chatting. Here\'s my card.'], opts: [
      ['Thank you, that\'s very kind. Would you mind if I dropped you an email?', 'best', 'Educado y deja la puerta abierta.'],
      ['Thanks. I will write you.', 'ok', 'En británico, mejor «I\'ll email you» o «I\'ll drop you a line».'],
      ['Thanks. Bye bye!', 'bad', '«Bye bye» suena infantil en un contexto profesional.']] }
  ] },
{ id: 'rp-hotel', title: 'Problema en el hotel', es: 'Reclamar con educación y firmeza', partner: 'Receptionist',
  steps: [
    { say: ['Receptionist', 'Good evening, how can I help?'], opts: [
      ['Hi, I\'m afraid there\'s a problem with my room.', 'best', '«I\'m afraid…» es la forma educada de introducir un problema.'],
      ['My room is bad.', 'ok', 'Muy básico y poco claro.'],
      ['I have a problem with the room of me.', 'bad', 'Es «my room».']] },
    { say: ['Receptionist', 'Oh dear. What seems to be the problem?'], opts: [
      ['The air conditioning isn\'t working, and it\'s really hot in there.', 'best', 'Claro y concreto.'],
      ['The air conditioner doesn\'t go.', 'ok', 'Se entiende, pero «doesn\'t work» es lo correcto.'],
      ['Is not working the air.', 'bad', 'Orden y sujeto incorrectos.']] },
    { say: ['Receptionist', 'I\'m so sorry. I can send someone up, but it might take an hour.'], opts: [
      ['Would it be possible to move to another room instead?', 'best', 'Pides una alternativa con educación.'],
      ['I want another room now.', 'ok', 'Firme pero brusco.'],
      ['One hour? Is a joke!', 'bad', 'Falta sujeto y suena agresivo.']] },
    { say: ['Receptionist', 'Of course. I can upgrade you to a room with a sea view at no extra cost.'], opts: [
      ['That\'s brilliant, thank you so much.', 'best', 'Natural y agradecido.'],
      ['OK, thank you.', 'ok', 'Correcto, aunque poco entusiasta para un upgrade gratis.'],
      ['Perfect, thank you very much for all.', 'bad', 'No se dice «for all». Di «for everything» o «so much».']] }
  ] }
];
