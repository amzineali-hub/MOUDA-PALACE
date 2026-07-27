const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');

code = code.replace(
  "import { ToastProvider } from './context/ToastContext';",
  "import { ToastProvider } from './context/ToastContext';\nimport { ErrorBoundary } from './ErrorBoundary';"
);

code = code.replace(
  "<App />",
  "<ErrorBoundary><App /></ErrorBoundary>"
);

fs.writeFileSync('src/main.tsx', code);
