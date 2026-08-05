const fs = require('fs');
let content = fs.readFileSync('src/Documentation.tsx', 'utf-8');

if (!content.includes('import rehypeRaw')) {
  content = content.replace("import ReactMarkdown from 'react-markdown';", "import ReactMarkdown from 'react-markdown';\nimport rehypeRaw from 'rehype-raw';");
}

if (!content.includes('rehypePlugins={[')) {
  content = content.replace('<ReactMarkdown', '<ReactMarkdown rehypePlugins={[rehypeRaw]}');
}

fs.writeFileSync('src/Documentation.tsx', content);
console.log('patched Documentation.tsx');
