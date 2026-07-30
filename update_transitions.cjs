const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `{renderContent()}`;
const replacement = `<AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={isFullScreenView ? "h-full" : "min-h-full"}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
