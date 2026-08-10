const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace('<DeviceSimulator />', '<DeviceSimulator setActiveTab={setActiveTab} />');
fs.writeFileSync('src/App.tsx', appCode);
