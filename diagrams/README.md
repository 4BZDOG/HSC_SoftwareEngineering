# Diagram Integration Guide for HSC Software Engineering Notes

This guide identifies ideal locations to add diagrams and visual tools across all topic pages, with ready-to-use Mermaid code and implementation scenarios.

---

## Directory Structure

Create `/diagrams/` directory to organize all diagram assets:

```
diagrams/
├── README.md                          (this file)
├── generated/                         (SVG/PNG exports from Mermaid)
│   ├── programming-fundamentals/
│   ├── object-oriented-paradigm/
│   ├── secure-software-architecture/
│   ├── programming-for-the-web/
│   ├── software-automation/
│   └── programming-mechatronics/
├── source-code/                       (Mermaid/PlantUML source)
│   ├── flowcharts/
│   ├── class-diagrams/
│   ├── data-models/
│   ├── network-diagrams/
│   ├── state-machines/
│   └── system-architecture/
└── templates/                         (reusable diagram templates)
    ├── sdlc-template.mmd
    ├── flowchart-template.mmd
    ├── class-diagram-template.mmd
    └── sequence-diagram-template.mmd
```

---

## PROGRAMMING FUNDAMENTALS

### 1. SDLC Overview Diagram
**Location:** Section 1 - "🚀 Software Development Steps"

**Syllabus Link:** SE-11-01 (Explore the fundamental software development steps)

**Tool:** Flowchart / SDLC Diagram

**Purpose:** Visualize the sequential flow of SDLC phases and their interconnections

**Scenario:** A school attendance system project flows through: Requirements Definition → Specifications → Design → Development → Integration → Testing → Installation → Maintenance

**Mermaid Code:**
```mermaid
flowchart TD
    A["📋 Requirements Definition<br/>Identify stakeholder needs"] --> B["⚙️ Specifications<br/>Define technical constraints"]
    B --> C["🎨 Design<br/>Plan algorithms & structure"]
    C --> D["💻 Development<br/>Write code in programming language"]
    D --> E["🧩 Integration<br/>Combine modules into system"]
    E --> F["🧪 Testing & Debugging<br/>Identify and fix errors"]
    F --> G["📦 Installation<br/>Deploy to users"]
    G --> H["🛠️ Maintenance<br/>Apply patches & updates"]
    H -.->|Feedback Loop| A

    style A fill:#e1f5ff
    style B fill:#e1f5ff
    style C fill:#fff3e0
    style D fill:#f3e5f5
    style E fill:#e8f5e9
    style F fill:#fce4ec
    style G fill:#f1f8e9
    style H fill:#ede7f6
```

---

### 2. Algorithm Flowchart Examples
**Location:** Section 5 - "📝 Developing Algorithms Using Pseudocode and Flowcharts"

**Syllabus Link:** SE-11-02 (Develop structured algorithms)

**Tool:** Flowchart Diagram

**Purpose:** Show concrete examples of algorithm logic flow using standard flowchart symbols

**Scenario 1 - Linear Search:**
```mermaid
flowchart TD
    Start(["START: Search for target in list"]) --> Input["INPUT: list, target"]
    Input --> SetIndex["index = 0"]
    SetIndex --> Check{{"index < length(list)?"}}
    Check -->|No| NotFound["RETURN -1<br/>Not Found"]
    Check -->|Yes| Compare{{"list[index] == target?"}}
    Compare -->|Yes| Found["RETURN index"]
    Compare -->|No| Increment["index = index + 1"]
    Increment --> Check
    Found --> End(["END"])
    NotFound --> End

    style Start fill:#90EE90
    style End fill:#FFB6C6
    style Found fill:#87CEEB
    style NotFound fill:#FFB347
```

**Scenario 2 - Sorting Decision:**
```mermaid
flowchart TD
    Start(["START: Sort data"]) --> Input["INPUT: array of numbers"]
    Input --> Check{{"Array size > 1000?"}}
    Check -->|Yes| Merge["Use Merge Sort<br/>O(n log n)"]
    Check -->|No| Bubble["Use Bubble Sort<br/>Simpler implementation"]
    Merge --> Sort["SORT array"]
    Bubble --> Sort
    Sort --> Output["OUTPUT: sorted array"]
    Output --> End(["END"])

    style Start fill:#90EE90
    style End fill:#FFB6C6
    style Merge fill:#87CEEB
    style Bubble fill:#87CEEB
```

---

### 3. Structure Chart Diagram
**Location:** Section 6 - "📊 Modelling Tools for Design"

**Syllabus Link:** SE-11-02 (Use modelling tools)

**Tool:** Structure Chart / Hierarchical Diagram

**Purpose:** Show how a program breaks down into subroutines and how they call each other

**Scenario:** ATM system with modular structure

**Mermaid Code:**
```mermaid
graph TD
    Main["🏦 ATM System<br/>Main Module"]

    Main --> Auth["🔐 Authenticate User"]
    Main --> Menu["📋 Display Menu"]
    Main --> Trans["💳 Process Transaction"]
    Main --> Disp["💵 Dispense Cash"]

    Auth --> VerifyPIN["Verify PIN<br/>Against Database"]
    Auth --> CheckCard["Check Card<br/>Validity"]

    Trans --> Withdraw["Withdraw"]
    Trans --> Deposit["Deposit"]
    Trans --> Balance["Check Balance"]

    Withdraw --> Update1["Update Account"]
    Deposit --> Update2["Update Account"]

    Update1 --> Record["Record Transaction"]
    Update2 --> Record

    style Main fill:#4CAF50,color:#fff
    style Auth fill:#2196F3,color:#fff
    style Menu fill:#2196F3,color:#fff
    style Trans fill:#2196F3,color:#fff
    style Disp fill:#2196F3,color:#fff
    style Record fill:#FF9800,color:#fff
    style Update1 fill:#FF9800,color:#fff
    style Update2 fill:#FF9800,color:#fff
```

---

### 4. Data Dictionary Table
**Location:** Section 11 - "📋 Data Types and Data Dictionaries"

**Syllabus Link:** SE-11-04 (Investigate data structures)

**Tool:** Data Dictionary / Metadata Table

**Purpose:** Document all variables, their types, constraints, and purposes

**HTML Example:**
```html
<div class="code-block">
  <div class="code-header"><span class="code-lang">Data Dictionary — Student Management System</span></div>
  <table style="width:100%; border-collapse: collapse;">
    <tr style="background: #f0f0f0;">
      <th>Field Name</th>
      <th>Data Type</th>
      <th>Size</th>
      <th>Description</th>
      <th>Validation Rules</th>
    </tr>
    <tr>
      <td>Student_ID</td>
      <td>Integer</td>
      <td>5 digits</td>
      <td>Unique identifier for each student</td>
      <td>1000-99999, Cannot be NULL</td>
    </tr>
    <tr>
      <td>First_Name</td>
      <td>String</td>
      <td>Max 50 chars</td>
      <td>Student's first name</td>
      <td>Letters only, Cannot be NULL</td>
    </tr>
    <tr>
      <td>Email</td>
      <td>String</td>
      <td>Max 100 chars</td>
      <td>Student email address</td>
      <td>Must match email format</td>
    </tr>
    <tr>
      <td>Grade_Level</td>
      <td>Integer</td>
      <td>2 digits</td>
      <td>Current year level (11 or 12)</td>
      <td>Must be 11 or 12</td>
    </tr>
    <tr>
      <td>Enrollment_Date</td>
      <td>Date</td>
      <td>YYYY-MM-DD</td>
      <td>When student enrolled</td>
      <td>Cannot be in future</td>
    </tr>
  </table>
</div>
```

---

### 5. Algorithm Complexity Analysis Diagram
**Location:** Section 7 - "🔍 Analysing Algorithm Logic and Structure"

**Syllabus Link:** SE-11-02 (Apply computational thinking)

**Tool:** Time Complexity Visualization (Big O Notation)

**Purpose:** Visualize how algorithm performance scales with input size

**Mermaid Code:**
```mermaid
graph LR
    A["O(1)<br/>Constant<br/>Direct lookup"] --> B["O(log n)<br/>Logarithmic<br/>Binary search"]
    B --> C["O(n)<br/>Linear<br/>Simple search"]
    C --> D["O(n log n)<br/>Linearithmic<br/>Merge sort"]
    D --> E["O(n²)<br/>Quadratic<br/>Bubble sort"]
    E --> F["O(2ⁿ)<br/>Exponential<br/>Brute force"]

    A -.->|Fastest| F

    style A fill:#90EE90
    style B fill:#98FB98
    style C fill:#FFE4B5
    style D fill:#FFD700
    style E fill:#FFA500
    style F fill:#FF4500
```

---

## OBJECT-ORIENTED PARADIGM

### 1. Class Diagram Example
**Location:** Section 4 - "🧱 Apply: The Four Pillars of OOP"

**Syllabus Link:** SE-11-08, SE-11-09 (Programming in OOP)

**Tool:** UML Class Diagram

**Purpose:** Show how classes encapsulate properties and methods, demonstrating inheritance and composition

**Scenario:** Vehicle management system with inheritance hierarchy

**Mermaid Code:**
```mermaid
classDiagram
    class Vehicle {
        -String manufacturer
        -float speed
        -float fuel_level
        +start()
        +stop()
        +accelerate()
    }

    class Car {
        -int num_doors
        -String trunk_size
        +open_trunk()
        +close_trunk()
    }

    class Motorcycle {
        -bool has_sidecar
        +wheelie()
    }

    class Truck {
        -float cargo_capacity
        -float current_load
        +load_cargo()
        +unload_cargo()
    }

    Vehicle <|-- Car
    Vehicle <|-- Motorcycle
    Vehicle <|-- Truck

    class Engine {
        -String engine_type
        -float displacement
        +calculate_power()
    }

    Vehicle *-- Engine
```

---

### 2. OOP Paradigm Comparison
**Location:** Section 2 - "⚡ Comparing Procedural and Object-Oriented Programming"

**Syllabus Link:** SE-11-07 (Understanding OOP concepts)

**Tool:** Venn Diagram / Comparison Chart

**Mermaid Code:**
```mermaid
graph LR
    A["Procedural<br/>━━━━━━<br/>• Functions<br/>• Global data<br/>• Top-down<br/>• Focus: How<br/>• Data separate<br/>  from logic"] --> B["Shared<br/>━━━━━━<br/>• Modular code<br/>• Reusability<br/>• Structured<br/>• Maintainability<br/>• Testing support"]

    B --> C["Object-Oriented<br/>━━━━━━<br/>• Classes/Objects<br/>• Encapsulation<br/>• Inheritance<br/>• Focus: What<br/>• Data + Methods<br/>  together"]

    style A fill:#E3F2FD
    style B fill:#F3E5F5
    style C fill:#E8F5E9
```

---

### 3. Message Passing / Sequence Diagram
**Location:** Section 7 - "📨 Message-Passing Between Objects"

**Syllabus Link:** SE-11-09 (Programming in OOP)

**Tool:** UML Sequence Diagram

**Purpose:** Show how objects communicate through method calls in a specific scenario

**Scenario:** Bank system - withdrawing money

**Mermaid Code:**
```mermaid
sequenceDiagram
    participant User
    participant BankApp as Bank App
    participant Account
    participant Ledger

    User->>BankApp: Enter withdrawal amount
    BankApp->>Account: check_balance()
    Account-->>BankApp: current_balance

    alt Sufficient funds?
        BankApp->>Account: withdraw(amount)
        Account->>Ledger: record_transaction(withdrawal)
        Ledger-->>Account: transaction_id
        Account-->>BankApp: success, new_balance
        BankApp-->>User: Withdrawal successful
        BankApp->>BankApp: dispense_cash(amount)
    else Insufficient funds
        BankApp-->>User: Error: Insufficient funds
    end
```

---

## SECURE SOFTWARE ARCHITECTURE

### 1. Secure SDLC Flowchart
**Location:** Section 2 - "🔄 Applying the SDLC to Develop Secure Code"

**Syllabus Link:** SE-12-06 (Develop secure software)

**Tool:** Enhanced SDLC Flowchart with Security Checkpoints

**Purpose:** Show security gates and validation points throughout development

**Mermaid Code:**
```mermaid
flowchart TD
    A["Requirements Analysis"] --> B{{"Security Review:<br/>Identify threats<br/>& risks?"}}
    B -->|Issues Found| B1["Update Requirements<br/>with security needs"]
    B1 --> B
    B -->|Approved| C["Design Phase"]

    C --> D{{"Threat Modeling:<br/>Identify attack<br/>vectors?"}}
    D -->|Vulnerabilities| D1["Revise Design<br/>for security"]
    D1 --> D
    D -->|Secure Design| E["Development"]

    E --> F{{"Code Review:<br/>Security audit<br/>passed?"}}
    F -->|Issues Found| F1["Fix vulnerabilities<br/>& refactor"]
    F1 --> E
    F -->|Passed| G["Security Testing"]

    G --> H{{"Penetration Test:<br/>All exploits<br/>resolved?"}}
    H -->|Vulnerabilities| H1["Patch & test again"]
    H1 --> G
    H -->|Secure| I["Deployment"]

    I --> J["Security Monitoring<br/>& Maintenance"]

    style A fill:#4CAF50,color:#fff
    style C fill:#4CAF50,color:#fff
    style E fill:#4CAF50,color:#fff
    style G fill:#FF9800,color:#fff
    style I fill:#2196F3,color:#fff
    style J fill:#9C27B0,color:#fff
    style B fill:#FFC107
    style D fill:#FFC107
    style F fill:#FFC107
    style H fill:#FFC107
```

---

### 2. Threat Model Diagram
**Location:** Section 3 - "🏗️ Security by Design: Cryptography and Sandboxing"

**Syllabus Link:** SE-12-07 (Design secure systems)

**Tool:** Data Flow Diagram (DFD) with Threat Indicators

**Purpose:** Identify where data is vulnerable and what protections are needed

**Scenario:** Web application threat model

**Mermaid Code:**
```mermaid
graph TB
    User["👤 User"]
    Browser["🌐 Web Browser<br/>Client"]
    Network["🔗 Network<br/>Internet"]
    Server["🖥️ Web Server<br/>HTTPS Encryption"]
    Database["💾 Database<br/>Encrypted Storage"]

    User -->|"1. User Input<br/>(Validate Input)"| Browser
    Browser -->|"2. HTTP Request<br/>(HTTPS)"| Network
    Network -->|"3. Request<br/>(Firewall)"| Server
    Server -->|"4. Query<br/>(SQL Injection Prevention)"| Database
    Database -->|"5. Response<br/>(Encryption)"| Server
    Server -->|"6. Response<br/>(HTTPS)"| Network
    Network -->|"7. Display<br/>(XSS Protection)"| Browser
    Browser -->|"8. Rendered Page"| User

    style User fill:#E8F5E9
    style Browser fill:#E3F2FD
    style Network fill:#FFF3E0
    style Server fill:#F3E5F5
    style Database fill:#FCE4EC
```

---

### 3. Security Testing Matrix
**Location:** Section 3 - "🧪 Security Testing and Management Strategies"

**Syllabus Link:** SE-12-11 (Testing security)

**Tool:** Testing Checklist / Matrix

**HTML Example:**
```html
<div class="code-block">
  <div class="code-header"><span class="code-lang">Security Testing Checklist</span></div>
  <table style="width:100%; border-collapse: collapse;">
    <tr style="background: #f0f0f0;">
      <th>Test Category</th>
      <th>Test Type</th>
      <th>Example</th>
      <th>Tools</th>
    </tr>
    <tr>
      <td><strong>Input Validation</strong></td>
      <td>Fuzzing</td>
      <td>Test with unexpected inputs: '; DROP TABLE--</td>
      <td>Burp Suite, OWASP ZAP</td>
    </tr>
    <tr>
      <td><strong>Authentication</strong></td>
      <td>Brute Force</td>
      <td>Test password strength, session management</td>
      <td>Hashcat, John the Ripper</td>
    </tr>
    <tr>
      <td><strong>Authorization</strong></td>
      <td>Privilege Escalation</td>
      <td>Test if users can access unauthorized data</td>
      <td>Manual testing, automated scanners</td>
    </tr>
    <tr>
      <td><strong>Cryptography</strong></td>
      <td>Weak Encryption</td>
      <td>Test SSL/TLS configuration</td>
      <td>SSL Labs, TestSSL</td>
    </tr>
    <tr>
      <td><strong>Business Logic</strong></td>
      <td>Logic Flaws</td>
      <td>Test transaction flow exploits</td>
      <td>Manual code review, SAST tools</td>
    </tr>
  </table>
</div>
```

---

## PROGRAMMING FOR THE WEB

### 1. Web Data Flow / Request-Response Diagram
**Location:** Section 2 - "📦 Data Transfer on the Internet"

**Syllabus Link:** SE-12-02 (Understand web technologies)

**Tool:** Sequence Diagram / Architecture Diagram

**Purpose:** Show how HTTP requests and responses flow between client and server

**Mermaid Code:**
```mermaid
sequenceDiagram
    participant Browser as 🌐 Browser
    participant Server as 🖥️ Web Server
    participant DB as 💾 Database

    Browser->>Server: HTTP GET /student/profile?id=42
    Server->>DB: SELECT * FROM students WHERE id=42
    DB-->>Server: Student record
    Server-->>Browser: HTTP 200 OK<br/>HTML + CSS + JS

    rect rgb(200, 150, 255)
    Browser->>Browser: Render HTML<br/>Execute CSS<br/>Load Images
    end

    Note over Browser,Server: User Interaction
    Browser->>Server: POST /submit/assignment<br/>(multipart form data)
    Server->>Server: Validate input<br/>Process file
    Server->>DB: INSERT assignment_submission
    Server-->>Browser: HTTP 302 Redirect<br/>Location: /success
    Browser->>Server: HTTP GET /success
    Server-->>Browser: HTTP 200 Success page
```

---

### 2. Web Protocol Stack Diagram
**Location:** Section 3 - "🔌 Web Protocols and Their Ports"

**Syllabus Link:** SE-12-02 (Understand protocols)

**Tool:** Layered Architecture / OSI Model

**Purpose:** Show how web protocols stack on top of each other

**Mermaid Code:**
```mermaid
graph TB
    A["🌐 HTTP/HTTPS<br/>Port 80/443<br/>Web protocol"]
    B["📨 TCP<br/>Port varies<br/>Reliable transmission"]
    C["📦 IP<br/>Routing packets"]
    D["🔗 Ethernet/WiFi<br/>Physical transmission"]
    E["⚡ Signals on wire<br/>Electrons/Light"]

    A -->|"Uses"| B
    B -->|"Uses"| C
    C -->|"Uses"| D
    D -->|"Uses"| E

    style A fill:#E3F2FD
    style B fill:#F3E5F5
    style C fill:#E8F5E9
    style D fill:#FFF3E0
    style E fill:#FCE4EC
```

---

### 3. Web Architecture Diagram
**Location:** Section 7 - "🏗️ Modelling a Web Development System"

**Syllabus Link:** SE-12-04 (Model web systems)

**Tool:** System Architecture Diagram

**Purpose:** Show the overall structure of a modern web application

**Mermaid Code:**
```mermaid
graph TB
    Client["👤 Client Layer<br/>🌐 Browser<br/>HTML/CSS/JavaScript"]

    CDN["🔄 CDN<br/>Static assets<br/>Images, CSS, JS"]

    WebServer["🖥️ Web Server Layer<br/>Node.js / Python / PHP<br/>Request handling<br/>Business logic"]

    Cache["⚡ Cache Layer<br/>Redis / Memcached<br/>Session data<br/>Frequent queries"]

    Database["💾 Database Layer<br/>PostgreSQL / MongoDB<br/>Persistent storage<br/>User data"]

    Storage["📁 File Storage<br/>S3 / Cloud Storage<br/>User uploads<br/>Media files"]

    Client -->|"1. HTTPS Request"| CDN
    Client -->|"2. HTTPS Request"| WebServer
    WebServer -->|"3. Query"| Cache
    Cache -->|"4. Miss"| Database
    Database -->|"5. Return"| Cache
    WebServer -->|"6. Store/Retrieve"| Storage
    WebServer -->|"7. JSON Response"| Client

    style Client fill:#E3F2FD
    style CDN fill:#FFF3E0
    style WebServer fill:#F3E5F5
    style Cache fill:#FFE0B2
    style Database fill:#E8F5E9
    style Storage fill:#FCE4EC
```

---

## SOFTWARE AUTOMATION / MACHINE LEARNING

### 1. Decision Tree Diagram
**Location:** Section 1 - "🌳 Design Models for ML: Decision Trees & Neural Networks"

**Syllabus Link:** SE-12-14 (Develop ML models)

**Tool:** Decision Tree / Flowchart

**Purpose:** Show how decision trees make predictions through a series of decisions

**Scenario:** Email spam classification

**Mermaid Code:**
```mermaid
graph TD
    Root{{"Contains 'Click here' ?<br/>Gini: 0.45"}}

    Root -->|Yes| Node1{{"Contains 'Free money' ?<br/>Gini: 0.12"}}
    Root -->|No| Node2{{"Unknown sender ?<br/>Gini: 0.38"}}

    Node1 -->|Yes| Leaf1["🚫 SPAM<br/>Confidence: 95%"]
    Node1 -->|No| Leaf2["✅ NOT SPAM<br/>Confidence: 78%"]

    Node2 -->|Yes| Leaf3["🚫 SPAM<br/>Confidence: 85%"]
    Node2 -->|No| Leaf4["✅ NOT SPAM<br/>Confidence: 92%"]

    style Leaf1 fill:#FF6B6B
    style Leaf3 fill:#FF6B6B
    style Leaf2 fill:#51CF66
    style Leaf4 fill:#51CF66
```

---

### 2. Neural Network Topology Diagram
**Location:** Section 2 - "🕸️ Neural Network Models Using OOP"

**Syllabus Link:** SE-12-14 (Implement ML algorithms)

**Tool:** Neural Network Architecture Diagram

**Purpose:** Visualize the structure of a neural network with layers and connections

**Mermaid Code:**
```mermaid
graph LR
    subgraph Input["Input Layer"]
        I1["x₁: Age"]
        I2["x₂: Income"]
        I3["x₃: Credit Score"]
    end

    subgraph Hidden1["Hidden Layer 1"]
        H1["Neuron 1"]
        H2["Neuron 2"]
        H3["Neuron 3"]
    end

    subgraph Hidden2["Hidden Layer 2"]
        H4["Neuron 4"]
        H5["Neuron 5"]
    end

    subgraph Output["Output Layer"]
        O["Loan Approved?"]
    end

    I1 --> H1
    I1 --> H2
    I1 --> H3
    I2 --> H1
    I2 --> H2
    I2 --> H3
    I3 --> H1
    I3 --> H2
    I3 --> H3

    H1 --> H4
    H1 --> H5
    H2 --> H4
    H2 --> H5
    H3 --> H4
    H3 --> H5

    H4 --> O
    H5 --> O

    style Input fill:#E3F2FD
    style Hidden1 fill:#F3E5F5
    style Hidden2 fill:#F3E5F5
    style Output fill:#E8F5E9
```

---

## PROGRAMMING MECHATRONICS

### 1. Mechatronic System Block Diagram
**Location:** Section 1 - "🦾 Mechatronic Applications"

**Syllabus Link:** SE-11-12 (Understand mechatronics)

**Tool:** Block Diagram / System Architecture

**Purpose:** Show the interaction between software, hardware, sensors, and actuators

**Scenario:** Autonomous mobile robot

**Mermaid Code:**
```mermaid
graph TB
    Sensors["📡 SENSORS<br/>Camera<br/>Ultrasonic<br/>IMU<br/>Encoder"]

    MCU["🎮 MICROCONTROLLER<br/>Arduino/Raspberry Pi<br/>Process data<br/>Run algorithms"]

    Logic["🧠 CONTROL ALGORITHM<br/>Navigation<br/>Obstacle avoidance<br/>Path planning"]

    Actuators["⚙️ ACTUATORS<br/>Motors<br/>Servos<br/>LEDs"]

    Power["🔋 POWER SYSTEM<br/>Battery<br/>Voltage regulator<br/>Power distribution"]

    Sensors -->|"Analog/Digital<br/>Signals"| MCU
    MCU -->|"Sensor data<br/>Interpretation"| Logic
    Logic -->|"Control signals<br/>PWM/Digital"| MCU
    MCU -->|"Output commands<br/>PWM/GPIO"| Actuators
    Power -->|"Supply voltage"| MCU
    Power -->|"Supply voltage"| Sensors
    Power -->|"Supply voltage"| Actuators

    style Sensors fill:#E3F2FD
    style MCU fill:#FFF3E0
    style Logic fill:#F3E5F5
    style Actuators fill:#E8F5E9
    style Power fill:#FCE4EC
```

---

### 2. Sensor/Actuator Interaction Diagram
**Location:** Section 3 - "🌡️ Sensors, Actuators & Manipulators"

**Syllabus Link:** SE-11-13 (Select and use components)

**Tool:** Component Relationship Diagram

**Purpose:** Show how different sensors and actuators work together in a system

**Scenario:** Climate control system

**Mermaid Code:**
```mermaid
graph TB
    TempSensor["🌡️ Temperature Sensor<br/>DHT22<br/>Measures: -40°C to 80°C"]
    HumiditySensor["💧 Humidity Sensor<br/>Built-in to DHT22<br/>Measures: 0-100%"]
    LightSensor["💡 Light Sensor<br/>LDR<br/>Measures: Brightness"]

    MCU["🎮 Arduino Mega<br/>Processes sensor data<br/>Applies control logic"]

    Fan["🌀 AC Fan Motor<br/>Actuator<br/>PWM control 0-255"]
    Heater["🔥 Heating Element<br/>Relay control<br/>On/Off"]
    Lights["💡 LED Lights<br/>PWM control<br/>Brightness 0-255"]

    TempSensor --> MCU
    HumiditySensor --> MCU
    LightSensor --> MCU

    MCU -->|"If temp > 25°C<br/>PWM 200"| Fan
    MCU -->|"If temp < 18°C<br/>Relay ON"| Heater
    MCU -->|"If light < 300<br/>PWM 150"| Lights

    style TempSensor fill:#E3F2FD
    style HumiditySensor fill:#E3F2FD
    style LightSensor fill:#E3F2FD
    style MCU fill:#FFF3E0
    style Fan fill:#E8F5E9
    style Heater fill:#E8F5E9
    style Lights fill:#E8F5E9
```

---

### 3. Control Algorithm State Machine
**Location:** Section 4 - "🧠 Algorithm Development and Control Systems"

**Syllabus Link:** SE-11-14 (Develop control algorithms)

**Tool:** State Machine Diagram / FSM

**Purpose:** Show how a system transitions between different states based on inputs

**Scenario:** Traffic light control system

**Mermaid Code:**
```mermaid
stateDiagram-v2
    [*] --> RED

    RED --> GREEN: Timer expires (30s)
    RED --> RED: Timer counting

    GREEN --> YELLOW: Timer expires (25s)
    GREEN --> GREEN: Timer counting

    YELLOW --> RED: Timer expires (5s)
    YELLOW --> YELLOW: Timer counting

    RED --> EMERGENCY: Emergency signal
    GREEN --> EMERGENCY: Emergency signal
    YELLOW --> EMERGENCY: Emergency signal

    EMERGENCY --> EMERGENCY: Flash red
    EMERGENCY --> RED: Emergency cleared

    note right of RED
        ⚫ Stop
        Duration: 30s
    end note

    note right of GREEN
        🟢 Go
        Duration: 25s
    end note

    note right of YELLOW
        🟡 Caution
        Duration: 5s
    end note

    note right of EMERGENCY
        🚨 Flashing Red
        All traffic stops
    end note
```

---

### 4. Wiring Diagram Reference
**Location:** Section 5 - "🔌 Power, Materials and Wiring Diagrams"

**Syllabus Link:** SE-11-13 (Build mechatronic systems)

**Tool:** Circuit Diagram

**Purpose:** Show electrical connections, components, and power distribution

**Simple Motor Control Example:**
```
    +5V ─────────┬─────────┐
                 │         │
                 R1       [==] Motor
                 │         │
                 └─────┬───┘
                       │
                      LED (indicator)
                       │
               [Switch] S1
                       │
                      GND
```

---

## IMPLEMENTATION GUIDELINES

### Adding Diagrams to HTML Pages

**Option 1: Embed Mermaid directly in HTML**
```html
<div class="diagram-block">
  <h3>Diagram Title</h3>
  <div class="mermaid">
    [Mermaid code here]
  </div>
  <p class="diagram-caption">
    <strong>Purpose:</strong> [Explain what students should learn]<br>
    <strong>Try This:</strong> [Suggested exercise or analysis]
  </p>
</div>
```

**Option 2: Reference external SVG**
```html
<figure class="diagram-figure">
  <img src="../diagrams/generated/programming-fundamentals/sdlc-flow.svg"
       alt="SDLC Flow Diagram" />
  <figcaption>SDLC Overview with security checkpoints</figcaption>
</figure>
```

### CSS for Diagrams
```css
.diagram-block {
  background: #f9f9f9;
  border-left: 4px solid var(--primary);
  padding: 1.5rem;
  margin: 2rem 0;
  border-radius: var(--radius-md);
}

.diagram-block h3 {
  margin-top: 0;
  color: var(--primary);
}

.mermaid {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

.diagram-caption {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}
```

---

## Next Steps

1. **Create `/diagrams/` directory structure** using the layout above
2. **Generate SVG files** from Mermaid code using:
   - Mermaid CLI: `mmdc -i source.mmd -o output.svg`
   - Online editor: https://mermaid.live
3. **Add diagrams to pages** using the HTML implementation guidelines
4. **Update styles.css** with diagram styling from above
5. **Create diagram legend** for each page explaining symbols used
6. **Add interactive elements** (tooltips, expand/collapse) for complex diagrams

---

## Diagram Legend

- **Rectangles/Boxes**: Processes, components, or systems
- **Diamonds**: Decision points / Conditions
- **Arrows**: Flow direction, data transfer, relationships
- **Cylinders**: Databases or storage
- **Circles**: Start/end points
- **Dotted lines**: Feedback loops or optional paths
- **Color coding**:
  - 🟦 Blue: Input/Start
  - 🟪 Purple: Processing/Logic
  - 🟩 Green: Output/Result
  - 🟧 Orange: Warning/Caution
  - 🟥 Red: Error/Stop

