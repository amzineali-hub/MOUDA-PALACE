const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

code = code.replace(
`                  </div>
                )}
              </div>
                )}
              </div>`,
`                  </div>
                )}
              </div>`
);

fs.writeFileSync('src/POSTactile.tsx', code);
