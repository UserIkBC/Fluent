/* Situaciones (ampliación) */
window.SITUATIONS.push(
{ id: 'doctor', legal: false, title: 'En el médico o la farmacia', es: 'Explicar qué te pasa',
  phrases: [
    ['I\'d like to make an appointment, please.', 'Quería pedir cita, por favor.'],
    ['I\'ve had a headache for three days.', 'Llevo tres días con dolor de cabeza.'],
    ['It hurts when I move my arm.', 'Me duele cuando muevo el brazo.'],
    ['I\'ve got a sore throat and a temperature.', 'Me duele la garganta y tengo fiebre.'],
    ['I\'m allergic to penicillin.', 'Soy alérgico a la penicilina.'],
    ['How often should I take it?', '¿Cada cuánto lo tengo que tomar?'],
    ['Do I need a prescription for this?', '¿Necesito receta para esto?'],
    ['Is it anything serious?', '¿Es algo grave?'],
    ['Can you recommend something for a cough?', '¿Me recomienda algo para la tos?']
  ],
  dialogue: [
    ['Doctor', 'Hello, what seems to be the problem?'],
    ['Iker', 'I\'ve had a really bad cough for about a week, and now I\'ve got a temperature.'],
    ['Doctor', 'Any pain when you breathe?'],
    ['Iker', 'A little, especially in the morning.'],
    ['Doctor', 'Let me listen to your chest. Hmm, it sounds like a chest infection. I\'ll give you some antibiotics.'],
    ['Iker', 'How often should I take them?'],
    ['Doctor', 'Three times a day, after meals, for seven days. Come back if you don\'t feel better.']
  ] },
{ id: 'shop', legal: false, title: 'De compras y devoluciones', es: 'Preguntar, probarte y devolver',
  phrases: [
    ['I\'m just looking, thanks.', 'Solo estoy mirando, gracias.'],
    ['Do you have this in a medium?', '¿Lo tienen en la talla M?'],
    ['Where are the fitting rooms?', '¿Dónde están los probadores?'],
    ['It doesn\'t fit. Do you have a bigger size?', 'No me queda bien. ¿Tienen una talla más?'],
    ['How much is this?', '¿Cuánto cuesta esto?'],
    ['Is there a discount for students?', '¿Hay descuento para estudiantes?'],
    ['I\'d like to return this, please.', 'Quería devolver esto, por favor.'],
    ['Can I exchange it for something else?', '¿Puedo cambiarlo por otra cosa?'],
    ['Here\'s the receipt.', 'Aquí tiene el tique.']
  ],
  dialogue: [
    ['Assistant', 'Hi, can I help you with anything?'],
    ['Iker', 'Yes, I bought this shirt last week, but it\'s too small. Can I exchange it?'],
    ['Assistant', 'Of course. Do you have the receipt?'],
    ['Iker', 'Yes, here you go.'],
    ['Assistant', 'Great. What size would you like?'],
    ['Iker', 'A large, please. And do you have it in navy?'],
    ['Assistant', 'Let me check… Yes, we do. Here you are.']
  ] },
{ id: 'directions', legal: false, title: 'Pedir y dar direcciones', es: 'Orientarte en una ciudad',
  phrases: [
    ['Excuse me, how do I get to the station?', 'Perdone, ¿cómo llego a la estación?'],
    ['Is it far from here?', '¿Está lejos de aquí?'],
    ['Go straight on until you reach the lights.', 'Siga recto hasta el semáforo.'],
    ['Take the second left.', 'Coja la segunda a la izquierda.'],
    ['It\'s on your right, opposite the bank.', 'Está a su derecha, enfrente del banco.'],
    ['It\'s about a ten-minute walk.', 'Está a unos diez minutos andando.'],
    ['You can\'t miss it.', 'No tiene pérdida.'],
    ['Sorry, I\'m not from around here.', 'Lo siento, no soy de aquí.']
  ],
  dialogue: [
    ['Iker', 'Excuse me, could you tell me how to get to the British Museum?'],
    ['Woman', 'Sure. Go straight down this road and take the second right.'],
    ['Iker', 'Second right, OK.'],
    ['Woman', 'Then keep going until you see a big square. The museum is just behind it.'],
    ['Iker', 'Is it far?'],
    ['Woman', 'No, about ten minutes on foot.'],
    ['Iker', 'Brilliant, thanks a lot.']
  ] },
{ id: 'flat', legal: false, title: 'Alquilar un piso', es: 'Preguntar al casero y negociar',
  phrases: [
    ['Is the flat still available?', '¿El piso sigue disponible?'],
    ['How much is the rent per month?', '¿Cuánto es el alquiler al mes?'],
    ['Are bills included?', '¿Están incluidas las facturas?'],
    ['How much is the deposit?', '¿Cuánto es la fianza?'],
    ['How long is the minimum contract?', '¿Cuál es la duración mínima del contrato?'],
    ['Is it furnished?', '¿Está amueblado?'],
    ['When could I move in?', '¿Cuándo podría entrar a vivir?'],
    ['Would you consider a lower rent for a longer contract?', '¿Aceptaría un alquiler más bajo con un contrato más largo?']
  ],
  dialogue: [
    ['Landlord', 'So, this is the living room. It gets a lot of light in the afternoon.'],
    ['Iker', 'It\'s lovely. Are the bills included in the rent?'],
    ['Landlord', 'Water is, but electricity and internet are separate.'],
    ['Iker', 'OK. And how much is the deposit?'],
    ['Landlord', 'Two months\' rent, returned at the end if there\'s no damage.'],
    ['Iker', 'I\'m interested. Would you consider a slightly lower rent if I signed for two years?'],
    ['Landlord', 'Possibly. Let me think about it and get back to you.']
  ] },
{ id: 'presentation', legal: false, title: 'Hacer una presentación', es: 'Estructurar y conectar ideas en público',
  phrases: [
    ['Good morning, everyone. Thank you for coming.', 'Buenos días a todos. Gracias por venir.'],
    ['Today I\'m going to talk about…', 'Hoy voy a hablar de…'],
    ['I\'ve divided my presentation into three parts.', 'He dividido la presentación en tres partes.'],
    ['Let\'s start with…', 'Empecemos por…'],
    ['Moving on to the next point…', 'Pasando al siguiente punto…'],
    ['As you can see on this slide…', 'Como pueden ver en esta diapositiva…'],
    ['To sum up, …', 'Para resumir, …'],
    ['I\'d be happy to answer any questions.', 'Estaré encantado de responder a sus preguntas.'],
    ['That\'s a great question.', 'Muy buena pregunta.']
  ],
  dialogue: [
    ['Iker', 'Good morning, everyone. Today I\'m going to talk about how AI is changing legal work.'],
    ['Iker', 'I\'ve divided my talk into three parts: what AI can do now, the risks, and what it means for young lawyers.'],
    ['Audience', 'Sorry, could you say a bit more about the risks?'],
    ['Iker', 'Of course. The main risk is that AI can make mistakes that look very convincing, so lawyers must always check its work.'],
    ['Audience', 'Do you think it will replace junior lawyers?'],
    ['Iker', 'That\'s a great question. I think it will change their work, but not replace them.']
  ] },
{ id: 'party', legal: false, title: 'En una fiesta o afterwork', es: 'Charlar de forma relajada',
  phrases: [
    ['Great party, isn\'t it?', 'Buena fiesta, ¿eh?'],
    ['Can I get you a drink?', '¿Te traigo algo de beber?'],
    ['How do you know the host?', '¿De qué conoces al anfitrión?'],
    ['I love your shoes, where are they from?', 'Me encantan tus zapatos, ¿de dónde son?'],
    ['Have you tried the food? It\'s amazing.', '¿Has probado la comida? Está buenísima.'],
    ['I\'m going to grab another drink.', 'Voy a por otra bebida.'],
    ['It was lovely chatting to you.', 'Ha sido un placer charlar contigo.'],
    ['I\'d better get going, I\'ve got an early start.', 'Me tengo que ir, mañana madrugo.']
  ],
  dialogue: [
    ['Sophie', 'Hi! Are you a friend of Dan\'s?'],
    ['Iker', 'Yeah, we work together. And you?'],
    ['Sophie', 'We grew up together in Manchester. So, what do you do?'],
    ['Iker', 'I\'m a trainee lawyer. It\'s pretty intense, but I love it.'],
    ['Sophie', 'Oh nice! I could never do that. Too much reading!'],
    ['Iker', 'Ha, tell me about it. What about you?'],
    ['Sophie', 'I\'m a nurse. Also intense, but in a different way.']
  ] },
{ id: 'videocall', legal: false, title: 'Videollamadas de trabajo', es: 'Problemas técnicos y turnos de palabra',
  phrases: [
    ['Can everyone hear me OK?', '¿Me oís todos bien?'],
    ['Sorry, you\'re on mute.', 'Perdona, tienes el micro silenciado.'],
    ['You\'re breaking up a bit.', 'Se te corta un poco.'],
    ['Can you see my screen?', '¿Veis mi pantalla?'],
    ['Sorry, go ahead.', 'Perdona, sigue tú.'],
    ['I think we lost Mark.', 'Creo que hemos perdido a Mark.'],
    ['Let\'s give it another minute for others to join.', 'Esperemos un minuto más a que se conecten los demás.'],
    ['I\'ll send a quick summary after the call.', 'Mandaré un resumen después de la llamada.']
  ],
  dialogue: [
    ['Laura', 'Hi Iker, can you hear me?'],
    ['Iker', 'Yes, perfectly. Can you see my screen?'],
    ['Laura', 'Not yet… Oh, there it is.'],
    ['Iker', 'Great. So, I\'ve put together a summary of the main issues in the contract.'],
    ['Laura', 'Sorry, you\'re breaking up a bit.'],
    ['Iker', 'Is that better? I\'ve turned my camera off.'],
    ['Laura', 'Yes, much better. Go ahead.']
  ] },
{ id: 'court', legal: true, title: 'Jurídico · En la sala', es: 'Fórmulas y preguntas en una vista',
  phrases: [
    ['May it please the court…', 'Con la venia…'],
    ['Your Honour, I object.', 'Protesto, Señoría.'],
    ['I have no further questions.', 'No hay más preguntas.'],
    ['Could you tell the court what you saw that night?', '¿Puede contar al tribunal qué vio esa noche?'],
    ['Is it not true that…?', '¿No es cierto que…?'],
    ['Please answer yes or no.', 'Responda sí o no, por favor.'],
    ['The defence rests.', 'La defensa ha terminado (no tiene más pruebas).'],
    ['I would ask the court to dismiss the claim.', 'Solicito al tribunal que desestime la demanda.']
  ],
  dialogue: [
    ['Iker', 'Mr Smith, where were you on the evening of the 5th of March?'],
    ['Witness', 'I was at home with my wife.'],
    ['Iker', 'And yet your phone was recorded near the warehouse at 9 pm. Is that correct?'],
    ['Other lawyer', 'Objection, Your Honour. Counsel is testifying.'],
    ['Judge', 'Sustained. Please rephrase the question.'],
    ['Iker', 'Mr Smith, can you explain why your phone was near the warehouse that evening?'],
    ['Witness', 'I… I lent it to a friend.']
  ] },
{ id: 'deal', legal: true, title: 'Jurídico · Explicar una operación al cliente', es: 'Hablar claro de cosas complejas',
  phrases: [
    ['Let me walk you through the main steps.', 'Le explico los pasos principales.'],
    ['In simple terms, …', 'En pocas palabras, …'],
    ['The key risk here is…', 'El riesgo principal aquí es…'],
    ['We recommend that you…', 'Le recomendamos que…'],
    ['This is fairly standard in deals like this.', 'Esto es bastante habitual en operaciones así.'],
    ['We\'re expecting closing by the end of the month.', 'Esperamos cerrar a final de mes.'],
    ['I\'ll keep you posted on any developments.', 'Le mantendré informado de cualquier novedad.']
  ],
  dialogue: [
    ['Client', 'Can you explain what the warranties actually mean for us?'],
    ['Iker', 'Sure. In simple terms, they\'re promises the seller makes about the company. If one turns out to be false, you can claim compensation.'],
    ['Client', 'And is there a limit?'],
    ['Iker', 'Yes, the seller wants to cap their liability at 20% of the price. That\'s fairly standard, but we\'re pushing for 30%.'],
    ['Client', 'What do you recommend?'],
    ['Iker', 'I\'d accept 25% if they agree to a longer warranty period. That gives you better protection overall.']
  ] },
{ id: 'networking', legal: true, title: 'Jurídico · Networking en un evento', es: 'Presentarte a profesionales',
  phrases: [
    ['Hi, I don\'t think we\'ve met. I\'m Iker, I\'m a law student.', 'Hola, creo que no nos conocemos. Soy Iker, estudio Derecho.'],
    ['What area do you work in?', '¿En qué área trabajas?'],
    ['I\'m particularly interested in M&A.', 'Me interesa especialmente el M&A.'],
    ['How did you get into that area?', '¿Cómo llegaste a esa área?'],
    ['What advice would you give to someone starting out?', '¿Qué consejo darías a alguien que empieza?'],
    ['Would you mind if I connected with you on LinkedIn?', '¿Te importa si te agrego en LinkedIn?'],
    ['It was great to meet you.', 'Ha sido un placer conocerte.']
  ],
  dialogue: [
    ['Iker', 'Hi, I don\'t think we\'ve met. I\'m Iker, I\'m in my final year of law.'],
    ['Partner', 'Nice to meet you, Iker. I\'m Helen, I\'m a partner in the banking team.'],
    ['Iker', 'Banking, interesting. How did you get into that area?'],
    ['Partner', 'Mostly by chance. I did a seat there as a trainee and loved it.'],
    ['Iker', 'What advice would you give to someone starting out?'],
    ['Partner', 'Be curious, ask questions, and never send anything you haven\'t checked twice.'],
    ['Iker', 'That\'s really helpful. Would you mind if I connected with you on LinkedIn?'],
    ['Partner', 'Not at all, please do.']
  ] }
);
