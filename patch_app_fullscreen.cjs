const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Insert isFullScreenView variable
code = code.replace(
  "  const renderContent = () => {",
  "  const isFullScreenView = ['kds', 'finance', 'tables', 'device_simulator'].includes(activeTab);\n\n  const renderContent = () => {"
);

// 2. Change the main wrapper div
code = code.replace(
  '<div className="min-h-screen bg-[#FDFBF7] text-gray-900 font-sans flex flex-col md:flex-row relative">',
  '<div className={`min-h-screen bg-[#FDFBF7] text-gray-900 font-sans flex flex-col md:flex-row relative ${isFullScreenView ? "overflow-hidden" : ""}`}>'
);

// 3. Conditionally render Mobile Header
code = code.replace(
  '      {/* Mobile Header */}\n      <div className="print:hidden md:hidden flex items-center justify-between bg-[#1A1A1A] p-4 text-[#DDA956] z-40 sticky top-0">',
  '      {/* Mobile Header */}\n      {!isFullScreenView && (\n      <div className="print:hidden md:hidden flex items-center justify-between bg-[#1A1A1A] p-4 text-[#DDA956] z-40 sticky top-0">'
);
code = code.replace(
  '        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#E8E6E1] p-1">\n          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}\n        </button>\n      </div>\n      {/* Sidebar Navigation */}',
  '        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#E8E6E1] p-1">\n          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}\n        </button>\n      </div>\n      )}\n      {/* Sidebar Navigation */}'
);

// 4. Conditionally render Sidebar
code = code.replace(
  '      <aside className={`print:hidden ${isMobileMenuOpen ? \'flex\' : \'hidden\'} md:flex shrink-0 w-full md:w-64 bg-[#1A1A1A] text-[#E8E6E1] p-6 flex-col border-r border-[#333] fixed md:sticky top-16 md:top-0 h-[calc(100vh-4rem)] md:h-screen z-40 overflow-y-auto`}>',
  '      {!isFullScreenView && (\n      <aside className={`print:hidden ${isMobileMenuOpen ? \'flex\' : \'hidden\'} md:flex shrink-0 w-full md:w-64 bg-[#1A1A1A] text-[#E8E6E1] p-6 flex-col border-r border-[#333] fixed md:sticky top-16 md:top-0 h-[calc(100vh-4rem)] md:h-screen z-40 overflow-y-auto`}>'
);

// Find the end of aside to close it
code = code.replace(
  '        </div>\n      </aside>\n      {/* Main Content */}',
  '        </div>\n      </aside>\n      )}\n      {/* Main Content */}'
);

// 5. Update main tag
code = code.replace(
  '      <main className="flex-1 min-w-0 relative bg-[#FDFBF7] min-h-screen">',
  '      <main className={`flex-1 min-w-0 relative bg-[#FDFBF7] ${isFullScreenView ? "h-screen overflow-hidden" : "min-h-screen"}`}>'
);

// 6. Conditionally render ChatBot
code = code.replace(
  '      <ChatBot />\n    </div>',
  '      {!isFullScreenView && <ChatBot />}\n    </div>'
);

fs.writeFileSync('src/App.tsx', code);
