const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
content = content.replace(
  "import Accounting from './Accounting';",
  "import Accounting from './Accounting';\nimport BlogWriterAI from './BlogWriterAI';"
);

// Add to NavItems
const navItemWhatsApp = `<NavItem icon={<MessageCircle size={18} />} label="WhatsApp & IA" active={activeTab === 'whatsapp'} onClick={() => handleTabChange('whatsapp')} />`;
const navItemBlog = `<NavItem icon={<PenTool size={18} />} label="Rédaction Blog IA" active={activeTab === 'blog'} onClick={() => handleTabChange('blog')} />`;
content = content.replace(navItemWhatsApp, navItemWhatsApp + '\n          ' + navItemBlog);

// Add to switch cases
const switchCaseWhatsApp = `      case 'whatsapp':
        return <WhatsAppAI />;`;
const switchCaseBlog = `      case 'blog':
        return <BlogWriterAI />;`;
content = content.replace(switchCaseWhatsApp, switchCaseWhatsApp + '\n' + switchCaseBlog);

fs.writeFileSync('src/App.tsx', content);
