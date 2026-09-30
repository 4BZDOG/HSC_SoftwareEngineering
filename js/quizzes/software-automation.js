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
    { q: 'A hospital\'s bed-demand model was accurate when released but is often wrong after a new suburb opens. In MLOps, where is this problem detected and what happens next?',
      options: ['Design, when the success metrics are first defined', 'Model development, when the model is first trained', 'Model development, because data wrangling always fixes drift', 'Operations, where monitoring detects the fall and the model is retrained on newer data'], answer: 3,
      why: 'Monitoring model performance is a step in the Operations stage. When accuracy falls below the target the loop returns to model development to retrain and validate a new model.' },
    { q: 'A decision tree is being built from eight labelled emails. Why is "sender is a contact" chosen as the root question?',
      options: ['It was the first question the developer thought of', 'It creates the most leaf nodes', 'It separates the labels best, leaving the lowest weighted impurity', 'It uses the feature with the biggest numbers'], answer: 2,
      why: 'The tree-building algorithm tries each question and keeps the one that leaves the groups purest, measured for example by Gini impurity.' }
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
    { q: 'A perceptron has weightings 1.0 and 0.5 and a threshold of 1.5. It receives the inputs (1, 1). What does it output, and why?',
      options: ['0, because 1.0 + 0.5 is less than 2', '0, because both inputs are equal', '1, because the weighted total is 1.5, which reaches the threshold', '1, because the weightings are ignored when both inputs are 1'], answer: 2,
      why: 'The weighted total is 1.0 × 1 + 0.5 × 1 = 1.5. A neurone fires when the total reaches its threshold, and 1.5 reaches 1.5.' },
    { q: 'A least-squares line for study hours against mark is mark = 5.5 × hours + 40, fitted to students who studied 1 to 8 hours. It predicts 150 for a student who studied 20 hours. What is the best judgement?',
      options: ['Reliable, because the line fits the data well', 'Reliable, because more hours always means a higher mark', 'Unreliable only if the mean squared error is large', 'Unreliable, because 20 hours is far outside the training data and marks cannot exceed 100'], answer: 3,
      why: 'Extrapolating well beyond the range of the training data is unsafe. A straight line has no upper limit, but the mark scale does.' }
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
    { q: 'A loan model is never given applicants\' ethnicity, yet it approves far fewer applicants from one ethnic group. What is the most likely explanation?',
      options: ['The sigmoid function is faulty', 'Neural networks always discriminate', 'The training set was too small', 'A proxy such as postcode carries the same information, and the model copied unfair past decisions'], answer: 3,
      why: 'Removing a sensitive column does not remove the pattern if another feature stands in for it and the labels record biased human decisions.' },
    { q: 'A person refused a service by an automated system can ask for the decision to be reviewed by a human. Which of Australia\'s AI Ethics Principles does this support?',
      options: ['Privacy protection and security', 'Reliability and safety', 'Contestability', 'Human, societal and environmental wellbeing'], answer: 2,
      why: 'Contestability means there is an accessible way for people to challenge a significant AI outcome.' }
  ],
});
