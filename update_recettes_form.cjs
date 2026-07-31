const fs = require('fs');
let code = fs.readFileSync('src/Recettes.tsx', 'utf8');

// Update Portion
let portionRegex = /<input value=\{portion\} onChange=\{e => setPortion\(e\.target\.value\)\} required type="text" placeholder="Ex: 4 personnes" className="w-full border border-gray-200 rounded-lg p-2\.5 outline-none focus:border-\[\#DDA956\]" \/>/g;

let portionReplacement = `<select
                    value={portion}
                    onChange={e => setPortion(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white outline-none focus:border-[#DDA956]"
                  >
                    <option value="">Sélectionner une portion</option>
                    <option value="1 personne">1 personne</option>
                    <option value="2 personnes">2 personnes</option>
                    <option value="3 personnes">3 personnes</option>
                    <option value="4 personnes">4 personnes</option>
                    <option value="6 personnes">6 personnes</option>
                    <option value="8 personnes">8 personnes</option>
                    <option value="10 personnes">10 personnes</option>
                    <option value="12 pièces">12 pièces</option>
                  </select>`;
code = code.replace(portionRegex, portionReplacement);

// Update Temps
let tempsRegex = /<input value=\{temps\} onChange=\{e => setTemps\(e\.target\.value\)\} required type="text" placeholder="Ex: 1h" className="w-full border border-gray-200 rounded-lg p-2\.5 outline-none focus:border-\[\#DDA956\]" \/>/g;

let tempsReplacement = `<select
                    value={temps}
                    onChange={e => setTemps(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white outline-none focus:border-[#DDA956]"
                  >
                    <option value="">Sélectionner un temps</option>
                    <option value="5 min">5 min</option>
                    <option value="10 min">10 min</option>
                    <option value="15 min">15 min</option>
                    <option value="20 min">20 min</option>
                    <option value="30 min">30 min</option>
                    <option value="40 min">40 min</option>
                    <option value="45 min">45 min</option>
                    <option value="1h">1h</option>
                    <option value="1h 30">1h 30</option>
                    <option value="2h">2h</option>
                    <option value="3h">3h</option>
                    <option value="+3h">+3h</option>
                  </select>`;

code = code.replace(tempsRegex, tempsReplacement);

// Just in case Catégorie wasn't fully fixed, though we did fix it earlier
// But looking at App.tsx, I should probably also fix App.tsx's Nouvelle Fiche Technique form to use select fields as well to be comprehensive.

fs.writeFileSync('src/Recettes.tsx', code);
console.log("Updated Recettes.tsx");
