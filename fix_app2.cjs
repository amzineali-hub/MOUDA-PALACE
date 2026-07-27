const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '        </div>\n      </aside>\n      {/* Main Content */}',
  '        </div>\n      </aside>\n      )}\n      {/* Main Content */}'
);

code = code.replace(
  '{!isFullScreenMode && <ChatBot />}',
  '{!isFullScreenView && <ChatBot />}'
);

code = code.replace(
  '{isFullScreenMode && activeTab !== \'device_simulator\' && (',
  '{isFullScreenView && activeTab !== \'device_simulator\' && ('
);

fs.writeFileSync('src/App.tsx', code);
