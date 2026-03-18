import re

html_file = "/Users/david/Downloads/HSC_SoftwareEngineering-claude-hsc-notes-website-URqvH/topics/software-automation.html"

with open(html_file, "r") as f:
    html = f.read()

# Replace TOC
new_toc = """      <ul class="toc-list">
        <li><a href="#ml-automation">🤖 1. ML &amp; Automation</a></li>
        <li><a href="#ai-vs-ml">🧠 2. AI vs Machine Learning</a></li>
        <li><a href="#training-models">🏋️ 3. Training Models</a></li>
        <li><a href="#algorithms-applications">📊 4. Algorithms &amp; Applications</a></li>
        <li><a href="#programming-regression">💻 5. Programming Regression</a></li>
        <li><a href="#impact">🌍 6. Impact of ML &amp; AI</a></li>
        <li><a href="#bias">⚖️ 7. Human Behaviour &amp; Bias</a></li>
      </ul>"""
html = re.sub(r'<ul class=\"toc-list\">.*?</ul>', new_toc, html, flags=re.DOTALL)

# Replace <p class="text-muted-dark max-w-600 mt-2 fs-sm lh-base"> inside header
# Wait, let's use a robust replace for the header paragraph
header_desc = """<p style="color:#94A3B8; max-width:600px; margin-top:.5rem; font-size:.95rem; line-height:1.6;">
        Explore how machine learning and artificial intelligence drive automation, the models used to train them, regression programming, and their impact on society and employment.
      </p>"""
html = re.sub(r'<p style=\"color:#94A3B8; max-width:600px; margin-top:\.5rem; font-size:\.95rem; line-height:1\.6;\">.*?</p>', header_desc, html, flags=re.DOTALL)

# Replace content-body
new_content = """      <div class="content-body">

        <!-- 1. ML & Automation -->
        <section id="ml-automation">
          <h2>🤖 Algorithms in Machine Learning &amp; Automation</h2>
          <p>Machine Learning (ML) supports automation across various domains, significantly improving efficiency and capabilities beyond traditional programmed logic.</p>
          
          <div class="info-grid">
            <div class="info-card">
              <div class="info-card-icon">♾️</div>
              <h4>DevOps Automation</h4>
              <p>ML supports DevOps by predicting deployment failures, automating code reviews, anomaly detection in logs, and optimising infrastructure resource allocation.</p>
            </div>
            <div class="info-card">
              <div class="info-card-icon">🤖</div>
              <h4>Robotic Process Automation (RPA)</h4>
              <p>RPA uses software robots to automate highly repetitive tasks. ML enhances RPA (turning it into "Intelligent Automation") by allowing robots to read unstructured data like invoices or emails.</p>
            </div>
            <div class="info-card">
              <div class="info-card-icon">🏢</div>
              <h4>Business Process Automation (BPA)</h4>
              <p>BPA streamlines complex enterprise operations. ML models can automate decision-making steps within these broader business processes, such as intelligent loan approvals.</p>
            </div>
          </div>
        </section>

        <hr class="divider" />

        <!-- 2. AI vs ML -->
        <section id="ai-vs-ml">
          <h2>🧠 Distinguishing AI and ML</h2>
          
          <div class="def-card">
            <div class="def-term">Artificial Intelligence (AI)</div>
            <div class="def-meaning">The broader concept of machines being able to carry out tasks in a way that we would consider "smart" or mimicking human intelligence. It encompasses everything from simple rule-based expert systems to advanced generative models.</div>
          </div>
          
          <div class="def-card">
            <div class="def-term">Machine Learning (ML)</div>
            <div class="def-meaning">A specific subset of AI based on the idea that systems can learn from data, identify patterns, and make decisions with minimal human intervention. Instead of being explicitly programmed, ML models are trained on datasets.</div>
          </div>
        </section>

        <hr class="divider" />

        <!-- 3. Training Models -->
        <section id="training-models">
          <h2>🏋️ Models of Training ML</h2>
          
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>Model</th><th>Description</th><th>Best For</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Supervised Learning</strong></td>
                  <td>The model is trained on a labeled dataset (both inputs and desired outputs are provided). The algorithm learns the mapping function.</td>
                  <td>Classification (spam detection) and Regression (price prediction).</td>
                </tr>
                <tr>
                  <td><strong>Unsupervised Learning</strong></td>
                  <td>The model is given data without explicit instructions on what to do with it (unlabeled data). It must find structure within the data automatically.</td>
                  <td>Clustering (customer segmentation), Anomaly Detection.</td>
                </tr>
                <tr>
                  <td><strong>Semi-supervised Learning</strong></td>
                  <td>Uses a small amount of labeled data and a large amount of unlabeled data during training. Often used when labeling data is expensive or time-consuming.</td>
                  <td>Web content classification, speech recognition.</td>
                </tr>
                <tr>
                  <td><strong>Reinforcement Learning</strong></td>
                  <td>An agent learns how to behave in an environment by performing actions and receiving rewards or penalties. It learns by trial and error.</td>
                  <td>Game playing algorithms (Chess, Go), robotics, navigation.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <hr class="divider" />

        <!-- 4. Algorithms -->
        <section id="algorithms-applications">
          <h2>📊 ML Algorithms &amp; Applications</h2>
          
          <h3>Common Applications</h3>
          <ul>
            <li><strong>Data analysis and forecasting:</strong> Predicting stock prices, weather forecasting, supply chain predictions.</li>
            <li><strong>Virtual personal assistants:</strong> Siri, Alexa, Google Assistant (using Natural Language Processing).</li>
            <li><strong>Image recognition:</strong> Facial recognition, medical image tumor detection, autonomous vehicle vision.</li>
          </ul>

          <h3>Design &amp; Analysis Models</h3>
          <div class="info-grid">
            <div class="info-card">
              <div class="info-card-icon">🌳</div>
              <h4>Decision Trees</h4>
              <p>A flowchart-like structure where internal nodes represent a "test" on an attribute, branches represent outcomes, and leaf nodes represent class labels or values. Highly interpretable.</p>
            </div>
            <div class="info-card">
              <div class="info-card-icon">🕸️</div>
              <h4>Neural Networks</h4>
              <p>Inspired by the human brain, consisting of interconnected nodes (neurons) in layers. Deep learning uses multi-layered neural networks for complex tasks like image and speech recognition.</p>
            </div>
          </div>

          <h3>Types of Algorithms</h3>
          <div class="key-terms">
            <div class="key-term-item"><strong>Linear Regression</strong> — Predicts a continuous numeric value by fitting a straight line to the data.</div>
            <div class="key-term-item"><strong>Logistic Regression</strong> — Predicts a categorical outcome (e.g., Yes/No, Spam/Not Spam) using a logistic curve.</div>
            <div class="key-term-item"><strong>K-Nearest Neighbour (KNN)</strong> — Classifies a data point based on how its 'K' closest neighbors are classified in the training set.</div>
          </div>
        </section>

        <hr class="divider" />

        <!-- 5. Programming Regression -->
        <section id="programming-regression">
          <h2>💻 Programming for Automation</h2>
          
          <p>Developers use Object-Oriented Programming (OOP) paradigms and libraries like <code>scikit-learn</code> (Python) to design and apply ML models efficiently.</p>
          
          <h3>Regression Models</h3>
          <ul>
            <li><strong>Linear Regression:</strong> <code>y = mx + c</code>. Used when the relationship between variables is proportional and straight.</li>
            <li><strong>Polynomial Regression:</strong> Used when the relationship between the independent and dependent variable is non-linear (curves). It fits a polynomial equation to the data.</li>
            <li><strong>Logistic Regression:</strong> Despite the name, it is used for binary classification (predicting probabilities between 0 and 1).</li>
          </ul>

          <div class="code-block">
            <div class="code-header">
              <span class="code-lang">Python OOP — Linear Regression Prediction</span>
              <div class="code-dots"><span></span><span></span><span></span></div>
            </div>
            <pre><code><span class="kw">from</span> sklearn.linear_model <span class="kw">import</span> LinearRegression
<span class="kw">import</span> numpy <span class="kw">as</span> np

<span class="cm"># Mock OOP wrapper</span>
<span class="kw">class</span> <span class="fn">PricePredictor</span>:
    <span class="kw">def</span> <span class="fn">__init__</span>(self):
        self.model = LinearRegression()
        
    <span class="kw">def</span> <span class="fn">train</span>(self, features, prices):
        self.model.fit(features, prices)
        
    <span class="kw">def</span> <span class="fn">predict</span>(self, house_features):
        <span class="kw">return</span> self.model.predict(house_features)

<span class="cm"># Usage</span>
predictor = PricePredictor()
predictor.train(np.array([[100], [150], [200]]), np.array([[300], [450], [600]]))
estimated_price = predictor.predict(np.array([[120]]))
<span class="kw">print</span>(<span class="str">f"Estimated Price: {estimated_price[0][0]}"</span>)</code></pre>
          </div>
        </section>

        <hr class="divider" />

        <!-- 6. Impact -->
        <section id="impact">
          <h2>🌍 Significance and Impact of ML &amp; AI</h2>
          
          <p>Automation via AI has profound implications across multiple facets of society:</p>
          
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>Area</th><th>Impact</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Safety of workers</strong></td>
                  <td>Robots and automated systems can take over dangerous tasks (mining, bomb defusal, toxic environments), reducing human injury.</td>
                </tr>
                <tr>
                  <td><strong>People with disability</strong></td>
                  <td>AI-driven accessibility tools (speech-to-text, computer vision reading apps, robotic prosthetics) greatly enhance independence.</td>
                </tr>
                <tr>
                  <td><strong>Employment nature &amp; skills</strong></td>
                  <td>Routine cognitive and manual jobs are automated. Demand shifts toward tech skills, emotional intelligence, and complex problem-solving. Lifelong learning becomes essential.</td>
                </tr>
                <tr>
                  <td><strong>Efficiency &amp; Environment</strong></td>
                  <td>AI optimises supply chains, energy grids, and resource usage, reducing waste. However, training large ML models requires massive computational power, producing carbon emissions.</td>
                </tr>
                <tr>
                  <td><strong>Economy &amp; Wealth</strong></td>
                  <td>Huge productivity gains can increase economic growth. However, wealth may concentrate in tech-owning corporations, potentially widening inequality unless mitigated.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <hr class="divider" />

        <!-- 7. Bias -->
        <section id="bias">
          <h2>⚖️ Human Behaviour and Bias in AI</h2>
          
          <h3>Influence of Human Behaviour Patterns</h3>
          <p>Software development of AI must consider human responses:</p>
          <ul>
            <li><strong>Psychological responses:</strong> How much users trust AI decisions (e.g., self-driving cars, medical diagnoses). The "uncanny valley" effect in human-like interfaces.</li>
            <li><strong>Acute stress response:</strong> Systems must be designed so that AI assistants do not overwhelm users during emergencies, presenting critical data simply.</li>
            <li><strong>Cultural protocols &amp; Belief systems:</strong> AI systems deployed globally must respect varying cultural norms (e.g., privacy expectations, modesty, conversational etiquette).</li>
          </ul>

          <h3>Human and Dataset Bias</h3>
          <p>AI models are only as good as the data they train on. If the data is biased, the AI's predictions will be biased.</p>
          <div class="key-terms">
            <div class="key-term-item"><strong>Historical Bias</strong> — Training data reflects historical prejudices (e.g., an AI resume screener downgrading female candidates because historical hires were predominantly male).</div>
            <div class="key-term-item"><strong>Sampling Bias</strong> — The training dataset is not representative of the real-world population (e.g., facial recognition systems trained mostly on lighter-skinned faces failing to recognise darker-skinned faces).</div>
            <div class="key-term-item"><strong>Confirmation Bias in Developers</strong> — Software engineers unconsciously designing algorithms or selecting data that confirm their own pre-existing beliefs.</div>
          </div>
        </section>
      </div>"""

# Find borders
body_start = html.find('<div class="content-body">')
body_end = html.find('</main>')

if body_start != -1 and body_end != -1:
    html = html[:body_start] + new_content + "\n    " + html[body_end:]

with open(html_file, "w") as f:
    f.write(html)

print("Updated software-automation.html successfully")
