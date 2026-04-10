import re
import glob

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '<div class="mermaid">' not in content:
        return
        
    lines = content.split('\n')
    in_mermaid = False
    new_lines = []
    changes_made = False
    
    for line in lines:
        if '<div class="mermaid">' in line:
            in_mermaid = True
            new_lines.append(line)
            continue
        elif in_mermaid and '</div>' in line:
            in_mermaid = False
            new_lines.append(line)
            continue
            
        new_line = line
        
        if in_mermaid:
            # 1. Fix Decision Diamond: Hexagon {{...}} to Diamond {...}
            new_line = re.sub(r'\{\{(".*?")\}\}', r'{\1}', new_line)
            
            # 2. Fix Parallelogram for I/O
            # Find any node definition: NodeID["text"]
            # We want to change to NodeID[/"text"/] if text implies I/O
            def io_replacer(match):
                prefix = match.group(1) # Node ID
                inner_text = match.group(2) # "..."
                
                # Check for I/O keywords
                io_keywords = ['INPUT', 'OUTPUT', 'Display', 'Return ', 'Read ', 'Print ']
                is_io = any(kw in inner_text or kw.lower() in inner_text.lower() for kw in io_keywords)
                # But do NOT convert if it's already a correct shape or if it has SET
                if is_io and 'SET' not in inner_text:
                    return f'{prefix}[/{inner_text}/]'
                return match.group(0)
            
            # Match standard rectangle ID["text"]
            new_line = re.sub(r'([A-Za-z0-9_]+)\[(".*?")\]', io_replacer, new_line)
            
        if new_line != line:
            changes_made = True
            
        new_lines.append(new_line)
        
    if changes_made:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_lines))
        print(f"Updated {filepath}")

for fp in glob.glob("topics/*.html"):
    process_file(fp)

