/* ============================================================
   "Check your understanding" question bank for Software Automation (data only).
   One quiz per NESA subheading, keyed "auto-<part number>".
   Each question: q, options[4], answer (index), why (explanation).
   Rendered by js/quiz.js into <div class="quiz" data-quiz="…">.
   ============================================================ */
window.HSC_QUIZZES = Object.assign(window.HSC_QUIZZES || {}, {
  'auto-1': [
    { q: 'Training a spam filter on emails already labelled "spam" or "not spam" is…',
      options: ['Supervised learning', 'Unsupervised learning', 'Reinforcement learning', 'Semi-supervised learning'], answer: 0,
      why: 'Supervised learning learns from examples with the correct answers attached.' },
    { q: 'Which statement about AI and ML is correct?',
      options: ['AI is a subset of ML', 'ML is a subset of AI that learns from data', 'They are unrelated', 'ML never uses data'], answer: 1,
      why: 'ML is one way to achieve AI: systems that improve by learning from data.' },
    { q: 'Which algorithm predicts a number, such as a house price?',
      options: ['Logistic regression', 'Linear regression', 'K-nearest neighbour classification', 'A decision tree with yes/no leaves only'], answer: 1,
      why: 'Linear regression predicts a continuous value; logistic regression predicts a class.' },
  ],
  'auto-2': [
    { q: 'Which model fits a curve rather than a straight line?',
      options: ['Linear regression', 'Polynomial regression', 'Logistic regression', 'K-means clustering'], answer: 1,
      why: 'Polynomial regression adds powers of the input, so the fitted line can bend.' },
    { q: 'In scikit-learn, which method trains a model?',
      options: ['predict()', 'fit()', 'score()', 'transform()'], answer: 1,
      why: 'fit() learns from training data; predict() uses the trained model.' },
    { q: 'Why is a neural network written as an object in OOP?',
      options: ['Objects run faster than functions', 'It keeps the model\'s weights with the methods that train and use it', 'Neural networks cannot use lists', 'It removes the need for data'], answer: 1,
      why: 'An object holds its state (weights) together with its behaviour (fit and predict).' },
  ],
  'auto-3': [
    { q: 'A face recognition system is much less accurate for some groups. The most likely cause is…',
      options: ['Dataset source bias', 'Overfitting to the test set only', 'Slow hardware', 'Too many layers'], answer: 0,
      why: 'Training data that under-represents some people leads to worse results for them.' },
    { q: 'Which is a positive impact of automation on the safety of workers?',
      options: ['Robots take over dangerous tasks', 'Fewer jobs in every industry', 'Higher energy use', 'Less training needed'], answer: 0,
      why: 'Automation can remove people from hazardous work.' },
    { q: 'Designing an alert so it stays calm and clear under pressure responds to…',
      options: ['Cultural protocols', 'Patterns related to acute stress response', 'Belief systems', 'Data mining'], answer: 1,
      why: 'People under stress read less and act quickly, so interfaces must be simple and direct.' },
  ],
});
