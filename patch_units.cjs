const fs = require('fs');

const UNITS = `<option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="cl">cl</option>
                    <option value="ml">ml</option>
                    <option value="pièce">pièce</option>
                    <option value="portion">portion</option>
                    <option value="bouteille">bouteille</option>
                    <option value="boîte">boîte</option>
                    <option value="carton">carton</option>
                    <option value="botte">botte</option>
                    <option value="sachet">sachet</option>`;

function patchFile(file) {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/<option value="kg">kg<\/option>\s*<option value="L">L<\/option>\s*<option value="portion">portion<\/option>\s*<option value="pièce">pièce<\/option>/g, UNITS);
  fs.writeFileSync(file, content);
}

patchFile('src/App.tsx');
console.log("Patched units");
