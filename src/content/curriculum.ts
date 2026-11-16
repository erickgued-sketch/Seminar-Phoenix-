// The Fénix program: 12 chapters, 100+ levels mapped to the source transcript.
// Levels l01–l18 are fully authored. The rows below are the *blueprint* for the rest:
// each one is tied to source pages and a principle, and becomes a playable level only
// after the content engine generates it and `validateLevel` accepts it.
import { part1 } from './levels/part1';
import { ch04 } from './levels/ch04';
import { ch05 } from './levels/ch05';
import { ch06 } from './levels/ch06';
import { ch07 } from './levels/ch07';
import { ch08 } from './levels/ch08';
import { ch09 } from './levels/ch09';
import { ch10 } from './levels/ch10';
import { part2 } from './levels/part2';
import type { Blueprint, Chapter, Level } from './types';

export const chapters: Chapter[] = [
  { n: 1, art: 'c01', title: { es: 'Los siete ingredientes del éxito', en: 'The seven ingredients of success' }, subtitle: { es: 'Qué significa de verdad tener éxito', en: 'What success really means' } },
  { n: 2, art: 'c02', title: { es: 'Las leyes mentales', en: 'The mental laws' }, subtitle: { es: 'Cómo tus ideas dirigen tus resultados', en: 'How your ideas drive your results' } },
  { n: 3, art: 'c03', title: { es: 'Autoconcepto y mente', en: 'Self-concept and mind' }, subtitle: { es: 'La idea que tienes de ti', en: 'The idea you hold of yourself' } },
  { n: 4, art: 'c04', title: { es: 'Responsabilidad y emociones', en: 'Responsibility and emotions' }, subtitle: { es: 'Soltar la culpa, el enojo y la queja', en: 'Letting go of blame, anger and complaint' } },
  { n: 5, art: 'c05', title: { es: 'Preocupación, cambio y hábitos', en: 'Worry, change and habits' }, subtitle: { es: 'Paz mental y nuevos patrones', en: 'Peace of mind and new patterns' } },
  { n: 6, art: 'c06', title: { es: 'Programar la mente', en: 'Programming the mind' }, subtitle: { es: 'Visualización, afirmaciones y dieta mental', en: 'Visualization, affirmations and mental diet' } },
  { n: 7, art: 'c07', title: { es: 'Aprender y relajarse', en: 'Learning and relaxing' }, subtitle: { es: 'Aprender a aprender y calmar la mente', en: 'Learning to learn and calming the mind' } },
  { n: 8, art: 'c08', title: { es: 'Metas: la habilidad maestra', en: 'Goals: the master skill' }, subtitle: { es: 'De deseos vagos a un plan escrito', en: 'From vague wishes to a written plan' } },
  { n: 9, art: 'c09', title: { es: 'Tiempo y ejecución', en: 'Time and execution' }, subtitle: { es: 'Prioridades, foco y «hazlo ahora»', en: 'Priorities, focus and "do it now"' } },
  { n: 10, art: 'c10', title: { es: 'Creatividad e intuición', en: 'Creativity and intuition' }, subtitle: { es: 'Silencio, ideas y solución de problemas', en: 'Silence, ideas and problem solving' } },
  { n: 11, art: 'c11', title: { es: 'Salud, energía y estrés', en: 'Health, energy and stress' }, subtitle: { es: 'Cuidar el cuerpo y cerrar pendientes', en: 'Caring for the body and closing loops' } },
  { n: 12, art: 'c12', title: { es: 'Relaciones, familia y propósito', en: 'Relationships, family and purpose' }, subtitle: { es: 'Hacer sentir importantes a los demás', en: 'Making others feel important' } },
];

type Row = [number, string, 0 | 1, string, string, string, string];
// [chapter, pages "a-b,c", caveat, title es, title en, principle es, principle en]
const rows: Row[] = [
  // 4 — Responsabilidad y emociones
  [4, '36-38', 0, 'El árbol de las emociones negativas', 'The tree of negative emotions', 'Las emociones negativas se sostienen en raíces que puedes cortar.', 'Negative emotions rest on roots you can cut.'],
  [4, '38', 0, 'Dejar de justificar', 'Stop justifying', 'Mientras te explicas por qué tienes derecho a estar enojado, el enojo sigue vivo.', 'While you explain why you are entitled to be angry, the anger stays alive.'],
  [4, '38-39', 0, 'No tomarlo personal', 'Not taking it personally', 'Si no te identificas con lo que pasa, la emoción pierde fuerza.', 'When you do not identify with what happens, the emotion loses force.'],
  [4, '39-40', 0, 'Culpar: el tronco del árbol', 'Blame: the trunk of the tree', 'Casi toda emoción negativa necesita a alguien a quien culpar; sin culpa, se apaga.', 'Almost every negative emotion needs someone to blame; without blame it fades.'],
  [4, '35', 0, 'Libre para elegir tu respuesta', 'Free to choose your response', 'No eliges lo que ocurre, pero sí cómo te sentirás y qué harás al respecto.', 'You do not choose what happens, but you do choose how you will feel and act about it.'],
  [4, '41-42', 0, 'Lo que repites, lo alimentas', 'What you repeat, you feed', 'Hablar una y otra vez de tus problemas mantiene vivas las emociones que provocan.', 'Talking over and over about your problems keeps the emotions they cause alive.'],
  [4, '43-44', 0, 'Cambiarlo o aceptarlo', 'Change it or accept it', 'Ante lo que te hace infeliz hay dos salidas responsables: actuar o aceptarlo sin queja.', 'Faced with what makes you unhappy there are two responsible exits: act, or accept it without complaint.'],
  [4, '46-49', 0, 'De dónde viene la culpa', 'Where guilt comes from', 'La culpa se aprende en la infancia y a menudo se usa para controlar.', 'Guilt is learned in childhood and is often used to control.'],
  [4, '50-51', 0, 'Cómo se nota la culpa', 'How guilt shows up', 'Sentirte inferior, no merecer o dejarte manipular son señales de culpa aprendida.', 'Feeling inferior, undeserving or easily manipulated are signs of learned guilt.'],
  [4, '51-52', 0, 'El lenguaje de víctima', 'Victim language', 'Palabras como «trataré» o «desearía» anuncian que no esperas lograrlo.', 'Words like "I will try" or "I wish" announce that you do not expect to do it.'],
  [4, '53', 0, 'Soltar la culpa', 'Releasing guilt', 'Deja de criticarte, de culpar a otros y de usar la culpa con los demás.', 'Stop criticizing yourself, blaming others and using guilt on people.'],
  [4, '53-54', 0, 'El perdón', 'Forgiveness', 'Perdonar libera al que perdona: sueltas el peso para poder avanzar.', 'Forgiving frees the one who forgives: you drop the weight so you can move on.'],
  [4, '54', 0, 'Decir «lo siento»', 'Saying "I am sorry"', 'Disculparte cuando te equivocas cierra el asunto y fortalece tu carácter.', 'Apologizing when you are wrong closes the matter and strengthens your character.'],
  // 5 — Preocupación, cambio y hábitos
  [5, '55', 0, 'La paz mental como meta', 'Peace of mind as a goal', 'Pocas personas tienen paz mental porque no la ponen como meta.', 'Few people have peace of mind because they do not set it as a goal.'],
  [5, '56', 1, 'Qué hay detrás de la preocupación', 'What is behind worry', 'La mayoría de lo que te preocupa nunca ocurre o no depende de ti.', 'Most of what you worry about never happens or is not up to you.'],
  [5, '56-57', 0, 'Un día a la vez y con hechos', 'One day at a time, with facts', 'Vive el día de hoy y consigue los datos antes de preocuparte.', 'Live today and get the facts before you worry.'],
  [5, '57-58', 0, 'El destructor de preocupaciones', 'The worry buster', 'Define la preocupación, imagina lo peor, acéptalo y trabaja para mejorarlo.', 'Define the worry, picture the worst, accept it and work to improve on it.'],
  [5, '59', 0, 'Acción con propósito', 'Purposeful action', 'No puedes preocuparte y actuar con decisión sobre lo mismo a la vez.', 'You cannot worry and act decisively on the same thing at once.'],
  [5, '60', 1, 'El equivalente mental', 'The mental equivalent', 'Para tener algo afuera, primero construye su imagen clara adentro.', 'To have something outside, first build its clear image inside.'],
  [5, '61', 0, 'Flexibilidad frente a ideas fijas', 'Flexibility versus fixed ideas', 'Sé claro en la meta y flexible en el camino; la rigidez frena el cambio.', 'Be clear about the goal and flexible about the path; rigidity blocks change.'],
  [5, '63', 0, 'La ley del hábito', 'The law of habit', 'Casi todo lo que haces es hábito; sin una decisión nueva, seguirás igual.', 'Almost everything you do is habit; without a new decision, you will stay the same.'],
  [5, '63-64', 0, 'La ley de la emoción', 'The law of emotion', 'Decides por emoción; el deseo y el miedo compiten y gana el más fuerte.', 'You decide by emotion; desire and fear compete and the stronger wins.'],
  [5, '64', 0, 'La ley de la expresión', 'The law of expression', 'Lo que imprimes en tu mente con emoción acaba expresándose en tu conducta.', 'What you impress on your mind with emotion ends up expressed in your behavior.'],
  [5, '65', 0, 'La ley de la reversibilidad', 'The law of reversibility', 'Actuar como si ya sintieras algo ayuda a generar ese sentimiento.', 'Acting as if you already felt something helps generate that feeling.'],
  [5, '66-67', 0, 'Práctica y repetición', 'Practice and repetition', 'Lo que practicas una y otra vez se vuelve un hábito nuevo.', 'What you practice over and over becomes a new habit.'],
  [5, '67-68', 0, 'Decisión y disciplina', 'Decision and discipline', 'El cambio pide una decisión firme y la disciplina de sostenerla.', 'Change requires a firm decision and the discipline to sustain it.'],
  [5, '69', 0, 'La dieta mental de 21 días', 'The 21-day mental diet', 'Mantén tu mente en lo que quieres durante 21 días para instalar el patrón.', 'Keep your mind on what you want for 21 days to install the pattern.'],
  // 6 — Programar la mente
  [6, '70-71', 0, 'Diseña tu ideal', 'Design your ideal', 'Define a la persona que quieres ser y estudia a quienes ya admiras.', 'Define the person you want to be and study the people you already admire.'],
  [6, '72', 0, 'Una nueva autoimagen', 'A new self-image', 'Piensa en ti como la persona que quieres ser, también en tus días difíciles.', 'Think of yourself as the person you want to be, even on hard days.'],
  [6, '72-73', 0, 'Visualización', 'Visualization', 'Ensayar mentalmente una conducta te prepara para ejecutarla con calma.', 'Mentally rehearsing a behavior prepares you to perform it calmly.'],
  [6, '74-76', 0, 'Afirmaciones: las tres P', 'Affirmations: the three Ps', 'Una afirmación eficaz es personal, positiva y en presente.', 'An effective affirmation is personal, positive and present-tense.'],
  [6, '77-78', 0, 'Actúa el papel', 'Act the part', 'Compórtate como la persona que quieres ser hasta que se vuelva natural.', 'Behave like the person you want to be until it becomes natural.'],
  [6, '79-80,86', 0, 'Proteína mental', 'Mental protein', 'Tu mente se nutre de lo que lee, ve y oye: elige alimento de calidad.', 'Your mind is fed by what it reads, sees and hears: choose quality food.'],
  [6, '81-82', 0, 'Leer y escuchar cada día', 'Read and listen daily', 'Una hora diaria de lectura o audio en tu campo cambia tu carrera con los años.', 'An hour a day of reading or audio in your field changes your career over the years.'],
  [6, '83-85', 0, 'Tu grupo de referencia', 'Your reference group', 'Te pareces a las personas con quienes más te juntas: elígelas a conciencia.', 'You become like the people you spend most time with: choose them consciously.'],
  [6, '87', 0, '«La próxima vez…»', '"Next time…"', 'Tras un error, cancélalo y di cómo lo harás la próxima vez.', 'After a mistake, cancel it and state how you will do it next time.'],
  [6, '88-89', 0, 'Metas creíbles', 'Believable goals', 'Una meta demasiado lejana no la cree tu mente; sube por escalones.', 'Your mind will not believe a goal that is too far; climb by steps.'],
  [6, '90-91', 0, 'Programar por escrito', 'Programming in writing', 'Escribir tus metas en presente cada día las graba con más fuerza.', 'Writing your goals in the present tense every day engraves them more deeply.'],
  [6, '93-94', 0, 'El repaso mental', 'Mental rehearsal', 'Antes de un evento, recuerda un éxito anterior e imagina el resultado ideal.', 'Before an event, recall a past success and picture the ideal outcome.'],
  [6, '92,95-97', 0, 'Tarjetas de metas', 'Goal cards', 'Repasa tus metas en tarjetas dos veces al día, relajado y viéndolas cumplidas.', 'Review your goals on cards twice a day, relaxed and seeing them achieved.'],
  // 7 — Aprender y relajarse
  [7, '98-99', 0, 'Eres más capaz de lo que crees', 'You are more capable than you think', 'La inteligencia es una forma de actuar y crece cuando la usas.', 'Intelligence is a way of acting and it grows when you use it.'],
  [7, '100-101', 1, 'Dos hemisferios y ritmos de la mente', 'Two hemispheres and rhythms of mind', 'El seminario describe estados relajados como los mejores para aprender.', 'The seminar describes relaxed states as the best for learning.'],
  [7, '102-104', 1, 'Aprendizaje acelerado', 'Accelerated learning', 'Relajación, música suave y repaso mejoran, según el seminario, la retención.', 'Relaxation, soft music and review improve retention, according to the seminar.'],
  [7, '104-105', 0, 'Reglas para aprender', 'Rules for learning', 'Aprendes mejor con un motivo propio, en bloques cortos y practicando.', 'You learn best with your own reason, in short blocks and by practicing.'],
  [7, '106', 0, 'Meditación sencilla', 'Simple meditation', 'Cierra los ojos, respira hondo y repite una palabra al exhalar.', 'Close your eyes, breathe deeply and repeat one word as you exhale.'],
  [7, '107-111', 0, 'Relajación con afirmaciones', 'Relaxation with affirmations', 'Relájate a fondo dos veces al día y repasa tus afirmaciones en calma.', 'Relax deeply twice a day and review your affirmations calmly.'],
  // 8 — Metas
  [8, '112-113', 0, 'El éxito son las metas', 'Success is goals', 'Quien no tiene metas propias trabaja para las metas de otros.', 'People without their own goals work for the goals of others.'],
  [8, '114-115', 0, 'Un mecanismo que busca metas', 'A goal-seeking mechanism', 'Tu mente avanza sola hacia una meta clara; sin meta, da vueltas.', 'Your mind moves by itself toward a clear goal; without one, it circles.'],
  [8, '115-117', 0, 'Por qué casi nadie fija metas', 'Why almost no one sets goals', 'No nos enseñaron cómo, tememos la crítica y tememos fallar.', 'We were not taught how, we fear criticism and we fear failing.'],
  [8, '117-118', 0, 'Fallar es aprender', 'Failing is learning', 'Cada tropiezo trae una lección; quien más intenta, más aprende.', 'Every setback carries a lesson; whoever tries most learns most.'],
  [8, '120', 0, 'Acres de diamantes', 'Acres of diamonds', 'Muchas veces la oportunidad está donde ya estás; mírala antes de irte.', 'Often the opportunity is where you already are; look before you leave.'],
  [8, '120-121', 0, 'Metas en equilibrio', 'Goals in balance', 'Fija metas personales y familiares, de trabajo y de mejora propia.', 'Set personal and family goals, work goals and self-improvement goals.'],
  [8, '122-124', 0, 'Las siete preguntas', 'The seven questions', 'Responder rápido a siete preguntas revela lo que de verdad quieres.', 'Answering seven quick questions reveals what you truly want.'],
  [8, '124', 0, 'Metas que encajan con tus valores', 'Goals that fit your values', 'La autoestima sube cuando tus metas y tus valores coinciden.', 'Self-esteem rises when your goals and your values match.'],
  [8, '125-126', 0, 'Tu propósito principal definido', 'Your definite chief aim', 'Elige la meta que más cambiaría tu vida y dale prioridad.', 'Choose the one goal that would most change your life and give it priority.'],
  [8, '126-127', 0, 'Pasos 1 y 2: deseo y creencia', 'Steps 1 and 2: desire and belief', 'Quiérelo de verdad y hazlo creíble para ti.', 'Truly want it and make it believable to you.'],
  [8, '127-128', 0, 'Paso 3: escríbelo', 'Step 3: write it down', 'Una meta sin escribir es un deseo; al escribirla la concretas.', 'An unwritten goal is a wish; writing it makes it concrete.'],
  [8, '128-129', 0, 'Paso 4: tus porqués', 'Step 4: your reasons why', 'Cuantas más razones tengas, más fuerza tendrás para persistir.', 'The more reasons you have, the more strength you have to persist.'],
  [8, '129-130', 0, 'Pasos 5 y 6: punto de partida y fecha', 'Steps 5 and 6: starting point and deadline', 'Mide dónde estás hoy y ponle fecha a la meta.', 'Measure where you are today and put a date on the goal.'],
  [8, '130-132', 0, 'Paso 7: tu mayor obstáculo', 'Step 7: your biggest obstacle', 'Identifica la roca principal del camino y empieza por ella.', 'Identify the main rock in the path and start with it.'],
  [8, '132-135', 0, 'Pasos 8 y 9: saber y cooperar', 'Steps 8 and 9: knowledge and cooperation', 'Define qué necesitas aprender y a quién necesitas ayudar para que te ayuden.', 'Define what you need to learn and whom you need to help so they help you.'],
  [8, '135-136', 0, 'Pasos 10–12: plan, imagen y persistencia', 'Steps 10–12: plan, image and persistence', 'Haz una lista ordenada, visualiza el resultado y no te rindas.', 'Make an ordered list, visualize the outcome and do not give up.'],
  // 9 — Tiempo y ejecución
  [9, '136-138', 0, 'Claridad antes que prisa', 'Clarity before hurry', 'Muchos pierden tiempo porque no saben con claridad qué quieren.', 'Many waste time because they are not clear about what they want.'],
  [9, '138', 0, 'Piensa en papel', 'Think on paper', 'Empieza cada día con una lista escrita de lo que harás.', 'Start each day with a written list of what you will do.'],
  [9, '139', 0, 'Lo vital frente a lo trivial', 'The vital versus the trivial', 'Pregúntate cuál es el uso más valioso de tu tiempo ahora mismo.', 'Ask what the most valuable use of your time is right now.'],
  [9, '140', 0, 'Una sola cosa hasta terminar', 'One thing until done', 'Toma la tarea más importante y no la sueltes hasta acabarla.', 'Take the most important task and do not put it down until it is finished.'],
  [9, '141', 0, 'Sentido de urgencia', 'Sense of urgency', 'Prioriza bien y luego muévete rápido.', 'Prioritize well and then move fast.'],
  [9, '174', 0, 'Hazlo ahora', 'Do it now', 'Terminar una tarea da energía; dejarla a medias la roba.', 'Finishing a task gives energy; leaving it half done drains it.'],
  // 10 — Creatividad e intuición
  [10, '141-144', 1, 'La mente superconsciente', 'The superconscious mind', 'El seminario describe una fuente de ideas que se activa con metas claras.', 'The seminar describes a source of ideas activated by clear goals.'],
  [10, '145-146', 0, 'Claridad y expectativa confiada', 'Clarity and confident expectation', 'Define con precisión lo que quieres y espera con calma una solución.', 'Define precisely what you want and calmly expect a solution.'],
  [10, '148-149', 0, 'Los obstáculos enseñan', 'Obstacles teach', 'Las dificultades del camino suelen traer la lección que necesitabas.', 'Difficulties along the way often bring the lesson you needed.'],
  [10, '150-151', 1, 'Coincidencias útiles', 'Useful coincidences', 'Con una meta clara notas personas y datos que antes pasaban de largo.', 'With a clear goal you notice people and facts that used to pass you by.'],
  [10, '152-153', 0, 'Entrar en el silencio', 'Entering the silence', 'Siéntate a solas y en silencio de 30 a 60 minutos y escucha lo que surge.', 'Sit alone in silence for 30 to 60 minutes and listen to what arises.'],
  [10, '154-156', 0, 'Concentración como un láser', 'Laser-like concentration', 'Enfocar toda tu atención en una sola pregunta multiplica tus ideas.', 'Focusing all your attention on one question multiplies your ideas.'],
  [10, '157-158', 0, 'El método de las 20 ideas', 'The 20-idea method', 'Escribe tu meta como pregunta y oblígate a dar 20 respuestas.', 'Write your goal as a question and force yourself to give 20 answers.'],
  [10, '159-162', 0, 'Resolver problemas con método', 'Solving problems with method', 'Llámalo situación, defínelo por escrito, busca causas y varias soluciones.', 'Call it a situation, define it in writing, look for causes and several solutions.'],
  [10, '163', 0, 'Lluvia de ideas en grupo', 'Group brainstorming', 'Separa generar ideas de evaluarlas para que fluyan más y mejores.', 'Separate generating ideas from judging them so more and better ones flow.'],
  // 11 — Salud, energía y estrés
  [11, '164-165', 1, 'Tu cuerpo también refleja', 'Your body reflects too', 'El seminario aplica la correspondencia a la salud: todo lo que haces cuenta.', 'The seminar applies correspondence to health: everything you do counts.'],
  [11, '165-168', 1, 'Peso y alimentación', 'Weight and diet', 'El seminario propone peso adecuado, comida sencilla y mucha agua.', 'The seminar proposes proper weight, simple food and plenty of water.'],
  [11, '168-169', 1, 'Moverte y no fumar', 'Move and do not smoke', 'Ejercicio aeróbico regular y evitar el tabaco como bases de energía.', 'Regular aerobic exercise and avoiding tobacco as foundations of energy.'],
  [11, '170-171', 1, 'Descanso y afirmaciones de salud', 'Rest and health affirmations', 'Duerme lo suficiente y háblate de tu salud en presente.', 'Sleep enough and talk to yourself about your health in the present tense.'],
  [11, '172-173', 0, 'Felicidad es avanzar', 'Happiness is progress', 'Te sientes feliz cuando avanzas paso a paso hacia algo que valoras.', 'You feel happy when you advance step by step toward something you value.'],
  [11, '174-175', 0, 'Cerrar asuntos incompletos', 'Closing unfinished business', 'Suelta relaciones o trabajos que terminaron: responsabilízate, perdona y desea bien.', 'Let go of relationships or jobs that ended: take responsibility, forgive and wish well.'],
  [11, '175-176', 0, 'Haz lo que temes', 'Do the thing you fear', 'Enfrentar el miedo lo reduce; di «puedo hacerlo» y da el paso.', 'Facing fear shrinks it; say "I can do it" and take the step.'],
  [11, '178-181', 0, 'El patrón «tipo A»', 'The "type A" pattern', 'Trabajar sin parar para ganar aprobación agota; el seminario propone equilibrio.', 'Working nonstop to win approval is exhausting; the seminar proposes balance.'],
  [11, '181-182', 0, 'Dejar de negar', 'Stop denying', 'Negar un problema crea tensión; nombrarlo es el primer alivio.', 'Denying a problem creates tension; naming it is the first relief.'],
  [11, '183-185', 0, 'El enojo y su precio', 'Anger and its price', 'El enojo necesita que te veas como víctima; pregúntate qué precio pagarías por soltarlo.', 'Anger needs you to see yourself as a victim; ask what price you would pay to release it.'],
  // 12 — Relaciones, familia y propósito
  [12, '186-187', 0, 'El esfuerzo indirecto', 'The indirect effort', 'Para que se interesen por ti, interésate de verdad por los demás.', 'For others to take an interest in you, take a genuine interest in them.'],
  [12, '188', 0, 'Hacer sentir importante', 'Making others feel important', 'Lo que haces por la autoestima de otro eleva también la tuya.', 'What you do for another’s self-esteem raises yours too.'],
  [12, '188-189', 0, 'Aceptar y no discutir', 'Accept and do not argue', 'Acepta a la gente como es y busca entender antes de ser entendido.', 'Accept people as they are and seek to understand before being understood.'],
  [12, '189-190', 0, 'Eliminar la crítica', 'Eliminating criticism', 'Deja de criticar, sobre todo en casa.', 'Stop criticizing, especially at home.'],
  [12, '190', 0, 'Reconocer y agradecer', 'Appreciate and thank', 'Di «gracias» a menudo y sonríe: eleva a quien lo recibe y a ti.', 'Say "thank you" often and smile: it lifts the receiver and you.'],
  [12, '190-191', 0, 'Admirar y aprobar', 'Admire and approve', 'Elogia de forma concreta y a tiempo lo que otros hacen bien.', 'Praise specifically and promptly what others do well.'],
  [12, '193-196', 0, 'Pareja: compatibilidad y comunicación', 'Couples: compatibility and communication', 'Las parejas duran por valores compartidos y por hablar y escuchar a diario.', 'Couples last through shared values and daily talking and listening.'],
  [12, '197-199', 0, 'Errores que desgastan una relación', 'Mistakes that wear a relationship down', 'Querer cambiar al otro, los celos y la autocompasión dañan el vínculo.', 'Trying to change the other, jealousy and self-pity damage the bond.'],
  [12, '200-204', 0, 'Criar con amor incondicional', 'Raising with unconditional love', 'Dile a tus hijos que los quieres, míralos, abrázalos y dales atención plena.', 'Tell your children you love them, look at them, hug them and give them full attention.'],
  [12, '205-207', 0, 'Pedir perdón a un hijo', 'Apologizing to a child', 'Reconocer tus errores ante tus hijos les enseña valor y los libera.', 'Admitting your mistakes to your children teaches them courage and frees them.'],
  [12, '207-209', 0, 'Tu misión', 'Your mission', 'El seminario propone que el propósito es servir a otros con lo mejor de ti.', 'The seminar proposes that purpose is serving others with the best of you.'],
  [12, '210-211', 0, 'Amar y aceptar', 'Love and accept', 'Empieza por aceptarte y extiende esa tolerancia a los demás.', 'Start by accepting yourself and extend that tolerance to others.'],
];

const parsePages = (s: string): number[] => {
  const out: number[] = [];
  for (const part of s.split(',')) {
    const [a, b] = part.split('-').map(Number);
    for (let p = a; p <= (b ?? a); p++) out.push(p);
  }
  return out;
};

export const authored: Level[] = [...part1, ...part2, ...ch04, ...ch05, ...ch06, ...ch07, ...ch08, ...ch09, ...ch10];

// A chapter leaves the blueprint as soon as its lessons are authored.
const authoredChapters = new Set(authored.map((l) => l.chapter));
const pending = rows.filter((r) => !authoredChapters.has(r[0]));

export const blueprint: Blueprint[] = pending.map((r, i) => ({
  id: `b${String(i + authored.length + 1).padStart(3, '0')}`,
  chapter: r[0],
  pages: parsePages(r[1]),
  caveat: r[2] === 1,
  title: { es: r[3], en: r[4] },
  principle: { es: r[5], en: r[6] },
}));

export type PathNode =
  | { kind: 'level'; n: number; id: string; chapter: number; level: Level }
  | { kind: 'blueprint'; n: number; id: string; chapter: number; bp: Blueprint };

/** The full ordered path shown on the Journey map. */
export const path: PathNode[] = [
  ...authored.map((level, i): PathNode => ({ kind: 'level', n: i + 1, id: level.id, chapter: level.chapter, level })),
  ...blueprint.map((bp, i): PathNode => ({ kind: 'blueprint', n: authored.length + i + 1, id: bp.id, chapter: bp.chapter, bp })),
];

export const totalLevels = path.length;
export const levelById = (id: string): Level | undefined => authored.find((l) => l.id === id);
export const chapterOf = (n: number): Chapter => chapters.find((c) => c.n === n) ?? chapters[0];
