import glob, re

def update_dfd_nodes(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    new_content = content
    
    # Match NodeID["...Data Store..."] and convert to NodeID[("...Data Store...")]
    new_content = re.sub(r'([A-Za-z0-9_]+)\[("(?:[^"])*?Data Store(?:[^"])*?")\]', r'\1[(\2)]', new_content)

    if new_content != content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated DFD forms in {file_path}")

for file_path in glob.glob("topics/*.html"):
    update_dfd_nodes(file_path)
