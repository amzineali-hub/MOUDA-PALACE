import re

with open('src/BlogWriterAI.tsx', 'r') as f:
    content = f.read()

# Replace Markdown content logic in publish for WordPress
old_content = """        const wpResponse = await fetch(`${cleanUrl}/wp-json/wp/v2/posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Basic " + btoa(`${websiteConfig.username}:${websiteConfig.password}`)
          },
          body: JSON.stringify({
            title: article.topic,
            content: article.content, // Ideally converted to HTML, but this is a start
            status: 'publish'
          })
        });"""

new_content = """        
        // Simple Markdown to HTML formatting for WordPress
        let htmlContent = article.content
          .replace(/^### (.*$)/gim, '<h3>$1</h3>')
          .replace(/^## (.*$)/gim, '<h2>$1</h2>')
          .replace(/^# (.*$)/gim, '<h1>$1</h1>')
          .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/gim, '<em>$1</em>')
          .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
          .replace(/\n\n/gim, '<br><br>')
          .replace(/\n/gim, '<br>');

        const wpResponse = await fetch(`${cleanUrl}/wp-json/wp/v2/posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Basic " + btoa(`${websiteConfig.username}:${websiteConfig.password}`)
          },
          body: JSON.stringify({
            title: article.topic,
            content: htmlContent, 
            status: 'publish'
          })
        });"""

content = content.replace(old_content, new_content)

with open('src/BlogWriterAI.tsx', 'w') as f:
    f.write(content)

