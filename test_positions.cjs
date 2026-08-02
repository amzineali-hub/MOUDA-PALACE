const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Also make sure spacing isn't generating identical positions for some reason.
