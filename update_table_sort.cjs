const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

const search = `                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">N° Commande</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Fournisseur</th>
                  <th className="px-6 py-4 font-medium">Articles</th>
                  <th className="px-6 py-4 font-medium text-right">Montant</th>
                  <th className="px-6 py-4 font-medium text-center">Statut</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredCommandes.map((cmd) => (
                  <tr key={cmd.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-[#1A1A1A] flex items-center gap-2">
                      <FileText size={16} className="text-gray-400" />
                      {cmd.orderNumber || (cmd.id.startsWith("CMD-") ? cmd.id : "CMD-" + cmd.id.slice(0,4).toUpperCase())}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{cmd.date}</td>
                    <td className="px-6 py-4 text-[#1A1A1A] font-medium">{cmd.fournisseur}</td>
                    <td className="px-6 py-4 text-gray-600">{Array.isArray(cmd.items) ? cmd.items.length : (typeof cmd.items === 'number' ? cmd.items : (typeof cmd.articles === 'string' ? cmd.articles.split(',').length : 0))} articles</td>
                    <td className="px-6 py-4 text-right font-medium">{cmd.montant}</td>`;

const replace = `                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">N° Commande</th>
                  <th className="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => requestSort('date')}>
                    <div className="flex items-center gap-1">Date <ArrowUpDown size={14} className={sortConfig?.key === 'date' ? 'text-[#F4C75B]' : 'text-gray-400'} /></div>
                  </th>
                  <th className="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => requestSort('fournisseur')}>
                    <div className="flex items-center gap-1">Fournisseur <ArrowUpDown size={14} className={sortConfig?.key === 'fournisseur' ? 'text-[#F4C75B]' : 'text-gray-400'} /></div>
                  </th>
                  <th className="px-6 py-4 font-medium">Articles</th>
                  <th className="px-6 py-4 font-medium text-right cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => requestSort('montantHT')}>
                    <div className="flex items-center justify-end gap-1">Montant HT <ArrowUpDown size={14} className={sortConfig?.key === 'montantHT' ? 'text-[#F4C75B]' : 'text-gray-400'} /></div>
                  </th>
                  <th className="px-6 py-4 font-medium text-right cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => requestSort('tva')}>
                    <div className="flex items-center justify-end gap-1">TVA <ArrowUpDown size={14} className={sortConfig?.key === 'tva' ? 'text-[#F4C75B]' : 'text-gray-400'} /></div>
                  </th>
                  <th className="px-6 py-4 font-medium text-right cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => requestSort('montant')}>
                    <div className="flex items-center justify-end gap-1">Total TTC <ArrowUpDown size={14} className={sortConfig?.key === 'montant' ? 'text-[#F4C75B]' : 'text-gray-400'} /></div>
                  </th>
                  <th className="px-6 py-4 font-medium text-center">Statut</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {sortedCommandes.map((cmd) => (
                  <tr key={cmd.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-[#1A1A1A] flex items-center gap-2">
                      <FileText size={16} className="text-gray-400" />
                      {cmd.orderNumber || (cmd.id.startsWith("CMD-") ? cmd.id : "CMD-" + cmd.id.slice(0,4).toUpperCase())}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{cmd.date}</td>
                    <td className="px-6 py-4 text-[#1A1A1A] font-medium">{cmd.fournisseur}</td>
                    <td className="px-6 py-4 text-gray-600">{Array.isArray(cmd.items) ? cmd.items.length : (typeof cmd.items === 'number' ? cmd.items : (typeof cmd.articles === 'string' ? cmd.articles.split(',').length : 0))} articles</td>
                    <td className="px-6 py-4 text-right font-medium">{cmd.montantHT != null ? \`\${Number(cmd.montantHT).toFixed(2)} MAD\` : '-'}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-500">{cmd.tva != null ? \`\${cmd.tva}%\` : '-'}</td>
                    <td className="px-6 py-4 text-right font-medium text-[#1A1A1A]">{cmd.montant}</td>`;

code = code.replace(search, replace);
fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
