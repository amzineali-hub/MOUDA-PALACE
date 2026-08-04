const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `      } catch(e: any) {
                    console.error('Error saving semi-finished:', e);
                    showToast('Erreur: ' + e.message);}
    }`;

const replacement = `      } catch(e: any) {
        console.error('Error loading autosave:', e);
      }
    }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log('Fixed autosave');
