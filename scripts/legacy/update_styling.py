#!/usr/bin/env python3
"""
Project-wide styling updates:
  1. Outcome subtitles → 🎯 <em>(SE-XX-XX)</em>
  2. Direct syllabus paragraphs → 📌 <em>...</em>
  3. Remove command verb from h3/h4 headings
  4. Explicit Example: → line break + 🌏 emoji
"""

import re
import os

BASE = '/Users/david/Downloads/HSC_SoftwareEngineering-claude-hsc-notes-website-URqvH'

FILES = [
    'topics/secure-software-architecture.html',
    'topics/software-automation.html',
    'topics/programming-for-the-web.html',
    'topics/software-engineering-project.html',
    'topics/programming-fundamentals.html',
    'topics/object-oriented-paradigm.html',
    'topics/programming-mechatronics.html',
    'topics/course-tools.html',
]

# NESA command verbs (including multi-word forms)
VERBS = (
    r'Design, develop and implement|Design, develop and apply|'
    r'Investigate and describe|Investigate and practise|Investigate and explain|'
    r'Explore and explain|Apply and describe|Apply and evaluate|'
    r'Test and evaluate|Observe and describe|Research, experiment with and evaluate|'
    r'Interpret and apply|Define and analyse|'
    r'Describe|Investigate|Apply|Explore|Explain|Analyse|Evaluate|Compare|'
    r'Design|Develop|Implement|Research|Use|Model|Assess|Propose|Define|'
    r'Demonstrate|Justify|Distinguish|Interpret|Identify|Examine|Construct|'
    r'Select|Determine|Outline|Represent'
)

def change1_outcome_subtitles(content):
    """Add 🎯 emoji, italicize, add brackets to outcome codes."""
    def fix(m):
        inner = m.group(1).strip()
        if '🎯' in inner:
            return m.group(0)  # already processed
        # Strip any existing em tags
        inner_clean = re.sub(r'</?em>', '', inner).strip()
        return f'<p class="outcome-subtitle">🎯 <em>({inner_clean})</em></p>'

    return re.sub(
        r'<p class="outcome-subtitle">(.*?)</p>',
        fix,
        content,
        flags=re.DOTALL
    )


def change2_syllabus_paragraphs(content):
    """Add 📌 and italicize direct syllabus directive paragraphs.

    These are the first <p> immediately after an outcome-subtitle.
    They start with a NESA command verb (in <strong> or plain text).
    """
    # After change1, outcome subtitles now contain 🎯
    # Find: outcome-subtitle closing </p> then immediate <p>CONTENT</p>
    def fix(m):
        lead = m.group(1)    # the outcome-subtitle closing </p>
        ws   = m.group(2)    # whitespace between
        inner = m.group(3)   # content between <p> and </p>

        if '📌' in inner:
            return m.group(0)  # already done

        # Simplify <strong><em>Verb</em></strong> → <strong>Verb</strong>
        # (whole para will be in <em> so inner em is redundant)
        inner = re.sub(r'<strong><em>([^<]+)</em></strong>', r'<strong>\1</strong>', inner)
        inner = re.sub(r'<em><strong>([^<]+)</strong></em>', r'<strong>\1</strong>', inner)

        return f'{lead}{ws}<p>📌 <em>{inner}</em></p>'

    # Match a </p> that closes an outcome-subtitle block,
    # followed by optional whitespace, then a <p>...</p>
    return re.sub(
        r'(</p>)(\s+)<p>((?:(?!</p>).)*?)</p>(?=\s*\n)',
        fix,
        content,
        flags=re.DOTALL
    )


def change2_targeted(content):
    """
    More targeted version: only apply 📌 to paragraphs that immediately
    follow an outcome-subtitle AND start with a known NESA command verb.
    """
    verb_pat = re.compile(
        r'^(?:\s*(?:<strong>|<strong><em>|<em><strong>)?)(?:' + VERBS + r')',
        re.IGNORECASE
    )

    # Split into lines for context-aware processing
    lines = content.split('\n')
    result = []
    i = 0
    while i < len(lines):
        line = lines[i]

        # Detect outcome-subtitle line
        if 'class="outcome-subtitle"' in line and '🎯' in line:
            result.append(line)
            i += 1
            # Collect following whitespace lines
            while i < len(lines) and lines[i].strip() == '':
                result.append(lines[i])
                i += 1
            # Now check if next non-blank line is a <p> with a command verb
            if i < len(lines):
                next_line = lines[i]
                # Check it's a <p> that starts with a verb
                stripped = next_line.strip()
                if stripped.startswith('<p>') and '📌' not in stripped:
                    # Get the content between <p> and </p>
                    p_content_m = re.match(r'^(\s*)<p>(.*)</p>\s*$', next_line, re.DOTALL)
                    if p_content_m and verb_pat.search(p_content_m.group(2)):
                        indent = p_content_m.group(1)
                        inner = p_content_m.group(2)
                        # Simplify nested em in command verb
                        inner = re.sub(r'<strong><em>([^<]+)</em></strong>', r'<strong>\1</strong>', inner)
                        inner = re.sub(r'<em><strong>([^<]+)</strong></em>', r'<strong>\1</strong>', inner)
                        result.append(f'{indent}<p>📌 <em>{inner}</em></p>')
                        i += 1
                        continue
            continue
        result.append(line)
        i += 1

    return '\n'.join(result)


def change3_remove_command_verb_headings(content):
    """Remove command verb prefix from h3 and h4 headings.

    <h3><em>Describe:</em> Title</h3> → <h3>Title</h3>
    <h4><em>Apply:</em> Title</h4>   → <h4>Title</h4>
    Also handles plain (non-em) verb prefixes.
    """
    # Pattern 1: <hN><em>Verb:</em> Title</hN>
    content = re.sub(
        r'<(h[34])><em>(?:' + VERBS + r')(?:\s+and\s+\w+)*:</em>\s*',
        r'<\1>',
        content
    )
    # Pattern 2: <hN>Verb: Title</hN>  (no em wrapping)
    content = re.sub(
        r'<(h[34])>(?:' + VERBS + r')(?:\s+and\s+\w+)*:\s+',
        r'<\1>',
        content
    )
    return content


def change4_example_emoji(content):
    """Add line break + 🌏 before explicit Example: labels.

    Handles two formats:
      A) Standalone <p>: <p><strong>Example:</strong> ...
      B) Inline <em>:   ... <em>Example: ...  (add <br>🌏 before the em)
    """
    # Format A: standalone paragraph
    content = re.sub(
        r'(<p>)(<strong>Example:</strong>)',
        r'\1🌏 \2',
        content
    )
    # Format A variant: <p><strong>Example</strong>: ...
    content = re.sub(
        r'(<p>)(<strong>Example</strong>:)',
        r'\1🌏 \2',
        content
    )

    # Format B: inline <em>Example: at end of sentence (preceded by text)
    # Add <br>🌏 before the opening <em> when em starts with "Example:"
    content = re.sub(
        r'(\s)<em>(Example:\s)',
        r'<br>🌏 <em>\2',
        content
    )
    # Also catch period/space before <em>Example
    content = re.sub(
        r'(\.)\s*<em>(Example:\s)',
        r'\1<br>🌏 <em>\2',
        content
    )

    return content


def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()

    content = original

    # Apply changes in order
    content = change1_outcome_subtitles(content)
    content = change2_targeted(content)
    content = change3_remove_command_verb_headings(content)
    content = change4_example_emoji(content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False


def main():
    for filename in FILES:
        filepath = os.path.join(BASE, filename)
        if not os.path.exists(filepath):
            print(f'⚠️  NOT FOUND: {filename}')
            continue
        changed = process_file(filepath)
        status = '✅ Updated' if changed else '⚪ No changes'
        print(f'{status}: {filename}')
    print('\nDone!')


if __name__ == '__main__':
    main()
