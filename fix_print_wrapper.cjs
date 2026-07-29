const fs = require('fs');
let code = fs.readFileSync('src/MenuGenerator.tsx', 'utf8');

const oldStructure = `          </div>
          {printTemplate === 'moderne' ? (`;

const newStructure = `          </div>
          <div id="printable-menu">
          {printTemplate === 'moderne' ? (`;

code = code.replace(oldStructure, newStructure);

const oldEnd = `          )}
        </div>
      </div>
    );
  }`;

const newEnd = `          )}
          </div>
        </div>
      </div>
    );
  }`;

code = code.replace(oldEnd, newEnd);
fs.writeFileSync('src/MenuGenerator.tsx', code);
console.log("Wrapped print view");
