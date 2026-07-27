const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldHandle = `  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };`;

const newHandle = `  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    
    // Request full screen for device modes
    if (['kds', 'finance', 'tables', 'device_simulator'].includes(tab)) {
      try {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => {
            console.warn("Fullscreen request failed:", err);
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
  };`;

code = code.replace(oldHandle, newHandle);
fs.writeFileSync('src/App.tsx', code);
