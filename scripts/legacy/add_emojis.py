import re
import glob

KEYWORD_MAP = {
    'security': '🛡️', 'secure': '🔐', 'auth': '🔑', 'encrypt': '🔒', 'attack': '⚔️', 'threat': '⚠️',
    'web': '🌐', 'network': '📶', 'cloud': '☁️', 'api': '🔗', 'database': '🗄️', 'sql': '🐬',
    'data': '📊', 'object': '🧩', 'class': '📦', 'attribute': '🏷️', 'method': '⚙️',
    'test': '🧪', 'debug': '🐛', 'error': '❌', 'bug': '🐞', 'log': '📝',
    'auto': '🤖', 'robot': '🤖', 'mech': '🦾', 'hardware': '🖲️', 'sensor': '🌡️',
    'algo': '🧠', 'sort': '🔢', 'search': '🔍', 'logic': '🚦', 'control': '🕹️',
    'function': '⚙️', 'variable': '🗂️', 'type': '🏷️', 'code': '💻', 'program': '⌨️',
    'project': '📋', 'manage': '📅', 'agile': '🏃', 'scrum': '🏉', 'flow': '🌊',
    'design': '🎨', 'arch': '🏛️', 'model': '🏗️', 'system': '⚙️', 'concept': '💡',
    'review': '👁️', 'audit': '🧾', 'law': '⚖️', 'ethic': '🤝', 'guide': '📖',
    'problem': '🤔', 'solution': '💡', 'privacy': '🕵️', 'requirement': '🎯',
    'hardware': '🔌', 'operator': '➕', 'string': '🔤', 'array': '📚', 'list': '📜',
    'devops': '♾️', 'internet': '🌐', 'architecture': '🏛️', 'client': '💻', 'server': '🖥️',
    'vulnerability': '⚠️', 'password': '🔑', 'encryption': '🔒', 'signature': '✍️',
    'firewall': '🧱', 'policy': '📜', 'legislation': '⚖️',
    'waterfall': '🌊', 'kanban': '📋', 'story': '📖'
}
EMOJIS = ["📘", "🚀", "💡", "⚙️", "🔧", "🔍", "📊", "📋", "💻", "🛡️", "🌐", "📈", "🔐", "🧱", "🧠", "🎯", "🚦", "🗂️", "➕", "📝", "🧩", "📦", "📚", "🤖", "⚡", "🔄"]

def get_emoji(text):
    text_lower = text.lower()
    for k, v in KEYWORD_MAP.items():
        if k in text_lower:
            return v
    idx = sum(ord(c) for c in text.strip()) % len(EMOJIS)
    return EMOJIS[idx]

def extract_clean_text(html_fragment):
    return re.sub(r'<[^>]+>', '', html_fragment).strip()
    
# check if it already starts with an emoji or weird symbol:
def starts_with_emoji(clean_text):
    if not clean_text: return True
    first_char = clean_text[0]
    # rough check! If it's alphanumeric, it's not an emoji.
    if first_char.isalnum(): return False
    # allow some typical starting chars like digits if numbered list? But we want emojis before numbers.
    return not first_char.isascii()

files = glob.glob('/Users/david/Downloads/HSC_SoftwareEngineering-claude-hsc-notes-website-URqvH/**/*.html', recursive=True)
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Process TOC items
    # e.g. <li><a href="#some-id">1. Some Topic</a></li>
    def toc_repl(match):
        full_tag = match.group(0)
        open_a = match.group(1)   # e.g. <li><a href="#id">
        inner_text = match.group(2) # e.g. 1. Some Topic
        close_a = match.group(3)  # e.g. </a></li>
        
        clean = extract_clean_text(inner_text)
        if not starts_with_emoji(clean):
            e = get_emoji(clean)
            return f"{open_a}{e} {inner_text}{close_a}"
        return full_tag
        
    # We want to catch <ul class="toc-list"> items
    # A simple regex for any li > a where href starts with #
    content = re.sub(r'(<li><a href=\"#[^\"]+\">)(.*?)(</a></li>)', toc_repl, content)

    # Process headings: <h2>, <h3>, <h4>
    def hd_repl(match):
        open_tag = match.group(1)
        inner_text = match.group(2)
        close_tag = match.group(3)
        
        clean_text = extract_clean_text(inner_text)
        # Skip if it's explicitly styled or hidden, or already starts with an emoji
        if not clean_text: return match.group(0)
        
        # We might have spans inside like <span class="badge">
        if not starts_with_emoji(clean_text):
            e = get_emoji(clean_text)
            return f"{open_tag}{e} {inner_text}{close_tag}"
        return match.group(0)
        
    content = re.sub(r'(<h[234][^>]*>)(.*?)(</h[234]>)', hd_repl, content, flags=re.IGNORECASE)

    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
print("Updated all HTML files.")
