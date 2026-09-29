/* Still diagram (wiring): the smart greenhouse wiring, data and power.
   Programming Mechatronics › Wiring diagrams. */
HSCAnim.define('mech-wiring', {
  still: true,
  title: 'Wiring diagram: the greenhouse controller',
  alt: 'Wiring diagram for the greenhouse controller. Solid lines are data or signal wires; dashed lines are power. A TMP36 temperature sensor connects to pin GP26, an ADC input. A soil moisture sensor connects to GP27, another ADC input. An emergency stop button connects to GP14. The microcontroller board sends a PWM signal from GP15 to the vent servo and a digital signal from GP16 to the pump driver, which switches the water pump. A 5 volt supply rated 1 amp powers the board and the servo. A separate 12 volt supply powers the pump. A common ground joins the board, both supplies, the sensors and the driver.',
  layout: { size: [780, 470], minWidth: 640 },
  setup(s) {
    const L = s.g(s.back);
    const card = (x, y, w, h, t, tone, size) => s.node(s.root, { x, y, w, h, shape: 'card', tone, text: t, size: size || 13.5 });
    const tmp = card(95, 150, 170, 54, 'TMP36 temperature\nsensor', 'sky-t');
    const soil = card(95, 240, 170, 54, 'Soil moisture\nsensor', 'sky-t');
    const btn = card(95, 330, 170, 54, 'Emergency stop\nbutton to GND', 'sky-t');
    const mcu = card(400, 240, 200, 150, 'Microcontroller\nboard\n3.3 V logic', 'mustard-t', 14);
    const servo = card(665, 60, 190, 50, 'Vent servo', 'sage-t');
    const drv = card(665, 180, 190, 54, 'Pump driver\nMOSFET or relay', 'sage-t');
    const pump = card(665, 320, 190, 50, 'Water pump', 'sage-t');
    const p5 = card(400, 60, 190, 50, '5 V supply, 1 A', 'terra-t');
    const p12 = card(665, 410, 190, 50, '12 V supply', 'terra-t');
    s.link(L, tmp, mcu, { from: 'right', to: 'left', toOff: -40, label: 'GP26 (ADC0)', labelAt: [222, 192] });
    s.link(L, soil, mcu, { from: 'right', to: 'left', label: 'GP27 (ADC1)', labelAt: [222, 232] });
    s.link(L, btn, mcu, { from: 'right', to: 'left', toOff: 40, label: 'GP14', labelAt: [222, 322] });
    s.link(L, mcu, servo, { from: 'top', to: 'bottom', fromOff: 60, via: [[460, 130], [665, 130]], label: 'GP15 PWM', labelAt: [560, 120] });
    s.link(L, mcu, drv, { from: 'right', to: 'left', label: 'GP16', labelAt: [532, 240] });
    s.link(L, drv, pump, { from: 'bottom', to: 'top', label: 'switched 12 V', labelAt: [665, 252] });
    s.link(L, p5, servo, { from: 'right', to: 'left', dashed: true, label: '5 V', labelAt: [532, 60] });
    s.link(L, p5, mcu, { from: 'bottom', to: 'top', dashed: true, fromOff: -60, toOff: -60, label: '5 V in', labelAt: [312, 125] });
    s.link(L, p12, pump, { from: 'top', to: 'bottom', dashed: true, label: '12 V', labelAt: [665, 365] });
    s.text(s.root, 'signal wires: solid    power: dashed', { x: 16, y: 44, anchor: 'start', cls: 'pa-name', size: 13 });
    s.text(s.root, 'sensors take 3.3 V from the board', { x: 16, y: 100, anchor: 'start', cls: 'pa-name', size: 13 });
    s.text(s.root, 'Common ground: board, both supplies, sensors and driver share one GND', { x: 390, y: 458, cls: 'pa-name', size: 13 });
  }
});
