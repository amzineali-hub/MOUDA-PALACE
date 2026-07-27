const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

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

fs.writeFileSync('src/App.tsx', code);
