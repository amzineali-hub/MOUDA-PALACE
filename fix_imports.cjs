const fs = require('fs');
let code = fs.readFileSync('src/BlogWriterAI.tsx', 'utf8');

code = code.replace("import { Upload, createPortal } from 'react-dom';", "import { createPortal } from 'react-dom';");
code = code.replace("import { PenTool, ", "import { Upload, PenTool, ");

fs.writeFileSync('src/BlogWriterAI.tsx', code);
console.log("Fixed Upload import in BlogWriterAI");
