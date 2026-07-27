const fs = require('fs');
let code = fs.readFileSync('src/DeviceSimulator.tsx', 'utf8');

code = code.replace(
  `// Navigate based on type`,
  `try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (e) {
        console.error('Fullscreen error', e);
      }

      // Navigate based on type`
);

code = code.replace(
  `onClick={() => setActiveTab('docs_devices')}`,
  `onClick={() => {
              setActiveTab('docs_devices');
              try {
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                }
              } catch (e) {
                console.error(e);
              }
            }}`
);

fs.writeFileSync('src/DeviceSimulator.tsx', code);
