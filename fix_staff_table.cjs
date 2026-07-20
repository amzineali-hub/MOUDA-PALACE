const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetHeader = `                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4">Service Actuel</th>
                  <th className="px-6 py-4">Actions</th>`;

const replaceHeader = `                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4">Service Actuel</th>
                  <th className="px-6 py-4">Salaire de Base</th>
                  <th className="px-6 py-4">Actions</th>`;

content = content.replace(targetHeader, replaceHeader);

const targetRow = `                      <td className="px-6 py-4 text-gray-600">
                        {staff.shift}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">`;

const replaceRow = `                      <td className="px-6 py-4 text-gray-600">
                        {staff.shift}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {staff.baseSalary ? \`\${staff.baseSalary} MAD\` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">`;

content = content.replace(targetRow, replaceRow);
fs.writeFileSync('src/App.tsx', content);
