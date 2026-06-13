# 🔬 Extended Learning Resources

This guide lists tools, frameworks, and concepts that **complement** the HSC Software Engineering course but are **not required by the NESA NSW syllabus**.

Use these resources if you want to:
- Deepen your practical skills beyond HSC requirements
- Prepare for university computer science degrees
- Explore career specialisations in security, DevOps, or data science
- Build portfolio projects with industry tools

---

## Security Testing Tools

These tools automate security analysis but are **not mandatory** for HSC:

### Static Analysis (Scanning Source Code)

**bandit** (Python)
- Scans Python source code for security issues: hardcoded credentials, weak cryptography, SQL injection patterns
- Resource: https://bandit.readthedocs.io
- Best for: Finding security bugs early in development

**safety**  (Python Dependency Checker)
- Checks Python packages against a database of known CVEs
- Resource: https://safety.readthedocs.io
- Best for: Keeping dependencies secure and up-to-date

**SonarQube**
- Enterprise-grade code quality and security analysis for multiple languages
- Resource: https://www.sonarqube.org
- Best for: Large teams wanting continuous code quality monitoring

### Dynamic Analysis (Testing Running Applications)

**OWASP ZAP** (Web Application Security Scanner)
- Finds web vulnerabilities: XSS, SQL injection, CSRF, insecure headers
- Resource: https://www.zaproxy.org
- Best for: Security testing before deployment

**Burp Suite** (Web Security Testing Platform)
- Professional intercepting proxy for manual and automated web security testing
- Resource: https://portswigger.net/burp
- Best for: Deep security testing and penetration testing

**Nessus** (Vulnerability Scanner)
- Identifies misconfigurations and vulnerabilities across infrastructure
- Resource: https://www.tenable.com/products/nessus
- Best for: System and network vulnerability assessment

---

## Cryptography Implementations

These libraries enable cryptographic operations programmatically:

### Python Cryptography Libraries

**cryptography** (Python)
```python
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
# AES-GCM encryption with authentication
```
- Resource: https://cryptography.io
- Use for: Encryption, hashing, digital signatures in Python applications

**PyJWT** (JSON Web Tokens)
```python
import jwt
token = jwt.encode({"user_id": 42}, "secret", algorithm="HS256")
```
- Resource: https://pyjwt.readthedocs.io
- Use for: Stateless authentication in web applications

**bcrypt** (Password Hashing)
```python
import bcrypt
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
```
- Resource: https://github.com/pyca/bcrypt
- Use for: Secure password storage

### Language-Specific Alternatives

**Java:** `javax.crypto`, Spring Security, Bouncy Castle
**C#/.NET:** `System.Security.Cryptography`
**Node.js:** `crypto` module, jsonwebtoken, bcryptjs
**Go:** `crypto` standard library packages

---

## REST API Design & Implementation

These frameworks enable building secure APIs:

### Python Web Frameworks

**Flask** (Lightweight)
```python
from flask import Flask
app = Flask(__name__)

@app.route('/api/users/<id>', methods=['GET'])
def get_user(id):
    return {"id": id, "name": "John"}
```
- Best for: Small to medium APIs, learning REST principles

**Django REST Framework** (Full-Featured)
- Batteries-included REST API development
- Built-in authentication, permissions, filtering
- Best for: Large-scale production APIs

**FastAPI** (Modern & Fast)
- Async-first design with automatic API documentation
- Type hints for validation and documentation
- Best for: High-performance APIs

### Other Languages

**Node.js:** Express, Fastify, NestJS
**Java:** Spring Boot, JAX-RS
**Go:** Gin, Echo, Standard library
**C#/.NET:** ASP.NET Core, Entity Framework

---

## JavaScript Frameworks

These frameworks simplify front-end development:

### Component-Based Frameworks

**React** (Facebook)
```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  useEffect(() => { /* fetch user */ }, [userId]);
  return <div>{user?.name}</div>;
}
```
- Learning curve: Medium | Ecosystem: Largest
- Best for: Complex interactive UIs, single-page applications

**Vue.js** (Progressive)
- Learning curve: Gentler than React
- Smaller ecosystem but growing fast
- Best for: Projects of any size, learning frameworks

**Angular** (Google/Enterprise)
- Learning curve: Steeper
- Full framework with batteries included
- Best for: Large enterprise applications

**Svelte** (Modern Alternative)
- Learning curve: Low
- Smaller file sizes, no runtime overhead
- Best for: Performance-critical applications

---

## ML/AI Development Tools

### Python ML Ecosystem

**scikit-learn** (Machine Learning Algorithms)
- Linear regression, KNN, decision trees, clustering
- Resource: https://scikit-learn.org
- Best for: Learning algorithms and data science

**TensorFlow / PyTorch** (Deep Learning)
- Neural network frameworks
- TensorFlow: Production-focused
- PyTorch: Research-friendly
- Best for: Advanced ML, computer vision, NLP

**Jupyter Notebooks**
- Interactive coding environment
- Resource: https://jupyter.org
- Best for: Data exploration and experimentation

**Pandas** (Data Manipulation)
- Tabular data manipulation (like Excel in Python)
- Best for: Data cleaning and preparation

### ML Operations (MLOps)

**Kubeflow** (ML Pipeline Orchestration)
- Deploy ML models to Kubernetes
- Best for: Production ML systems

**AWS SageMaker** (Managed ML Service)
- End-to-end ML development in cloud
- Best for: Enterprise ML projects

---

## Database & ORM Tools

**SQLAlchemy** (Python ORM)
- Object-relational mapping for Python
- Prevents SQL injection via parameterised queries
- Best for: Complex database applications

**Django ORM** (Python)
- Built into Django framework
- Type-safe database queries
- Best for: Django projects

**Prisma** (Node.js/TypeScript)
- Modern ORM with auto-migrations
- Type-safe database queries
- Best for: TypeScript projects

---

## DevOps & Deployment

**Docker** (Containerisation)
- Package applications in sandboxed containers
- Ensures consistent environments
- Best for: Deploying to cloud, microservices

**Kubernetes** (Container Orchestration)
- Run Docker containers at scale
- Auto-scaling, load balancing, updates
- Best for: Large production deployments

**GitHub Actions** (CI/CD)
- Automate testing, building, deploying
- Integrated with GitHub repositories
- Best for: GitHub-hosted projects

**GitLab CI/CD**, **Jenkins**, **CircleCI** (Alternatives)

---

## Content Management Systems (Beyond Syllabus)

**WordPress** (PHP-based)
- Easiest to learn, largest plugin ecosystem
- Best for: Blogs, small business sites

**Next.js** (React-based)
- Modern static site generation
- Best for: High-performance content sites

**Strapi** (Headless CMS)
- API-first, decoupled from front-end
- Best for: Complex content architectures

---

## Open-Source Licensing Deep Dives

### GPL Implications
If you use GPL-licensed code:
- **You must open-source your own code** under GPL
- Applies to derivative works and linking
- Creates "viral" copyleft effect

### MIT & Apache 2.0
- Permissive: use in proprietary code
- Only requirement: attribution

### LGPL (Middle Ground)
- Can link without open-sourcing
- But modifications to the library must be shared

**Tool:** https://choosealicense.com

---

## Advanced Security Concepts

### Side-Channel Attacks (Beyond Syllabus)

**Timing Attacks**
- Measuring how long operations take leaks information
- Mitigation: constant-time comparisons

**Power Analysis**
- Measuring electricity consumption during crypto operations
- Mitigation: hardware security modules, masking

**Spectre & Meltdown**
- CPU cache timing attacks
- Mitigation: kernel patches, isolation

### Advanced Cryptography

**Zero-Knowledge Proofs**
- Prove something without revealing the information
- Used in blockchain, privacy tech

**Homomorphic Encryption**
- Compute on encrypted data without decryption
- Emerging field with huge implications

---

## Year 11 — Advanced Mechatronics Topics (Beyond Syllabus)

These topics extend the Year 11 Programming Mechatronics module but are **not explicitly assessable** in the Preliminary course:

### Interrupts & Interrupt Service Routines (ISRs)
- Hardware and software interrupts, polling vs interrupt-driven design
- ISR best practices (keep short, use flags, volatile variables)
- Resource: Arduino Interrupt Reference, MicroPython IRQ documentation

### Arduino C vs MicroPython Comparison
- Compiled vs interpreted, memory trade-offs, real-time capability
- IDE choices: Arduino IDE, PlatformIO, Thonny, VS Code + Pymakr
- Resource: Arduino Reference (arduino.cc), MicroPython docs (micropython.org)

### Communication Protocols (I2C, SPI, UART)
- Multi-device bus communication, protocol wire counts, speed trade-offs
- Practical: connecting sensors, displays, GPS modules
- Resource: SparkFun Communication Protocols tutorials

### Motor Control (DC, Servo, Stepper)
- PWM duty cycle for speed control, H-bridge circuits (L298N)
- Servo angle control via pulse width, stepper motor stepping
- Resource: Adafruit Motor Shield tutorials

### Hardware Debugging
- Multimeters, logic analysers, serial monitor/REPL debugging
- Systematic fault isolation process
- Resource: SparkFun Troubleshooting Guide

---

## Year 11 — Advanced OOP Topics (Beyond Syllabus)

These topics extend the Year 11 Object-Oriented Paradigm module but are **not explicitly assessable** in the Preliminary course:

### Design Patterns (Singleton, Observer, MVC)
- Reusable solutions to recurring design problems
- Singleton for shared resources, Observer for event systems, MVC for separation of concerns
- Resource: Refactoring Guru (refactoring.guru/design-patterns)

### Abstract Classes & Interfaces
- Python `abc` module, `@abstractmethod` decorator, enforcing method contracts
- Duck typing as an alternative to strict type hierarchies
- Resource: Python ABC documentation (docs.python.org)

### Exception Handling & Custom Exceptions
- `try/except/else/finally` structure, custom exception class hierarchies
- Domain-specific error classes for meaningful error reporting
- Resource: Python Errors and Exceptions documentation

---

## Career Pathways

### If You're Interested in Security
- 🛡️ Cybersecurity Engineer
- 🔍 Penetration Tester
- 🚨 Security Operations Center (SOC) Analyst
- 🏆 Bug Bounty Hunter

**Get started:** Learn security testing tools, practice on HackTheBox or TryHackMe

### If You're Interested in DevOps
- ☁️ Cloud Engineer (AWS, Azure, GCP)
- 🐳 DevOps Engineer
- 🔧 Site Reliability Engineer (SRE)

**Get started:** Learn Docker, Kubernetes, CI/CD pipelines

### If You're Interested in Data Science / ML
- 📊 Data Analyst
- 🤖 Machine Learning Engineer
- 📈 Data Scientist

**Get started:** Learn scikit-learn, TensorFlow, Jupyter, statistics

---

## Learning Resources

### Official Documentation
All tools and frameworks have free official documentation — start there!

### Online Courses
- **Udemy** — Practical hands-on courses
- **Coursera** — University-level courses with certificates
- **Pluralsight** — Tech skill development platform
- **freeCodeCamp** — Free comprehensive tutorials

### Hands-On Practice
- **HackTheBox** — Penetration testing labs
- **TryHackMe** — Guided cybersecurity labs
- **LeetCode / HackerRank** — Coding challenge platforms
- **GitHub** — Open source projects to contribute to

### Community
- **Stack Overflow** — Q&A for programming problems
- **GitHub Discussions** — Community for projects
- **Reddit** — r/learnprogramming, r/cybersecurity, etc.
- **Conferences** — OWASP, PyCon, AWS Summit

---

## Final Thoughts

The **HSC course focuses on concepts**; these resources help you **practice them at scale**.

Start with the syllabus content to ace your exams, then explore these tools to:
- Build real projects
- Specialise in areas you love
- Prepare for university or careers

**Remember:** Learning tools is easy. Understanding **why** they exist and **when** to use them is the hard part — and that's exactly what the HSC course teaches you.

---

**Last Updated:** June 2026
**Curated for:** NESA NSW Year 11 and Year 12 Software Engineering students
