const fs = require('fs');
let code = fs.readFileSync('src/SystemMonitoring.tsx', 'utf8');

code = code.replace(
  '<div className="relative w-full max-w-[500px] mx-auto h-[360px] flex items-center justify-center [transform:scale(0.6)] sm:[transform:scale(0.8)] md:[transform:scale(1)] origin-top mb-[-120px] sm:mb-[-60px] md:mb-0">',
  '<div className="w-full flex justify-center overflow-hidden"><div className="relative w-[500px] h-[360px] flex-shrink-0 [transform:scale(0.65)] sm:[transform:scale(0.8)] md:[transform:scale(1)] origin-center -my-16 sm:-my-8 md:my-0">'
);

code = code.replace(
  '          </div>\n        </div>\n      </div>\n    </div>\n  );\n}',
  '          </div>\n        </div>\n      </div>\n      </div>\n    </div>\n  );\n}'
);

fs.writeFileSync('src/SystemMonitoring.tsx', code);
