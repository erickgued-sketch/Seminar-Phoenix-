// Mind Studio: practices that turn the seminar's exercises into guided, repeatable tools.
// Presented as reflection and attention practices — no clinical promises.
import type { L, Practice } from './types';

const l = (es: string, en: string): L => ({ es, en });

export const practices: Practice[] = [
  {
    id: 'gratitude', icon: '🙏', minutes: 2, mode: 'list', listTarget: 3, origin: 'complement', pages: [190],
    title: l('Diario de gratitud', 'Gratitude journal'),
    what: l('Anota tres cosas concretas que agradeces hoy y a quién le darás las gracias.', 'Write three specific things you are grateful for today and who you will thank.'),
    note: l('Práctica complementaria de la app. Se apoya en la idea del seminario de reconocer y decir «gracias» a menudo (p. 190).', 'Complementary app practice. It builds on the seminar’s idea of appreciating and saying "thank you" often (p. 190).'),
    steps: [l('Piensa en las últimas 24 horas.', 'Think about the last 24 hours.'), l('Escribe tres cosas concretas, no generales.', 'Write three specific things, not general ones.'), l('Elige una persona y dale las gracias hoy.', 'Pick one person and thank them today.')],
    prompts: [l('Agradezco…', 'I am grateful for…')],
  },
  {
    id: 'meditation', icon: '🧘', minutes: 5, mode: 'timer', timerSeconds: 300, origin: 'seminar', pages: [106],
    title: l('Meditación sencilla', 'Simple meditation'),
    what: l('Cierra los ojos, respira hondo y repite mentalmente una palabra cada vez que exhalas.', 'Close your eyes, breathe deeply and silently repeat one word each time you exhale.'),
    steps: [l('Siéntate cómodo y cierra los ojos.', 'Sit comfortably and close your eyes.'), l('Respira profundo y lento.', 'Breathe deeply and slowly.'), l('Al exhalar, repite una palabra neutra, por ejemplo «uno».', 'On each exhale, repeat a neutral word, for example "one".'), l('Si te distraes, vuelve a la palabra sin juzgarte.', 'If you drift, return to the word without judging yourself.')],
  },
  {
    id: 'breathing', icon: '🌬️', minutes: 2, mode: 'timer', timerSeconds: 128, origin: 'complement', pages: [],
    title: l('Respiración 4-4-4-4', 'Box breathing 4-4-4-4'),
    what: l('Inhala 4, sostén 4, exhala 4, sostén 4. Rai respira contigo.', 'Inhale 4, hold 4, exhale 4, hold 4. Rai breathes with you.'),
    note: l('Práctica complementaria de la app para recuperar la calma antes de actuar.', 'Complementary app practice to regain calm before acting.'),
    steps: [l('Inhala contando 4.', 'Inhale for 4.'), l('Sostén 4.', 'Hold for 4.'), l('Exhala 4.', 'Exhale for 4.'), l('Sostén 4 y repite.', 'Hold for 4 and repeat.')],
  },
  {
    id: 'silence', icon: '🌅', minutes: 30, mode: 'timer', timerSeconds: 1800, origin: 'seminar', pages: [152, 153],
    title: l('Entrar en el silencio', 'Entering the silence'),
    what: l('Siéntate a solas, sin estímulos, de 30 a 60 minutos. Lleva una pregunta y escucha lo que surja.', 'Sit alone, with no stimuli, for 30 to 60 minutes. Bring one question and listen to what arises.'),
    note: l('El seminario lo presenta como su método más potente para generar ideas. Tómalo como un espacio de reflexión, sin garantía de resultados.', 'The seminar presents it as its most powerful method for generating ideas. Treat it as a space for reflection, with no guaranteed results.'),
    steps: [l('Elige una pregunta o meta.', 'Choose one question or goal.'), l('Sin teléfono, música ni notas durante la sesión.', 'No phone, music or notes during the session.'), l('Deja pasar la inquietud de los primeros minutos.', 'Let the restlessness of the first minutes pass.'), l('Al terminar, anota la idea más clara y da un primer paso.', 'When you finish, write down the clearest idea and take a first step.')],
  },
  {
    id: 'affirmations', icon: '💬', minutes: 3, mode: 'affirm', listTarget: 3, origin: 'seminar', pages: [74, 75, 76],
    title: l('Afirmaciones personales', 'Personal affirmations'),
    what: l('Escribe afirmaciones con las tres P —personales, positivas y en presente— y repásalas.', 'Write affirmations with the three Ps — personal, positive and present-tense — and review them.'),
    steps: [l('Personal: empieza con «Yo…».', 'Personal: start with "I…".'), l('Positiva: di lo que quieres, no lo que evitas.', 'Positive: say what you want, not what you avoid.'), l('Presente: como si ya fuera cierto hoy.', 'Present: as if it were already true today.'), l('Léelas en voz alta, con calma, mañana y noche.', 'Read them aloud, calmly, morning and night.')],
    prompts: [l('Yo…', 'I…')],
  },
  {
    id: 'visualization', icon: '🎬', minutes: 3, mode: 'timer', timerSeconds: 180, origin: 'seminar', pages: [72, 73, 93, 94, 97],
    title: l('Visualización', 'Visualization'),
    what: l('Ensaya mentalmente tu meta o un momento importante viéndolo salir bien.', 'Mentally rehearse your goal or an important moment, seeing it go well.'),
    steps: [l('Relájate y cierra los ojos.', 'Relax and close your eyes.'), l('Imagina el resultado ideal con detalle: qué ves, oyes y sientes.', 'Picture the ideal result in detail: what you see, hear and feel.'), l('Recuerda una ocasión en la que algo parecido te salió bien.', 'Recall a time something similar went well for you.'), l('Abre los ojos y da el primer paso real.', 'Open your eyes and take the first real step.')],
  },
  {
    id: 'worry', icon: '🧯', minutes: 5, mode: 'text', origin: 'seminar', pages: [57, 58],
    title: l('Destructor de preocupaciones', 'Worry buster'),
    what: l('Cuatro pasos por escrito para desactivar una preocupación concreta.', 'Four written steps to defuse one specific worry.'),
    steps: [],
    prompts: [l('1. ¿Qué me preocupa exactamente?', '1. What exactly am I worried about?'), l('2. ¿Qué es lo peor que podría pasar de forma realista?', '2. What is the worst that could realistically happen?'), l('3. Si pasara, ¿cómo lo afrontaría? (Decido aceptarlo si ocurre.)', '3. If it happened, how would I cope? (I decide to accept it should it occur.)'), l('4. ¿Qué puedo hacer ahora para mejorar ese resultado?', '4. What can I do right now to improve on that outcome?')],
  },
  {
    id: 'beliefs', icon: '🔍', minutes: 5, mode: 'text', origin: 'seminar', pages: [9, 10],
    title: l('Revisión de creencias', 'Belief review'),
    what: l('Examina un «no puedo» y conviértelo en una creencia más útil.', 'Examine an "I cannot" and turn it into a more useful belief.'),
    steps: [],
    prompts: [l('Creencia que me limita:', 'Belief that limits me:'), l('Evidencia real a favor:', 'Real evidence for it:'), l('Evidencia en contra:', 'Evidence against it:'), l('Versión más útil («Puedo aprender a…»):', 'More useful version ("I can learn to…"):')],
  },
  {
    id: 'seven', icon: '❓', minutes: 7, mode: 'text', origin: 'seminar', pages: [122, 123, 124],
    title: l('Las siete preguntas', 'The seven questions'),
    what: l('Responde rápido, sin editar. El seminario da menos de un minuto por pregunta.', 'Answer fast, without editing. The seminar gives under a minute per question.'),
    steps: [],
    prompts: [
      l('1. ¿Cuáles son las cinco cosas que más valoras en la vida?', '1. What five things do you value most in life?'),
      l('2. ¿Cuáles son tus tres metas más importantes ahora mismo?', '2. What are your three most important goals right now?'),
      l('3. ¿Qué harías si supieras que te quedan seis meses de vida?', '3. What would you do if you knew you had six months to live?'),
      l('4. ¿Qué harías si mañana recibieras un millón de dólares?', '4. What would you do if you received a million dollars tomorrow?'),
      l('5. ¿Qué has querido hacer siempre y no te has atrevido a intentar?', '5. What have you always wanted to do but been afraid to try?'),
      l('6. ¿Qué actividades te dan mayor sensación de importancia y satisfacción?', '6. Which activities give you the greatest feeling of importance and satisfaction?'),
      l('7. ¿Qué gran sueño te atreverías a perseguir si supieras que no puedes fallar?', '7. What one great dream would you dare to pursue if you knew you could not fail?'),
    ],
  },
  {
    id: 'mindstorm', icon: '💡', minutes: 15, mode: 'list', listTarget: 20, origin: 'seminar', pages: [157, 158],
    title: l('Método de las 20 ideas', '20-idea method'),
    what: l('Escribe tu meta o problema como pregunta y oblígate a dar 20 respuestas. Luego elige una y actúa hoy.', 'Write your goal or problem as a question and force yourself to give 20 answers. Then pick one and act today.'),
    steps: [l('Formula la pregunta: «¿Cómo puedo…?».', 'Phrase the question: "How can I…?".'), l('Escribe 20 respuestas; las últimas son las más valiosas.', 'Write 20 answers; the last ones are the most valuable.'), l('Elige una y empieza hoy.', 'Pick one and start today.')],
    prompts: [l('Idea…', 'Idea…')],
  },
  {
    id: 'forgive', icon: '🕊️', minutes: 5, mode: 'text', origin: 'seminar', pages: [53, 54, 174, 175],
    title: l('Perdonar y soltar', 'Forgive and let go'),
    what: l('Cierra un asunto pendiente con una persona o una etapa. Es un ejercicio privado: nadie más lo lee.', 'Close unfinished business with a person or a chapter. This is a private exercise: no one else reads it.'),
    note: l('Si el daño fue grave o sigue ocurriendo, perdonar no significa tolerarlo: busca apoyo profesional.', 'If the harm was serious or is ongoing, forgiving does not mean tolerating it: seek professional support.'),
    steps: [],
    prompts: [l('¿Qué situación o persona sigo cargando?', 'Which situation or person am I still carrying?'), l('¿De qué parte me hago responsable?', 'Which part do I take responsibility for?'), l('Escribe: «Te perdono por…» (o «Me perdono por…»).', 'Write: "I forgive you for…" (or "I forgive myself for…").'), l('¿Qué le deseo a esa persona —o a mí— a partir de hoy?', 'What do I wish for that person — or myself — from today on?')],
  },
  {
    id: 'responsible', icon: '🧭', minutes: 2, mode: 'steps', origin: 'seminar', pages: [40],
    title: l('«Soy responsable»', '"I am responsible"'),
    what: l('Un reinicio rápido cuando aparece el enojo, la queja o la excusa.', 'A quick reset when anger, complaint or excuses show up.'),
    steps: [l('Nombra la emoción: «estoy enojado / frustrado».', 'Name the emotion: "I am angry / frustrated".'), l('Repite despacio tres veces: «Soy responsable».', 'Slowly repeat three times: "I am responsible".'), l('Pregúntate: «¿Qué depende de mí ahora?».', 'Ask: "What is up to me right now?".'), l('Haz esa acción, por pequeña que sea.', 'Do that action, however small.')],
  },
  {
    id: 'written-goals', icon: '✍️', minutes: 4, mode: 'list', listTarget: 3, origin: 'seminar', pages: [90, 91, 95, 96],
    title: l('Metas por escrito', 'Goals in writing'),
    what: l('Reescribe hoy tus metas principales en presente, como si ya fueran un hecho.', 'Rewrite your main goals today in the present tense, as if already real.'),
    steps: [l('Escribe cada meta en presente: «Gano…», «Peso…», «Hablo…».', 'Write each goal in the present: "I earn…", "I weigh…", "I speak…".'), l('Léela e imagina un segundo que ya es real.', 'Read it and picture for a second that it is already real.'), l('Repite mañana sin copiar la lista anterior.', 'Repeat tomorrow without copying the previous list.')],
    prompts: [l('Meta en presente…', 'Goal in present tense…')],
  },
  {
    id: 'mental-diet', icon: '🥗', minutes: 2, mode: 'steps', origin: 'seminar', pages: [69, 79, 86],
    title: l('Dieta mental de 21 días', '21-day mental diet'),
    what: l('Durante 21 días, cuida lo que entra en tu mente y mantén el foco en lo que quieres.', 'For 21 days, watch what enters your mind and keep the focus on what you want.'),
    steps: [l('Hoy empecé el día leyendo o escuchando algo que me nutre.', 'Today I started the day reading or listening to something nourishing.'), l('Sustituí un pensamiento negativo por uno útil.', 'I replaced one negative thought with a useful one.'), l('Evité quejas y conversaciones que me drenan.', 'I avoided complaints and draining conversations.'), l('Repasé mis metas.', 'I reviewed my goals.')],
  },
];

export const practiceById = (id: string) => practices.find((p) => p.id === id);
