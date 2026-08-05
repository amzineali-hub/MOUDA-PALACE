const fs = require('fs');
const content = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf-8');

const targetStr = `<td className="px-6 py-4 text-gray-600">{cmd.items} articles</td>`;
const replacementStr = `<td className="px-6 py-4 text-gray-600">{Array.isArray(cmd.items) ? cmd.items.length : (typeof cmd.items === 'number' ? cmd.items : (typeof cmd.articles === 'string' ? cmd.articles.split(',').length : 0))} articles</td>`;

if (content.includes(targetStr)) {
  fs.writeFileSync('src/AchatsFournisseurs.tsx', content.replace(targetStr, replacementStr));
  console.log('Fixed cmd.items rendering');
} else {
  console.log('Target string not found');
}
