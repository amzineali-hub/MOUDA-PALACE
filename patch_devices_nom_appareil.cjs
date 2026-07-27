const fs = require('fs');
let code = fs.readFileSync('src/DeviceManagement.tsx', 'utf8');

code = code.replace(
  /name: newDeviceName,/g,
  "nom_appareil: newDeviceName,"
);

code = code.replace(
  /name: editDeviceName,/g,
  "nom_appareil: editDeviceName,"
);

code = code.replace(
  /setEditDeviceName\(device\.name \|\| ''\);/g,
  "setEditDeviceName(device.nom_appareil || device.name || '');"
);

code = code.replace(
  /\{device\.name\}/g,
  "{device.nom_appareil || device.name}"
);

fs.writeFileSync('src/DeviceManagement.tsx', code);
