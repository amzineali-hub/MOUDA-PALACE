const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

const target = `          progress: 0,
          createdAt: new Date(),
          source: 'POS'`;

const replacement = `          progress: 0,
          createdAt: new Date(),
          source: 'POS',
          priority: 'Haute'`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    console.log("Patched successfully.");
} else {
    console.log("Could not find target block.");
}

fs.writeFileSync('src/POSTactile.tsx', code);
