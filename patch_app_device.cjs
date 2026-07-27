const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "return <DeviceManagement />;",
  "return <DeviceManagement setActiveTab={setActiveTab} />;"
);

fs.writeFileSync('src/App.tsx', code);
