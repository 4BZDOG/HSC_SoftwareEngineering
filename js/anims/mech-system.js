/* Still diagram (system): inside a mechatronic system.
   Programming Mechatronics › Mechatronic hardware and software. */
HSCAnim.define('mech-system', {
  still: true,
  title: 'System diagram: inside a mechatronic system',
  alt: 'Sensors (camera, ultrasonic, IMU gyro, motor encoder) send analogue and digital signals to a microcontroller such as an Arduino or Raspberry Pi. The microcontroller passes sensor data to the control algorithm (path planning, obstacle detection, PID control) and receives control decisions back, then sends PWM and GPIO commands to actuators (DC motors, servos, LEDs, buzzer). A power system of batteries and regulators supplies 3.3 V to the sensors, 5 V to the microcontroller and 12 V to the actuators.',
  layout: { size: [780, 440], minWidth: 640 },
  setup(s) {
    const L = s.g(s.back);
    const sens = s.node(s.root, { x: 100, y: 210, w: 170, h: 130, shape: 'card', tone: 'sky-t', text: 'Sensors\n\ncamera\nultrasonic\nIMU gyro\nmotor encoder', size: 13.5 });
    const logic = s.node(s.root, { x: 390, y: 60, w: 250, h: 76, shape: 'card', tone: 'plum-t', text: 'Control algorithm\npath planning · obstacle\ndetection · PID control', size: 13.5 });
    const mcu = s.node(s.root, { x: 390, y: 210, w: 220, h: 62, shape: 'card', tone: 'mustard-t', text: 'Microcontroller\nArduino / Raspberry Pi', size: 14, cls: 'pa-strong' });
    const act = s.node(s.root, { x: 680, y: 210, w: 170, h: 130, shape: 'card', tone: 'sage-t', text: 'Actuators\n\nDC motors\nservos\nLEDs\nbuzzer', size: 13.5 });
    const pow = s.node(s.root, { x: 390, y: 380, w: 230, h: 56, shape: 'card', tone: 'terra-t', text: 'Power system\nbattery + regulators', size: 13.5 });
    s.link(L, sens, mcu, { from: 'right', to: 'left', label: 'signals' });
    s.link(L, mcu, logic, { from: 'top', to: 'bottom', fromOff: -40, toOff: -40, label: 'sensor data', labelAt: [300, 135] });
    s.link(L, logic, mcu, { from: 'bottom', to: 'top', fromOff: 40, toOff: 40, label: 'decisions', labelAt: [478, 135] });
    s.link(L, mcu, act, { from: 'right', to: 'left', label: 'PWM / GPIO' });
    s.link(L, pow, sens, { from: 'left', to: 'bottom', dashed: true, label: '3.3 V' });
    s.link(L, pow, mcu, { from: 'top', to: 'bottom', dashed: true, label: '5 V' });
    s.link(L, pow, act, { from: 'right', to: 'bottom', dashed: true, label: '12 V' });
    s.text(s.root, 'input', { x: 100, y: 134, cls: 'pa-name' });
    s.text(s.root, 'process', { x: 560, y: 64, cls: 'pa-name' });
    s.text(s.root, 'output', { x: 680, y: 134, cls: 'pa-name' });
  }
});
