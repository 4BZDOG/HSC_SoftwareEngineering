/* Still diagram (sequence): objects passing messages.
   The Object-Oriented Paradigm › Objects and messages. */
HSCAnim.define('seq-messages', {
  still: true,
  title: 'Sequence diagram: objects passing messages',
  alt: 'Sequence diagram. Client code sends the message withdraw(500) to a BankAccount object, which handles it internally by asking a balance validator whether the balance is at least 500. If there is enough money, the account subtracts 500 from its balance and returns True; if not, it returns False. The client knows what withdraw() does, not how the balance is checked.',
  layout: { size: [660, 620], minWidth: 520 },
  setup(s) {
    s.sequence(s.root, {
      x: 0, y: 10, w: 660, cardW: 170,
      actors: [
        { id: 'c', label: 'Client code', tone: 'teal', on: true },
        { id: 'a', label: 'BankAccount\nobject', tone: 'sage-t' },
        { id: 'v', label: 'Balance\nvalidator', tone: 'mustard-t' }
      ],
      steps: [
        { from: 'c', to: 'a', text: 'withdraw(500)' },
        { note: 'receives the message and\nhandles it internally', over: ['a'] },
        { from: 'a', to: 'v', text: 'balance ≥ 500?' },
        { from: 'v', to: 'a', text: 'True / False', reply: true },
        { section: 'Enough money' },
        { from: 'a', to: 'a', text: 'self.balance -= 500' },
        { from: 'a', to: 'c', text: 'return True', reply: true },
        { section: 'Not enough' },
        { from: 'a', to: 'c', text: 'return False', reply: true },
        { note: 'The client knows WHAT withdraw() does,\nnot HOW the balance is checked', over: ['c', 'a'] }
      ]
    });
  }
});
