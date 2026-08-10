const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Remove imports
code = code.replace(/import ZonesStockage from "\.\/ZonesStockage";\n/, '');
code = code.replace(/import TracabiliteHACCP from "\.\/TracabiliteHACCP";\n/, '');
code = code.replace(/import ChambreNegative from "\.\/ChambreNegative";\n/, '');

// Remove render cases
code = code.replace(/case 'zones':\s*return <ZonesStockage \/>;\n/, '');
code = code.replace(/case 'haccp':\s*return <TracabiliteHACCP \/>;\n/, '');
code = code.replace(/case 'chambre_negative':\s*return <ChambreNegative \/>;\n/, '');

// Remove SubNavItems
code = code.replace(/<SubNavItem icon={<Package size={16} \/>} label="Zones & Économat".*\/>\n/, '');
code = code.replace(/<SubNavItem icon={<Package size={16} \/>} label="HACCP & Sous-Vide".*\/>\n/, '');
code = code.replace(/<SubNavItem icon={<ThermometerSnowflake size={16} \/>} label="Chambre Négative".*\/>\n/, '');

fs.writeFileSync('src/App.tsx', code);
