with open('src/BlogWriterAI.tsx', 'r') as f:
    content = f.read()

bad_lines = """          .replace(/

/gim, '<br><br>')
          .replace(/
/gim, '<br>');"""

good_lines = r"""          .replace(/\n\n/gim, '<br><br>')
          .replace(/\n/gim, '<br>');"""

content = content.replace(bad_lines, good_lines)

with open('src/BlogWriterAI.tsx', 'w') as f:
    f.write(content)
