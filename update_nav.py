import glob, re

def update_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    new_content = content
    is_index = filepath == "index.html"
    prefix = "topics/" if is_index else ""

    # Add to desktop nav
    # Find block containing Course Tools and SDLC Guide
    desktop_pattern = r'(<a href="{}sdlc\.html"[^>]*>.*?</a\s*>)\s*(</div>|</li>|<a href="{}glossary\.html")'.format(prefix, prefix)
    
    def repl_desktop(match):
        if "glossary.html" in match.group(2):
            return match.group(0) # Already added
        return f'{match.group(1)}\n            <a href="{prefix}glossary.html" role="menuitem">📖 Glossary</a>\n          {match.group(2)}'
    
    new_content = re.sub(desktop_pattern, repl_desktop, new_content)

    # Add to mobile nav
    mobile_pattern = r'(<a href="{}sdlc\.html".*?</a\s*>)\s*(</div>|<a href="{}glossary\.html")'.format(prefix, prefix)
    
    def repl_mobile(match):
        if "glossary.html" in match.group(2):
            return match.group(0) # Already added
        return f'{match.group(1)}\n      <a href="{prefix}glossary.html">📖 Glossary</a>\n    {match.group(2)}'
    
    new_content = re.sub(mobile_pattern, repl_mobile, new_content)

    if new_content != content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for filepath in glob.glob("topics/*.html") + ["index.html"]:
    if filepath != "topics/glossary.html": # Already built with it
        update_file(filepath)

