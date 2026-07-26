const fs = require('fs');
const path = require('path');

const mapContent = fs.readFileSync('dist/server.cjs.map', 'utf-8');
const mapData = JSON.parse(mapContent);

if (mapData.sources && mapData.sourcesContent) {
  for (let i = 0; i < mapData.sources.length; i++) {
    const sourcePath = mapData.sources[i];
    const content = mapData.sourcesContent[i];
    
    if (content) {
      // Remove leading weird characters like ../ or webpack:///
      const cleanPath = sourcePath.replace(/^(\.\.\/)+/, '');
      if (cleanPath.startsWith('node_modules')) continue;
      
      const fullPath = path.resolve(__dirname, cleanPath);
      const dir = path.dirname(fullPath);
      
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(fullPath, content, 'utf-8');
      console.log(`Recovered ${cleanPath}`);
    }
  }
} else {
  console.log("No sourcesContent found in the source map.");
}
