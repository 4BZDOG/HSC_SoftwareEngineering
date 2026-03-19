# Diagram Quick Reference Card

Print this out or use as a checklist when selecting and creating diagrams for software engineering work.

---

## 📐 PROGRAMMING FUNDAMENTALS

| Diagram Type | Scenario | Tool | Outcome |
|---|---|---|---|
| **SDLC Flowchart** | School attendance system project journey | Flowchart | SE-11-01 |
| **Algorithm Flowchart** | Linear search implementation | Flowchart | SE-11-02 |
| **Structure Chart** | ATM system module hierarchy | Hierarchical diagram | SE-11-02 |
| **Data Dictionary** | Student system variables | Table | SE-11-04 |
| **Complexity Analysis** | Comparing sort algorithms | Graph/visualization | SE-11-02 |

**When to use each:**
- 🔄 SDLC when explaining project phases
- 🧠 Flowcharts when teaching algorithms
- 🏗️ Structure charts when showing module design
- 📋 Data dictionary when specifying variables
- 📊 Complexity graphs when comparing efficiency

---

## 🧩 OBJECT-ORIENTED PARADIGM

| Diagram Type | Scenario | Tool | Outcome |
|---|---|---|---|
| **Class Diagram** | Vehicle hierarchy (Car, Truck, Bike) | UML Class Diagram | SE-11-09 |
| **Comparison Venn** | Procedural vs OOP paradigms | Venn diagram | SE-11-07 |
| **Sequence Diagram** | Bank withdrawal process | Sequence diagram | SE-11-09 |
| **Inheritance Tree** | Animal → Mammal → Dog hierarchy | Class hierarchy | SE-11-08 |
| **Composition Diagram** | Car contains Engine and Wheels | Class composition | SE-11-09 |

**Design pattern selector:**
- 🏗️ Class diagrams for structure
- 📊 Venn diagrams for comparisons
- 🔀 Sequence diagrams for interactions
- 🌳 Tree diagrams for hierarchies
- 🧩 Composition for "has-a" relationships

---

## 🛡️ SECURE SOFTWARE ARCHITECTURE

| Diagram Type | Scenario | Tool | Outcome |
|---|---|---|---|
| **Secure SDLC** | Security checkpoints in development | Enhanced flowchart | SE-12-06 |
| **Threat Model** | Web app attack vectors | DFD + threats | SE-12-07 |
| **Security Testing** | Penetration test checklist | Matrix | SE-12-11 |
| **Cryptography Flow** | Data encryption journey | Process diagram | SE-12-08 |
| **Risk Matrix** | Vulnerability severity chart | Heatmap | SE-12-09 |

**Security focus areas:**
- 🔒 SDLC for secure development phases
- 🎯 Threat models for vulnerability identification
- 🧪 Test matrices for comprehensive testing
- 🔐 Encryption flows for data protection
- ⚠️ Risk matrices for prioritization

---

## 🌐 PROGRAMMING FOR THE WEB

| Diagram Type | Scenario | Tool | Outcome |
|---|---|---|---|
| **HTTP Request/Response** | Browser downloads page | Sequence diagram | SE-12-02 |
| **Protocol Stack** | HTTP → TCP → IP → Ethernet | Layered architecture | SE-12-03 |
| **Web Architecture** | Client → Server → Database | System architecture | SE-12-04 |
| **DNS Resolution** | Domain name to IP lookup | Process flow | SE-12-02 |
| **Session Flow** | User login to logout | State machine | SE-12-05 |

**Web technology diagrams:**
- 📨 Sequence for request/response cycles
- 🏗️ Layered diagrams for protocol stacks
- 🏢 Architecture for full system design
- 🔍 Process flows for DNS/routing
- 🔐 State machines for authentication

---

## 🤖 SOFTWARE AUTOMATION / MACHINE LEARNING

| Diagram Type | Scenario | Tool | Outcome |
|---|---|---|---|
| **Decision Tree** | Spam email classifier | Tree diagram | SE-12-14 |
| **Neural Network** | Image recognition model | Network topology | SE-12-14 |
| **Training Pipeline** | Data → Train → Test → Deploy | Process flow | SE-12-14 |
| **Confusion Matrix** | Model accuracy visualization | Matrix | SE-12-14 |
| **Algorithm Comparison** | Decision tree vs neural net | Comparison chart | SE-12-14 |

**ML diagram selection:**
- 🌳 Decision trees for simple predictions
- 🧠 Neural nets for complex patterns
- 🔄 Pipelines for training workflows
- 📊 Matrices for accuracy metrics
- 📈 Charts for algorithm comparison

---

## 🦾 PROGRAMMING MECHATRONICS

| Diagram Type | Scenario | Tool | Outcome |
|---|---|---|---|
| **Block Diagram** | Autonomous robot system | System block diagram | SE-11-12 |
| **Sensor/Actuator Map** | Climate control components | Component relationship | SE-11-13 |
| **Wiring Diagram** | Motor control circuit | Electrical diagram | SE-11-13 |
| **State Machine** | Traffic light controller | FSM | SE-11-14 |
| **Control Algorithm** | PID control flow | Flowchart | SE-11-14 |

**Hardware design diagrams:**
- 📦 Block diagrams for system overview
- 🔌 Component maps for hardware selection
- ⚡ Wiring diagrams for electrical connections
- 🔄 State machines for control logic
- 🧠 Algorithm flows for software implementation

---

## 🎯 CHOOSING THE RIGHT DIAGRAM

Use this flowchart to pick the best diagram type:

```
START
  ↓
Is it a sequence/flow?
  ├─ YES → Flowchart or Sequence Diagram
  │         (Shows order of steps)
  └─ NO
      ↓
Is it object relationships?
  ├─ YES → Class Diagram or ER Diagram
  │         (Shows structure & connections)
  └─ NO
      ↓
Is it system architecture?
  ├─ YES → Block Diagram or System Architecture
  │         (Shows components & connections)
  └─ NO
      ↓
Is it state transitions?
  ├─ YES → State Machine Diagram
  │         (Shows states & transitions)
  └─ NO
      ↓
Is it data/metadata?
  ├─ YES → Data Dictionary or Entity Table
  │         (Shows attributes & constraints)
  └─ NO
      ↓
Is it comparisons?
  ├─ YES → Venn Diagram or Matrix
  │         (Shows similarities/differences)
  └─ NO
      ↓
Is it hierarchical?
  ├─ YES → Tree Diagram or Structure Chart
  │         (Shows parent-child relationships)
  └─ NO
      ↓
Is it performance/efficiency?
  ├─ YES → Graph or Chart
  │         (Shows metrics & scales)
  └─ NO
      ↓
DEFAULT: Create a custom diagram matching your specific need
```

---

## 📝 DIAGRAM CREATION CHECKLIST

Before adding a diagram to your notes:

**Planning:**
- [ ] Identified the concept to visualize
- [ ] Determined the learning objective
- [ ] Linked to specific syllabus outcome
- [ ] Selected appropriate diagram type
- [ ] Gathered necessary information

**Creation:**
- [ ] Drew/coded the diagram
- [ ] Verified accuracy of content
- [ ] Used consistent styling/colors
- [ ] Labeled all components clearly
- [ ] Included a title/heading

**Documentation:**
- [ ] Written 1-2 sentence purpose statement
- [ ] Provided real-world scenario/example
- [ ] Linked to syllabus outcome code
- [ ] Suggested activity/exercise
- [ ] Added any notes/caveats

**Integration:**
- [ ] Placed near relevant section
- [ ] Formatted with proper HTML/CSS
- [ ] Tested rendering in browser
- [ ] Verified on mobile devices
- [ ] Added to version control

---

## 🛠️ TOOLS FOR CREATING DIAGRAMS

| Tool | Best For | Learning Curve | Cost |
|---|---|---|---|
| **Mermaid** | Flowcharts, class diagrams, UML | Easy | Free |
| **Draw.io** | General diagrams, wireframes | Easy | Free |
| **Lucidchart** | Professional diagrams | Medium | Paid/Free tier |
| **PlantUML** | Code-based UML diagrams | Hard | Free |
| **Figma** | Design & mockups | Medium | Free/Paid |
| **Graphviz** | Graph/tree diagrams | Hard | Free |

**Recommended for this project:** Mermaid (easy, free, integrates with HTML)

---

## 🔗 SYLLABUS OUTCOME QUICK MAP

**SE-11 (Year 11 Fundamentals):**
- SE-11-01: SDLC diagrams
- SE-11-02: Algorithm flowcharts, pseudocode, modelling tools
- SE-11-03: Collaboration workflows
- SE-11-04: Data dictionaries, data structures
- SE-11-07: Programming paradigms comparison
- SE-11-08: OOP concepts, class diagrams
- SE-11-09: OOP programming, sequence diagrams
- SE-11-12: Mechatronics systems
- SE-11-13: Sensor/actuator diagrams, wiring
- SE-11-14: Control algorithms, state machines

**SE-12 (Year 12 Specializations):**
- SE-12-02: Web protocols, HTTP flows
- SE-12-04: Web system architecture
- SE-12-06: Secure SDLC
- SE-12-07: Threat modeling, security design
- SE-12-11: Security testing matrices
- SE-12-14: ML algorithms, neural networks, decision trees

---

## 📚 EXAMPLE DIAGRAM CAPTIONS

When adding diagrams, use captions like these:

### SDLC Flowchart Caption:
> **Purpose:** Visualize the sequential phases of software development and how feedback loops improve the product.
> **Syllabus:** SE-11-01 | **Scenario:** School attendance system project
> **Try This:** Map your own project's development onto this diagram. Identify where security reviews should occur.

### Class Diagram Caption:
> **Purpose:** Show how related classes share common properties through inheritance (is-a relationships) and composition (has-a relationships).
> **Syllabus:** SE-11-09 | **Scenario:** Vehicle management system
> **Try This:** Create a similar diagram for your own system. What properties belong in the base class? What's unique to subclasses?

### Sequence Diagram Caption:
> **Purpose:** Illustrate the step-by-step messages passed between objects to complete a use case.
> **Syllabus:** SE-11-09 | **Scenario:** Bank withdrawal transaction
> **Try This:** Create a sequence diagram for "User login" or "Submit assignment". Show all message passing between objects.

---

## 🎓 STUDENT EXERCISE IDEAS

For each diagram type, suggest exercises:

**Flowcharts:**
- Draw an algorithm flowchart for bubble sort, binary search, or maze solving
- Create SDLC flowchart for a project you're working on
- Add decision diamonds for error handling

**Class Diagrams:**
- Model a school system (Student, Teacher, Course, Enrollment)
- Design a game system (Character, Item, Weapon, Armor)
- Create a social network (User, Post, Comment, Like)

**Sequence Diagrams:**
- Model user registration flow with validation
- Show online shopping checkout process
- Illustrate multiplayer game server communication

**State Machines:**
- Design traffic light controller with emergency override
- Model game character states (idle, walking, running, jumping)
- Create authentication state machine (logged out, logged in, admin)

**Data Dictionaries:**
- Create for a database you're designing
- Document all variables in a program
- Specify validation rules for a form

---

## ❓ FAQ

**Q: Can I use photos/screenshots instead of diagrams?**
A: Not ideal. Diagrams are clearer, scalable, and easier to modify. Save photos for non-technical content.

**Q: How detailed should diagrams be?**
A: Balance clarity with completeness. Include enough detail to understand the concept, but not so much that it becomes confusing.

**Q: Should every section have a diagram?**
A: No. Only add diagrams where they clarify or enhance understanding. A diagram should be "worth 1,000 words" of text.

**Q: Can students create their own diagrams?**
A: Absolutely! In fact, it's an excellent learning exercise. Assign "create a diagram for..." tasks.

**Q: What if I can't draw?**
A: Use Mermaid! You only need to write code. Let the tool handle the drawing.

**Q: How do I keep diagrams consistent?**
A: Use the same colors, fonts, and styling across all diagrams. Create a style guide if you have many.

