const fs = require('fs');
let code = fs.readFileSync('src/BlogWriterAI.tsx', 'utf8');

const regex = /\s*const handleImageUpload = \[\s\S\]*?reader\.readAsDataURL\(file\);\s*\};\n/;
// Actually regex in string is hard, let's just use string replace.

const startStr = "  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {";
const endStr = "  return () => unsubscribe();";

const parts = code.split(startStr);
if (parts.length === 2) {
    const subParts = parts[1].split(endStr);
    const handleUploadBody = startStr + subParts[0];
    
    code = parts[0] + endStr + subParts[1];
    
    // now we need to insert handleUploadBody outside
    code = code.replace("  const handleGenerate = async () => {", handleUploadBody + "\n  const handleGenerate = async () => {");
    fs.writeFileSync('src/BlogWriterAI.tsx', code);
    console.log("Fixed scope!");
} else {
    console.log("Could not find startStr");
}
