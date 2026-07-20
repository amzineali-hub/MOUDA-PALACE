const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// I will write the content back.
fs.writeFileSync('src/App.tsx', content);

// Let's run a quick jsx parser or just let babel tell us where the mismatch is.
// Actually, I can just write a quick script to find unclosed JSX tags in that function.
