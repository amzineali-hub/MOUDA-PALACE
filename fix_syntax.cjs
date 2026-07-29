const fs = require('fs');
let code = fs.readFileSync('src/MenuGenerator.tsx', 'utf8');

code = code.replace(
  /          \}\)\n          <\/div>\n        <\/div>\n      <\/div>\n      \{\/\* Print Modal \*\/\}[\s\S]*?      \)\}\n    <\/div>\n  \};\n\}/g,
  ""
); // wait, my regex might fail. Let's just do precise replacement.
