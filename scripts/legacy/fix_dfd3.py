import glob, re

def update_dfd_nodes(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    new_content = content
    
    # Process "Process" string into Circle (()), instead of ["..."] or ("...")
    new_content = re.sub(r'([A-Za-z0-9_]+)(?:\[|\()(?:")((?:[^"])*?Process(?:[^"])*?)(?:")(?:\]|\))', r'\1(("\2"))', new_content)

    # Process "Data Store" string into Open Rectangle/Database [("...")], instead of ["..."]
    new_content = re.sub(r'([A-Za-z0-9_]+)\[(?:")((?:[^"])*?Data Store(?:[^"])*?)(?:")\]', r'\1[("\2")]', new_content)

    if new_content != content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated DFD forms in {file_path}")

for file_path in glob.glob("topics/*.html"):
    update_dfd_nodes(file_path)
