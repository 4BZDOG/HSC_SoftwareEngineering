#!/bin/bash

# ============================================================================
# Syllabus Alignment Validator
# ============================================================================
# Ensures study notes maintain strict NESA NSW syllabus alignment
# Checks for non-syllabus content, missing metadata, and orphaned references
#
# Usage: ./scripts/validate-alignment.sh
#        or run via CI/CD to block commits with alignment issues

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
ERRORS=0
WARNINGS=0
CHECKS_PASSED=0

# ── Helper Functions ──

print_header() {
  echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

error() {
  echo -e "${RED}✗ ERROR: $1${NC}"
  ERRORS=$((ERRORS + 1))
}

warning() {
  echo -e "${YELLOW}⚠ WARNING: $1${NC}"
  WARNINGS=$((WARNINGS + 1))
}

success() {
  echo -e "${GREEN}✓ $1${NC}"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
}

# ── Validation Checks ──

print_header "NESA NSW Syllabus Alignment Validation"

# 1. Check for blacklisted tool names in markdown and HTML
print_header "Check 1: Blacklisted Tool References"

BLACKLIST_TOOLS=("bandit" "safety" "OWASP ZAP" "Burp Suite" "nessus" "openvas" "metasploit" "aircrack")
BLACKLIST_PATTERNS=("bandit" "safety" "OWASP.ZAP" "Burp.Suite")

found_blacklist=0
for pattern in "${BLACKLIST_PATTERNS[@]}"; do
  # Search in resources/*.md and topics/**/*.html
  matches=$(grep -r "$pattern" "$PROJECT_ROOT/resources/" "$PROJECT_ROOT/topics/" 2>/dev/null || true)

  if [ -n "$matches" ]; then
    error "Found blacklisted tool reference: $pattern"
    echo "$matches" | sed 's/^/  /'
    found_blacklist=1
  fi
done

if [ $found_blacklist -eq 0 ]; then
  success "No blacklisted tool references found"
fi

# 2. Check for syllabus outcome metadata in HTML comments
print_header "Check 2: Syllabus Outcome Metadata"

echo "Checking for outcome annotations (<!-- SE-12-XX -->)..."

topic_files=$(find "$PROJECT_ROOT/topics" -name "*.html" -type f)
outcome_pattern="<!-- SE-12-[0-9]{2}"
missing_annotations=0

for file in $topic_files; do
  if grep -q "$outcome_pattern" "$file"; then
    success "Found outcome annotations in $(basename "$file")"
  else
    warning "Missing outcome annotations in $(basename "$file")"
    missing_annotations=1
  fi
done

# 3. Check for diagram captions with Purpose, Syllabus Link, Try This
print_header "Check 3: Diagram Caption Structure"

echo "Checking for complete diagram captions..."

diagram_files=$(grep -l "diagram-caption" "$PROJECT_ROOT/topics"/*.html 2>/dev/null || true)

missing_captions=0
for file in $diagram_files; do
  filename=$(basename "$file")

  # Count diagrams without complete captions
  diagrams=$(grep -c "diagram-caption" "$file" || true)

  if [ "$diagrams" -gt 0 ]; then
    # Check for Purpose, Syllabus Link, Try This in captions
    has_purpose=$(grep -c "Purpose:" "$file" || true)
    has_link=$(grep -c "Syllabus Link:" "$file" || true)
    has_try=$(grep -c "Try This:" "$file" || true)

    if [ "$has_purpose" -gt 0 ] && [ "$has_link" -gt 0 ] && [ "$has_try" -gt 0 ]; then
      success "$filename has complete diagram captions ($diagrams found)"
    else
      warning "$filename may have incomplete diagram captions (Purpose: $has_purpose, Link: $has_link, Try This: $has_try)"
      missing_captions=1
    fi
  fi
done

# 4. Check for language-specific code implementations
print_header "Check 4: Language-Specific Code Implementation"

echo "Checking for excessive code blocks..."

# Look for patterns that suggest language-specific examples beyond what's needed
code_patterns=("def " "import " "class " "function " "const " "let ")
suspicious_files=0

for file in "$PROJECT_ROOT/topics"/*.html; do
  code_block_count=$(grep -c "<code>" "$file" 2>/dev/null || true)

  if [ "$code_block_count" -gt 5 ]; then
    warning "$(basename "$file") has $code_block_count code blocks — ensure they're syllabus-required"
    suspicious_files=$((suspicious_files + 1))
  fi
done

if [ $suspicious_files -eq 0 ]; then
  success "Code block quantities appear reasonable"
fi

# 5. Check for required section headings alignment
print_header "Check 5: Content Structure Validation"

echo "Verifying required syllabus outcome coverage..."

required_sections=("Benefits of Secure" "SDLC" "Core Security Concepts" "Privacy by Design")
structure_ok=0

for file in "$PROJECT_ROOT/topics"/*.html; do
  filename=$(basename "$file")
  for section in "${required_sections[@]}"; do
    if grep -qi "$section" "$file"; then
      success "Found '$section' in $(basename "$file")"
      structure_ok=$((structure_ok + 1))
    fi
  done
done

# 6. Markdown frontmatter validation
print_header "Check 6: Resource Documentation"

echo "Checking for markdown metadata..."

md_files=$(find "$PROJECT_ROOT/resources" -name "*.md" -type f)
meta_issues=0

for file in $md_files; do
  if head -n 5 "$file" | grep -q "^#"; then
    success "$(basename "$file") has proper heading structure"
  else
    warning "$(basename "$file") may lack proper heading structure"
    meta_issues=$((meta_issues + 1))
  fi
done

# ── Summary Report ──

print_header "Validation Summary"

total_checks=$((CHECKS_PASSED + ERRORS + WARNINGS))
echo -e "Total Checks: ${BLUE}$total_checks${NC}"
echo -e "Passed:       ${GREEN}$CHECKS_PASSED${NC}"
echo -e "Warnings:     ${YELLOW}$WARNINGS${NC}"
echo -e "Errors:       ${RED}$ERRORS${NC}"

print_header "Validation Result"

if [ $ERRORS -gt 0 ]; then
  echo -e "${RED}❌ Validation FAILED ($ERRORS errors)${NC}"
  echo -e "\nFix errors before committing. Use template at:"
  echo -e "${BLUE}.github/templates/TOPIC_TEMPLATE.md${NC}"
  exit 1
elif [ $WARNINGS -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Validation PASSED with WARNINGS ($WARNINGS warnings)${NC}"
  echo -e "\nReview warnings and consider updates for consistency."
  exit 0
else
  echo -e "${GREEN}✅ Validation PASSED (all checks successful)${NC}"
  exit 0
fi
