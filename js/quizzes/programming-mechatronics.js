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
    { q: 'A designer needs a device that reads a temperature sensor and switches a motor with predictable timing, running for months on a small battery. Which is the best fit?',
      options: ['A Raspberry Pi-class board running Linux', 'A desktop computer with separate RAM and storage', 'A cloud server', 'A microcontroller'], answer: 3,
      why: 'A microcontroller puts the CPU, memory and I/O peripherals on one chip, controls pins with predictable timing and uses little power. A board running a full operating system can pause your program and needs far more power.' },
    { q: 'A 10-bit ADC with a 5 V reference measures 1.25 V. Roughly what count does it return?',
      options: ['256', '128', '512', '1023'], answer: 0,
      why: 'The count is (1.25 ÷ 5) × 1024 = 256. A count of 1023 would mean the full 5 V and 512 would mean 2.5 V.' },
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
    { q: 'A thermostat turns the heater on below 19 °C and off above 21 °C. The room is 20 °C and the heater is already on. What does the controller do?',
      options: ['Switches the heater off, because 20 °C is above 19 °C', 'Sounds an alarm', 'Switches the heater on and off repeatedly', 'Leaves the heater on until the temperature passes 21 °C'], answer: 3,
      why: 'Inside a hysteresis band the controller keeps its current state. That stops rapid switching and wear on the relay.' },
    { q: 'A proportional vent controller has a setpoint of 26 °C and Kp = 10 degrees per °C, using error = temperature − setpoint. The sensor reads 28.5 °C. What angle is commanded?',
      options: ['2.5°', '25°', '285°', '180°'], answer: 1,
      why: 'The error is 28.5 − 26 = 2.5 °C, so the angle is 2.5 × 10 = 25°. The value 285° would be beyond the servo range and would be limited to 180°.' },
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
    { q: 'An obstacle rule says: IF distance < 15 THEN reverse. Which test value checks the boundary of this rule?',
      options: ['distance = 80', 'distance = 12', 'distance = 15', 'distance = 300'], answer: 2,
      why: 'A boundary value sits on the edge of a rule. At exactly 15 the condition is false, so the robot should not reverse. Testing it catches a < written where <= was meant.' },
    { q: 'Why does an emergency stop handler only switch the pump off and set a flag?',
      options: ['MicroPython cannot print inside a function', 'The pump is the only output in the system', 'A flag is faster than writing to a pin', 'Handlers should be very short, so slow work such as updating a display is left to the main loop'], answer: 3,
      why: 'An interrupt handler pauses the main program. Keeping it short means the stop is immediate and the rest of the program is not held up or disturbed.' },
  ],
});
