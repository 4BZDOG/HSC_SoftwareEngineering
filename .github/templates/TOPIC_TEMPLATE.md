# Topic Template — NESA NSW HSC Software Engineering

This template ensures new study notes maintain strict alignment with NESA NSW outcomes from creation.

## Header Section

```markdown
# [Topic Name]

## 🎯 NESA NSW Syllabus Alignment

### Year [11/12] Focus: [Topic Name] (Outcomes [SE-XX-XX] to [SE-XX-XX])

---
```

## Section Structure by Outcome

For each syllabus outcome, use this structure:

### Outcome SE-12-XX

**Focus Statement:** [What the syllabus explicitly asks for]

**Covered in This Section:**
- [Concept 1]
- [Concept 2]
- [Concept 3]

[Content here — keep to explicit syllabus requirements only]

---

## Content Guidelines

### ✅ INCLUDE:
- Definitions from the syllabus
- Concepts named in syllabus dot-points
- Real-world applications relevant to outcomes
- Examples of assessable knowledge
- Diagrams/flowcharts showing syllabus concepts
- Links to related syllabus sections

### ❌ EXCLUDE:
- Specific language implementations (Python, JavaScript, Java code) unless explicitly in syllabus
- Named external tools (bandit, OWASP ZAP, Burp Suite) unless in syllabus
- Advanced/optional topics beyond syllabus scope
- Industry best practices not mentioned in syllabus
- Marketing content or vendor references
- Speculative "future directions"

## Code Examples Rule

**Only include code if:**
1. The syllabus explicitly mentions implementing in [language]
2. The code demonstrates a core assessable concept
3. Code is simplified and annotated with line-by-line explanation

**Otherwise:** Explain the concept in prose with pseudocode/flowchart.

Example ✅ GOOD:
```
Parameterised queries prevent SQL injection by treating user input as data, not code.
Instead of: SELECT * FROM users WHERE id = 123
Use: SELECT * FROM users WHERE id = ?  // Value passed separately
```

Example ❌ AVOID:
```python
# Full implementation of an advanced cryptography library
import cryptography.hazmat.primitives.ciphers.aead as aead
# ... 50 lines of encryption code
```

## Key Terms Box Structure

Use consistent format:

```markdown
<div class="key-terms">
  <div class="key-term-item"><strong>🎯 Term Name</strong><span>Definition and context from syllabus.</span></div>
  <div class="key-term-item"><strong>🔐 Another Term</strong><span>Its definition.</span></div>
</div>
```

## Callout Box Hierarchy

For structured emphasis aligned with assessment relevance:

```markdown
<!-- Most critical to exam performance -->
<div class="callout exam-tip">
  <strong>HSC Exam Tip:</strong> [What will definitely be assessed]
</div>

<!-- Strongly connected to syllabus -->
<div class="callout key">
  <strong>Key Principle:</strong> [Important concept]
</div>

<!-- Supporting but non-core -->
<div class="callout info">
  <strong>Background:</strong> [Context]
</div>
```

## Diagram Captions Rule

Every diagram must have captions with three elements:

```markdown
<p class="diagram-caption">
  <strong>Purpose:</strong> [Why this diagram illustrates a syllabus concept]<br>
  <strong>Syllabus Link:</strong> [Outcome codes: SE-12-XX, SE-12-XX]<br>
  <strong>Try This:</strong> [Exam-style practice question]
</p>
```

## Metadata Annotations

Add HTML comments linking sections to outcomes (for automated validation):

```html
<!-- SE-12-04: Core Security Concepts — CIA Triad and AAA -->
<section id="security-concepts">
  <h2>Fundamental Security Concepts</h2>
  ...
</section>
```

## Review Checklist Before Publishing

- [ ] Every major section tagged with outcome code (SE-12-XX) in HTML comment
- [ ] No unnamed external tools (bandit, OWASP ZAP, etc.)
- [ ] No language-specific code beyond what syllabus mandates
- [ ] Every diagram has Purpose → Syllabus Link → Try This
- [ ] Exam tips included for assessable content
- [ ] No industry jargon that's not in syllabus
- [ ] Spell-check and grammar review
- [ ] Links to Syllabus-Mapping.md resource guide
- [ ] Tested in both light and dark mode

## Automated Validation

Run before committing:

```bash
./scripts/validate-alignment.sh
```

This checks for:
- Blacklisted tool names (bandit, safety, OWASP ZAP, Burp Suite, etc.)
- Outcome codes in HTML comments
- Missing diagram captions
- Orphaned section references

---

**Template Version:** 1.0 | **Last Updated:** June 2026
