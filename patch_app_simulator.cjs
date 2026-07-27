const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("import DeviceSimulator")) {
  code = code.replace(
    "import DeviceManagement from \"./DeviceManagement\";",
    "import DeviceManagement from \"./DeviceManagement\";\nimport DeviceSimulator from \"./DeviceSimulator\";"
  );
}

if (!code.includes("case 'device_simulator':")) {
  code = code.replace(
    "case 'docs_devices':",
    "case 'device_simulator':\n        return <DeviceSimulator setActiveTab={setActiveTab} />;\n      case 'docs_devices':"
  );
}

fs.writeFileSync('src/App.tsx', code);
