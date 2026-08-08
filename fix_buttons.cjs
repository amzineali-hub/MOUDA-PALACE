const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const badCode = `                  onClick={() => {
                    setAdvancedAlertFilter(!advancedAlertFilter);
                    if (!advancedAlertFilter) setStockAlertFilter(false);
            setAdvancedAlertFilter(false);
                  }}`;

const goodCode = `                  onClick={() => {
                    setAdvancedAlertFilter(!advancedAlertFilter);
                    if (!advancedAlertFilter) {
                       setStockAlertFilter(false);
                    }
                  }}`;
code = code.replace(badCode, goodCode);
fs.writeFileSync('src/App.tsx', code);
