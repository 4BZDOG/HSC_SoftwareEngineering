/* Still diagram (class diagram): a vehicle hierarchy.
   The Object-Oriented Paradigm › Inheritance. */
HSCAnim.define('cd-vehicle', {
  still: true,
  title: 'Class diagram: a vehicle hierarchy',
  alt: 'Class diagram. Car, Motorcycle and Truck each inherit from Vehicle. Vehicle has manufacturer and speed, and start() and stop(). Car adds numDoors and openBoot(); Motorcycle adds hasSidecar; Truck adds cargoCapacity and loadCargo(amount). Each Vehicle has exactly one Engine (1..1), which has engineType and calculatePower().',
  layout: { size: [780, 480], minWidth: 620 },
  setup(s) {
    const L = s.g(s.back);
    const v = s.classBox(s.root, { x: 300, y: 100, w: 220, name: 'Vehicle', attrs: ['manufacturer: string', 'speed: float'], methods: ['start()', 'stop()'] });
    const e = s.classBox(s.root, { x: 650, y: 100, w: 210, name: 'Engine', tone: 'mustard-t', attrs: ['engineType: string'], methods: ['calculatePower()'] });
    const kids = [
      s.classBox(s.root, { x: 130, y: 380, w: 200, name: 'Car', tone: 'sage-t', attrs: ['numDoors: int'], methods: ['openBoot()'] }),
      s.classBox(s.root, { x: 390, y: 380, w: 200, name: 'Motorcycle', tone: 'sage-t', attrs: ['hasSidecar: boolean'], methods: [] }),
      s.classBox(s.root, { x: 650, y: 380, w: 210, name: 'Truck', tone: 'sage-t', attrs: ['cargoCapacity: float'], methods: ['loadCargo(amount)'] })
    ];
    kids.forEach(k => s.link(L, k, v, { from: 'top', to: 'bottom', mid: 250, marker: 'pa-inherit' }));
    s.link(L, v, e, { from: 'right', to: 'left', label: 'has', marker: 'pa-rel' });
    s.text(s.root, '1..1', { x: 424, y: 92, anchor: 'start', cls: 'pa-mult' });
    s.text(s.root, '1..1', { x: 540, y: 92, anchor: 'end', cls: 'pa-mult' });
    s.text(s.root, 'inherits from', { x: 470, y: 244, anchor: 'start', cls: 'pa-name', size: 13 });
  }
});
