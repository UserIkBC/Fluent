/* Situaciones para conversar: frases útiles + diálogo modelo */
window.SITUATIONS = [
{ id: 'smalltalk', legal: false, title: 'Conocer gente y small talk', es: 'Presentarte, preguntar y mantener la conversación',
  phrases: [
    ['Nice to meet you. I\'m Iker.', 'Encantado. Soy Iker.'],
    ['So, what do you do?', 'Y tú, ¿a qué te dedicas?'],
    ['Where are you from originally?', '¿De dónde eres originalmente?'],
    ['How do you know Sarah?', '¿De qué conoces a Sarah?'],
    ['Have you been here before?', '¿Habías estado aquí antes?'],
    ['That sounds interesting! How did you get into that?', '¡Qué interesante! ¿Cómo empezaste en eso?'],
    ['I know what you mean.', 'Te entiendo / sé a qué te refieres.'],
    ['Really? I didn\'t know that.', '¿En serio? No lo sabía.'],
    ['What do you do in your free time?', '¿Qué haces en tu tiempo libre?'],
    ['Anyway, it was great talking to you.', 'Bueno, ha sido un placer hablar contigo.'],
    ['Let\'s keep in touch.', 'Seguimos en contacto.']
  ],
  dialogue: [
    ['Emma', 'Hi! I don\'t think we\'ve met. I\'m Emma.'],
    ['Iker', 'Nice to meet you, Emma. I\'m Iker. How do you know Tom?'],
    ['Emma', 'We used to work together. What about you?'],
    ['Iker', 'We met at university. I\'m studying law, actually.'],
    ['Emma', 'Oh really? What kind of law are you into?'],
    ['Iker', 'Corporate law, mostly. I\'d love to work at a big firm one day.'],
    ['Emma', 'That sounds great. Are you from around here?'],
    ['Iker', 'No, I\'m from Valencia. I\'m just here for a few days.'],
    ['Emma', 'Lucky you! I\'ve always wanted to go to Valencia.'],
    ['Iker', 'You should! The food alone is worth the trip.']
  ] },
{ id: 'cafe', legal: false, title: 'En el bar o restaurante', es: 'Pedir, preguntar y pagar',
  phrases: [
    ['Could I have a flat white, please?', '¿Me pones un flat white, por favor?'],
    ['Can I get a table for two?', '¿Tienen mesa para dos?'],
    ['Do you have anything vegetarian?', '¿Tienen algo vegetariano?'],
    ['What would you recommend?', '¿Qué me recomienda?'],
    ['I\'ll have the same, please.', 'Para mí lo mismo.'],
    ['Could we have the bill, please?', '¿Nos trae la cuenta, por favor?'],
    ['Is service included?', '¿Está incluido el servicio?'],
    ['Can I pay by card?', '¿Puedo pagar con tarjeta?'],
    ['Sorry, I think there\'s a mistake on the bill.', 'Perdone, creo que hay un error en la cuenta.'],
    ['To have here or to take away?', '¿Para tomar aquí o para llevar?']
  ],
  dialogue: [
    ['Waiter', 'Hi there, are you ready to order?'],
    ['Iker', 'Almost. What would you recommend?'],
    ['Waiter', 'The fish of the day is really good. It\'s sea bass today.'],
    ['Iker', 'Sounds great, I\'ll have that. Does it come with anything?'],
    ['Waiter', 'It comes with new potatoes and a green salad.'],
    ['Iker', 'Perfect. And could I get a sparkling water, please?'],
    ['Waiter', 'Of course. Anything else?'],
    ['Iker', 'That\'s all for now, thanks.']
  ] },
{ id: 'travel', legal: false, title: 'Aeropuerto y hotel', es: 'Viajar sin agobios',
  phrases: [
    ['I\'d like to check in, please. I have a reservation under Iker.', 'Quería registrarme. Tengo una reserva a nombre de Iker.'],
    ['What time is check-out?', '¿A qué hora hay que dejar la habitación?'],
    ['Could I leave my luggage here?', '¿Puedo dejar aquí mi equipaje?'],
    ['Is breakfast included?', '¿Está incluido el desayuno?'],
    ['My flight has been delayed. What are my options?', 'Mi vuelo se ha retrasado. ¿Qué opciones tengo?'],
    ['Which gate does the flight leave from?', '¿De qué puerta sale el vuelo?'],
    ['I\'ve missed my connection.', 'He perdido la conexión.'],
    ['My suitcase hasn\'t arrived.', 'Mi maleta no ha llegado.'],
    ['How do I get to the city centre from here?', '¿Cómo llego al centro desde aquí?'],
    ['There\'s a problem with my room. The air conditioning isn\'t working.', 'Hay un problema con mi habitación. El aire acondicionado no funciona.']
  ],
  dialogue: [
    ['Agent', 'Good afternoon. How can I help?'],
    ['Iker', 'Hi. My flight to Dublin was cancelled. Can you put me on another one?'],
    ['Agent', 'Let me have a look. There\'s a flight at 7.40 this evening. Would that work?'],
    ['Iker', 'Yes, that\'s fine. Will my bag be transferred automatically?'],
    ['Agent', 'Yes, it will. Here\'s your new boarding pass and a meal voucher.'],
    ['Iker', 'Great, thanks for your help.']
  ] },
{ id: 'phone', legal: false, title: 'Llamadas por teléfono', es: 'Lo más difícil: hablar sin ver a la otra persona',
  phrases: [
    ['Hi, this is Iker calling from…', 'Hola, soy Iker y llamo de…'],
    ['Could I speak to Mr Smith, please?', '¿Podría hablar con el Sr. Smith?'],
    ['Sorry, the line is bad. Could you speak up a bit?', 'Perdona, se oye mal. ¿Puedes hablar un poco más alto?'],
    ['Could you repeat that, please?', '¿Podría repetirlo?'],
    ['Could you spell that for me?', '¿Me lo puede deletrear?'],
    ['I\'m calling about…', 'Llamo por…'],
    ['Can I leave a message?', '¿Puedo dejar un mensaje?'],
    ['I\'ll put you through.', 'Le paso.'],
    ['Thanks for calling. Speak soon.', 'Gracias por llamar. Hablamos.'],
    ['Sorry, you\'re breaking up.', 'Perdona, se corta.']
  ],
  dialogue: [
    ['Receptionist', 'Good morning, Harper & Lane. How may I help you?'],
    ['Iker', 'Hi, could I speak to Daniel Harper, please?'],
    ['Receptionist', 'I\'m afraid he\'s in a meeting. Can I take a message?'],
    ['Iker', 'Yes, please. My name\'s Iker. I\'m calling about the internship programme.'],
    ['Receptionist', 'Could you spell your name for me?'],
    ['Iker', 'Sure. I-K-E-R.'],
    ['Receptionist', 'Thank you. I\'ll ask him to call you back this afternoon.'],
    ['Iker', 'Great, thanks very much.']
  ] },
{ id: 'interview', legal: false, title: 'Entrevista de trabajo', es: 'Hablar de ti con seguridad',
  phrases: [
    ['Thank you for having me.', 'Gracias por recibirme.'],
    ['I\'m in my final year of a law degree.', 'Estoy en el último curso de Derecho.'],
    ['What I enjoy most is…', 'Lo que más me gusta es…'],
    ['One of my strengths is that I\'m very organised.', 'Uno de mis puntos fuertes es que soy muy organizado.'],
    ['I\'m working on improving my…', 'Estoy trabajando para mejorar mi…'],
    ['I\'d like to develop my career in corporate law.', 'Me gustaría desarrollar mi carrera en derecho mercantil.'],
    ['That\'s a good question. Let me think for a second.', 'Buena pregunta. Déjeme pensar un momento.'],
    ['Could you tell me more about the team?', '¿Podría contarme más sobre el equipo?'],
    ['What does a typical day look like for a junior associate?', '¿Cómo es un día normal para un asociado junior?'],
    ['I look forward to hearing from you.', 'Quedo a la espera de sus noticias.']
  ],
  dialogue: [
    ['Interviewer', 'So, tell me a bit about yourself.'],
    ['Iker', 'Sure. I\'m a law student from Valencia, and I\'m in my final year. I\'ve always been interested in corporate law, especially M&A.'],
    ['Interviewer', 'Why do you want to join this firm?'],
    ['Iker', 'Mainly because of your international practice. I\'d love to work on cross-border deals, and I know you do a lot of that.'],
    ['Interviewer', 'What would you say is your main weakness?'],
    ['Iker', 'I sometimes spend too long checking details. I\'m learning to prioritise and accept that some tasks need to be done quickly.'],
    ['Interviewer', 'Do you have any questions for us?'],
    ['Iker', 'Yes, actually. How are trainees supported during their first year?']
  ] },
{ id: 'meetings', legal: false, title: 'Reuniones: opinar, interrumpir, discrepar', es: 'Participar sin miedo',
  phrases: [
    ['Can I just add something here?', '¿Puedo añadir algo?'],
    ['Sorry to interrupt, but…', 'Perdón por interrumpir, pero…'],
    ['I see your point, but…', 'Entiendo lo que dices, pero…'],
    ['I\'m not sure I agree with that.', 'No sé si estoy de acuerdo con eso.'],
    ['That\'s a good point.', 'Buena observación.'],
    ['Could you clarify what you mean by…?', '¿Podrías aclarar qué quieres decir con…?'],
    ['Let\'s get back to the main point.', 'Volvamos al punto principal.'],
    ['To sum up, we\'ve agreed to…', 'Resumiendo, hemos acordado…'],
    ['I\'ll look into it and get back to you.', 'Lo miro y te digo.'],
    ['Shall we move on to the next item?', '¿Pasamos al siguiente punto?']
  ],
  dialogue: [
    ['Anna', 'I think we should launch the campaign in January.'],
    ['Iker', 'I see your point, but January is usually a quiet month. Could we wait until February?'],
    ['Anna', 'That\'s fair. What do others think?'],
    ['Mark', 'I agree with Iker. February gives us more time to prepare.'],
    ['Anna', 'OK, let\'s go with February then. Iker, could you look into the budget?'],
    ['Iker', 'Sure, I\'ll get back to you by Friday.']
  ] },
{ id: 'plans', legal: false, title: 'Hacer planes con amigos', es: 'Proponer, aceptar y rechazar',
  phrases: [
    ['Are you free on Saturday?', '¿Estás libre el sábado?'],
    ['Do you fancy going for a drink?', '¿Te apetece tomar algo?'],
    ['How about Friday instead?', '¿Y qué tal el viernes?'],
    ['Sounds good to me!', '¡Me parece bien!'],
    ['I\'d love to, but I can\'t make it.', 'Me encantaría, pero no puedo.'],
    ['Let me check and get back to you.', 'Déjame mirarlo y te digo.'],
    ['What time suits you?', '¿A qué hora te va bien?'],
    ['Shall we say eight o\'clock?', '¿Quedamos a las ocho?'],
    ['I\'m running a bit late, sorry!', '¡Voy un poco tarde, perdona!'],
    ['Something\'s come up. Can we do it another day?', 'Me ha surgido algo. ¿Lo dejamos para otro día?']
  ],
  dialogue: [
    ['Jack', 'Hey! Do you fancy going to the cinema this weekend?'],
    ['Iker', 'I\'d love to. Saturday\'s a bit busy for me though. How about Sunday?'],
    ['Jack', 'Sunday works. There\'s a showing at 7.30.'],
    ['Iker', 'Perfect. Shall we grab a bite first?'],
    ['Jack', 'Good idea. Let\'s meet at six outside the cinema.'],
    ['Iker', 'Sounds good. See you then!']
  ] },
{ id: 'complain', legal: false, title: 'Quejarse con educación', es: 'Resolver un problema sin perder las formas',
  phrases: [
    ['I\'m afraid there\'s a problem with…', 'Me temo que hay un problema con…'],
    ['I\'m not very happy with…', 'No estoy muy contento con…'],
    ['I was expecting…', 'Esperaba…'],
    ['Would it be possible to get a refund?', '¿Sería posible un reembolso?'],
    ['Could I speak to the manager, please?', '¿Podría hablar con el encargado?'],
    ['I\'d appreciate it if you could…', 'Le agradecería que…'],
    ['This is the second time this has happened.', 'Es la segunda vez que pasa.'],
    ['What can you do about it?', '¿Qué pueden hacer al respecto?']
  ],
  dialogue: [
    ['Iker', 'Excuse me. I\'m afraid there\'s a problem with my order. I asked for no onions.'],
    ['Waiter', 'Oh, I\'m so sorry about that. I\'ll take it back to the kitchen.'],
    ['Iker', 'Thanks. Would it be possible to do it quickly? I have to leave in twenty minutes.'],
    ['Waiter', 'Of course. I\'ll make sure it\'s a priority, and the drinks are on us.'],
    ['Iker', 'That\'s very kind, thank you.']
  ] },
{ id: 'client', legal: true, title: 'Jurídico · Primera reunión con un cliente', es: 'Entender el problema y explicar los siguientes pasos',
  phrases: [
    ['Thank you for coming in. How can we help?', 'Gracias por venir. ¿En qué podemos ayudarle?'],
    ['Could you walk me through what happened?', '¿Podría explicarme paso a paso lo que pasó?'],
    ['When exactly did this happen?', '¿Cuándo pasó exactamente?'],
    ['Do you have a copy of the contract?', '¿Tiene una copia del contrato?'],
    ['Everything you tell us is strictly confidential.', 'Todo lo que nos cuente es estrictamente confidencial.'],
    ['Based on what you\'ve told me, you may have a claim for…', 'Por lo que me cuenta, podría tener una reclamación por…'],
    ['There are a few options we could consider.', 'Hay varias opciones que podríamos valorar.'],
    ['The first step would be to send a letter before action.', 'El primer paso sería enviar un requerimiento previo.'],
    ['I\'ll need to look into this in more detail.', 'Tendré que estudiarlo con más detalle.'],
    ['We\'ll send you an engagement letter with our fees.', 'Le enviaremos una hoja de encargo con nuestros honorarios.']
  ],
  dialogue: [
    ['Client', 'Thanks for seeing me. I\'ve got a problem with a supplier.'],
    ['Iker', 'Of course. Could you walk me through what happened?'],
    ['Client', 'We ordered 5,000 units in March. They arrived two months late and half were damaged.'],
    ['Iker', 'I see. Do you have the contract and any emails about the delay?'],
    ['Client', 'Yes, I\'ve brought everything.'],
    ['Iker', 'Great. Based on what you\'ve told me, this looks like a breach of contract. You may be able to claim damages.'],
    ['Client', 'Would we have to go to court?'],
    ['Iker', 'Not necessarily. Most cases like this settle. The first step would be a formal letter to the supplier.']
  ] },
{ id: 'negotiation', legal: true, title: 'Jurídico · Negociar un contrato', es: 'Proponer, ceder y cerrar puntos',
  phrases: [
    ['Our client\'s position is that…', 'La posición de nuestro cliente es que…'],
    ['We can\'t accept clause 8 as drafted.', 'No podemos aceptar la cláusula 8 tal como está redactada.'],
    ['Would you be willing to…?', '¿Estarían dispuestos a…?'],
    ['We could agree to that, provided that…', 'Podríamos aceptarlo, siempre que…'],
    ['That\'s a deal-breaker for us.', 'Eso es innegociable para nosotros.'],
    ['Let\'s park that point and come back to it.', 'Dejemos ese punto y volvamos a él después.'],
    ['I\'ll need to take instructions from my client.', 'Tendré que consultarlo con mi cliente.'],
    ['Can we meet halfway on this?', '¿Podemos llegar a un punto intermedio?'],
    ['We\'ll send over a revised draft by Friday.', 'Les enviaremos un borrador revisado el viernes.']
  ],
  dialogue: [
    ['Other side', 'We\'d like to cap the seller\'s liability at 10% of the price.'],
    ['Iker', 'I\'m afraid that\'s too low for our client. We were thinking of 30%.'],
    ['Other side', 'That\'s quite a gap. Could you accept 20% if we extend the warranty period?'],
    ['Iker', 'That might work, provided that tax claims are excluded from the cap.'],
    ['Other side', 'I\'ll need to take instructions on that.'],
    ['Iker', 'Of course. Let\'s park it and move on to the governing law clause.']
  ] },
{ id: 'legalemail', legal: true, title: 'Jurídico · Correos y llamadas en el despacho', es: 'Inglés profesional del día a día',
  phrases: [
    ['Further to our call this morning, …', 'En relación con nuestra llamada de esta mañana, …'],
    ['Please find attached our comments on the draft.', 'Adjunto nuestros comentarios al borrador.'],
    ['I would be grateful if you could confirm…', 'Le agradecería que confirmara…'],
    ['Please let me know if you have any questions.', 'Quedo a su disposición para cualquier duda.'],
    ['Apologies for the delay in getting back to you.', 'Disculpe el retraso en responderle.'],
    ['I just wanted to flag that…', 'Solo quería señalar que…'],
    ['Could you bring me up to speed on the case?', '¿Me pones al día del asunto?'],
    ['I\'ll circulate a revised version shortly.', 'Enviaré una versión revisada en breve.'],
    ['Kind regards', 'Un saludo cordial'],
    ['Let\'s set up a call to discuss.', 'Organicemos una llamada para comentarlo.']
  ],
  dialogue: [
    ['Partner', 'Iker, have you had a chance to look at the share purchase agreement?'],
    ['Iker', 'Yes, I\'ve gone through it. I just wanted to flag a couple of issues in the warranties.'],
    ['Partner', 'Good. Can you put them in an email to the client?'],
    ['Iker', 'Sure. I\'ll send you a draft first so you can review it.'],
    ['Partner', 'Perfect. And copy in Laura, she\'s working on the tax side.'],
    ['Iker', 'Will do. I\'ll have it with you by four.']
  ] }
];
