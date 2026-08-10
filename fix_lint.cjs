const fs = require('fs');

// Fix App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace('const { user, login } = useAuth();', 'const { user } = useAuth();');
appCode = appCode.replace('<DeviceManagement />', '<DeviceManagement setActiveTab={setActiveTab} />');
fs.writeFileSync('src/App.tsx', appCode);

// Fix server.ts
let serverCode = fs.readFileSync('server.ts', 'utf8');
serverCode = serverCode.replace('fetch(req.query', 'fetch((req.query as any)');
fs.writeFileSync('server.ts', serverCode);
