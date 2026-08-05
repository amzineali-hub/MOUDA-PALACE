const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const tabsTarget = `['stocks', 'requirements', 'semi_finished', 'production', 'waste', 'transactions', 'suppliers', 'price_history']`;
const tabsReplacement = `['stocks', 'zones', 'requirements', 'semi_finished', 'production', 'waste', 'transactions', 'suppliers', 'price_history']`;
content = content.replace(tabsTarget, tabsReplacement);

const labelsTarget = `{tab === 'stocks' && 'État des Stocks'}`;
const labelsReplacement = `{tab === 'stocks' && 'État des Stocks'}
              {tab === 'zones' && 'Zones de Stockage'}`;
content = content.replace(labelsTarget, labelsReplacement);

const importTarget = `import MenuGenerator from "./MenuGenerator";`;
const importReplacement = `import MenuGenerator from "./MenuGenerator";\nimport ZonesStockage from "./ZonesStockage";`;
content = content.replace(importTarget, importReplacement);

// We need to render it inside Inventory component
const renderTarget = `{activeTab === 'stocks' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">`;

const renderReplacement = `{activeTab === 'zones' && (
          <ZonesStockage inventoryItems={stockItemsData} />
        )}
        {activeTab === 'stocks' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">`;

content = content.replace(renderTarget, renderReplacement);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched Inventory Tabs");
