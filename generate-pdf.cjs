const fs = require('fs');
const PDFDocument = require('pdfkit');
const MarkdownIt = require('markdown-it');

const md = new MarkdownIt();
const text = fs.readFileSync('DOCUMENTATION.md', 'utf8');
const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('public/DOCUMENTATION.pdf'));

const lines = text.split('\n');
doc.font('Helvetica');

for (const line of lines) {
  if (line.startsWith('# ')) {
    doc.fontSize(24).text(line.replace('# ', ''), { underline: true }).moveDown(0.5);
  } else if (line.startsWith('## ')) {
    doc.fontSize(18).text(line.replace('## ', '')).moveDown(0.5);
  } else if (line.startsWith('### ')) {
    doc.fontSize(14).text(line.replace('### ', '')).moveDown(0.5);
  } else if (line.startsWith('- **')) {
    doc.fontSize(12).text(line, { indent: 20 }).moveDown(0.2);
  } else if (line.trim() !== '') {
    doc.fontSize(12).text(line).moveDown(0.2);
  }
}

doc.end();
console.log('PDF generated at public/DOCUMENTATION.pdf');
