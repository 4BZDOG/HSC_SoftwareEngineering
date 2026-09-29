/* ============================================================
   "Check your understanding" question bank for Programming Mechatronics (data only).
   One quiz per NESA subheading, keyed "mech-<part number>".
   Each question: q, options[4], answer (index), why (explanation).
   Rendered by js/quiz.js into <div class="quiz" data-quiz="…">.
   ============================================================ */
window.HSC_QUIZZES = Object.assign(window.HSC_QUIZZES || {}, {
  'mech-1': [
    { q: 'Which is an actuator?',
      options: ['Ultrasonic sensor', 'Servo motor', 'Light-dependent resistor', 'Temperature probe'], answer: 1,
      why: 'Actuators produce movement or output; sensors measure the environment.' },
    { q: 'A 2000 mAh battery powers a system that draws 500 mA. Roughly how long will it last?',
      options: ['2 hours', '4 hours', '10 hours', '25 hours'], answer: 1,
      why: '2000 ÷ 500 = 4 hours, before allowing for battery ageing and temperature.' },
    { q: 'Why give motors their own power supply?',
      options: ['Motors need less voltage', 'Their current surges can reset the microcontroller', 'It makes wiring diagrams shorter', 'Sensors only work on batteries'], answer: 1,
      why: 'Sudden motor current can cause a brownout that restarts the controller.' },
  ],
  'mech-2': [
    { q: 'Which is a closed loop system?',
      options: ['A toaster on a timer', 'A sprinkler that runs every day at 6 am', 'A thermostat that reads the temperature and adjusts heating', 'A fan with an on/off switch'], answer: 2,
      why: 'Closed loop control uses sensor feedback to correct its output.' },
    { q: 'In closed loop control, the error is…',
      options: ['The setpoint minus the measured value', 'A syntax mistake', 'The battery voltage', 'The number of sensors'], answer: 0,
      why: 'The controller acts on the difference between what you want and what is happening.' },
    { q: 'An autonomous robot must mainly be able to…',
      options: ['Follow a fixed timer only', 'Sense, decide and act without a person controlling it', 'Run without code', 'Work only in simulation'], answer: 1,
      why: 'Autonomous control reads sensors, makes decisions and adapts to its environment by itself.' },
  ],
  'mech-3': [
    { q: 'Why test code in a simulator such as Wokwi before building?',
      options: ['Simulators show real friction and noise', 'It is free and safe to find logic and wiring errors early', 'Simulated code runs faster on hardware', 'Unit tests are not needed afterwards'], answer: 1,
      why: 'Simulation catches logic mistakes without risking parts, though real prototypes are still needed.' },
    { q: 'Averaging the last five sensor readings is an example of…',
      options: ['Sensor filtering', 'PWM', 'Polling', 'Opcode optimisation'], answer: 0,
      why: 'Smoothing noisy readings improves decisions and reduces actuator jitter.' },
    { q: 'Which input should use an interrupt?',
      options: ['A room temperature reading', 'An emergency stop button', 'A daily log upload', 'A light level shown on screen'], answer: 1,
      why: 'Interrupts respond immediately, which matters for safety controls.' },
  ],
});
