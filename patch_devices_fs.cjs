const fs = require('fs');
let code = fs.readFileSync('src/DeviceManagement.tsx', 'utf8');

code = code.replace(
  `onClick={() => setActiveTab && setActiveTab('device_simulator')}`,
  `onClick={() => {
              if (setActiveTab) setActiveTab('device_simulator');
              try {
                if (document.documentElement.requestFullscreen) {
                  document.documentElement.requestFullscreen();
                }
              } catch (e) {
                console.error('Fullscreen error', e);
              }
            }}`
);

fs.writeFileSync('src/DeviceManagement.tsx', code);
