const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "return <DeviceSimulator setActiveTab={setActiveTab} />;",
  "return <DeviceSimulator setActiveTab={handleTabChange} />;"
);

code = code.replace(
  "return <DeviceManagement setActiveTab={setActiveTab} />;",
  "return <DeviceManagement setActiveTab={handleTabChange} />;"
);

code = code.replace(
  "return <GestionTables setActiveTab={setActiveTab} />;",
  "return <GestionTables setActiveTab={handleTabChange} />;"
);

code = code.replace(
  "return <Overview setActiveTab={setActiveTab} />;",
  "return <Overview setActiveTab={handleTabChange} />;"
);

fs.writeFileSync('src/App.tsx', code);
