const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  "import SeoAnalyticsContainer from './SeoAnalyticsContainer';",
  "import SeoAnalyticsContainer from './SeoAnalyticsContainer';\nimport MenuGenerator from './MenuGenerator';"
);

content = content.replace(
  "case 'menu':\n        return <DigitalMenu />;",
  "case 'menu':\n        return <MenuGenerator />;"
);

fs.writeFileSync('src/App.tsx', content);
