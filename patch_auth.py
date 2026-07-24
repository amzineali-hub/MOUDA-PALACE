import re

with open('src/BlogWriterAI.tsx', 'r') as f:
    content = f.read()

# Replace the auth line to strip spaces from password
old_auth = """          headers: {
            "Content-Type": "application/json",
            "Authorization": "Basic " + btoa(`${websiteConfig.username}:${websiteConfig.password}`)
          },"""

new_auth = """          headers: {
            "Content-Type": "application/json",
            "Authorization": "Basic " + btoa(`${websiteConfig.username}:${websiteConfig.password.replace(/\\s+/g, '')}`)
          },"""

content = content.replace(old_auth, new_auth)

with open('src/BlogWriterAI.tsx', 'w') as f:
    f.write(content)
