const fs = require('fs');

const files = ['src/App.tsx', 'src/Accounting.tsx'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(/<button([^>]*?)>/g, (match, p1) => {
    // If it's a submit button or already has onClick, skip
    if (p1.includes('type="submit"') || p1.includes('onClick')) {
      return match;
    }
    // Check if it's the specific layoutId motion.div button etc? No, those are button components.
    // Ensure we don't mess up if it's broken over lines? The regex might not catch multiline <button >
    // Let's do a basic replace for the common single-line button tag.
    return `<button onClick={() => showToast && showToast('Action en cours de développement...')} ${p1}>`;
  });
  
  fs.writeFileSync(file, newContent);
});

console.log("Updated buttons.");
