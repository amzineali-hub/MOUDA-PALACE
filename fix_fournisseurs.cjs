const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<p className="text-sm text-gray-500 font-medium">Fournisseurs Actifs<\/p>\s*<h4 className="text-2xl font-bold text-gray-900 mt-1">7<\/h4>/;
const replacement = `<p className="text-sm text-gray-500 font-medium">Fournisseurs Actifs</p>
            <h4 className="text-2xl font-bold text-gray-900 mt-1">{fournisseurs.length}</h4>`;

if (!regex.test(code)) {
    console.error("Match not found");
} else {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Replaced successfully!");
}
