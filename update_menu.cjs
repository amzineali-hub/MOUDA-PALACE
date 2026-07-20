const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetState = `  const [menuItems, setMenuItems] = useState([
    { id: 1, category: 'Entrées', name: 'Briouates au Fromage', price: '85 MAD', desc: 'Feuilletés croustillants farcis au fromage de chèvre et herbes fraîches.', active: true, translated: true, translations: { en: { name: 'Cheese Briouates', desc: 'Crispy pastries stuffed with goat cheese and fresh herbs.' }, es: { name: 'Briouates de Queso', desc: 'Pasteles crujientes rellenos de queso de cabra y hierbas frescas.' }, ar: { name: 'بريوات بالجبن', desc: 'معجنات مقرمشة محشوة بجبن الماعز والأعشاب الطازجة.' } } },
    { id: 2, category: 'Entrées', name: 'Salade Zaalouk', price: '75 MAD', desc: 'Caviar d\\'aubergines grillées à la tomate, ail et épices.', active: true, translated: true, translations: { en: { name: 'Zaalouk Salad', desc: 'Grilled eggplant caviar with tomato, garlic, and spices.' }, es: { name: 'Ensalada Zaalouk', desc: 'Caviar de berenjenas asadas con tomate, ajo y especias.' }, ar: { name: 'سلطة زعلوك', desc: 'كافيار الباذنجان المشوي مع الطماطم والثوم والتوابل.' } } },
    { id: 3, category: 'Plats Principaux', name: 'Tagine d\\'Agneau aux Pruneaux', price: '220 MAD', desc: 'Agneau mijoté aux épices douces, pruneaux caramélisés et amandes.', active: true, translated: true, translations: { en: { name: 'Lamb Tagine with Prunes', desc: 'Lamb simmered with sweet spices, caramelized prunes, and almonds.' }, es: { name: 'Tajín de Cordero con Ciruelas', desc: 'Cordero a fuego lento con especias dulces, ciruelas caramelizadas y almendras.' }, ar: { name: 'طاجين اللحم بالبرقوق', desc: 'لحم ضأن مطبوخ ببطء مع توابل حلوة، برقوق مكرمل ولوز.' } } },
    { id: 4, category: 'Plats Principaux', name: 'Pastilla au Pigeon', price: '240 MAD', desc: 'Tourte sucrée-salée aux amandes, cannelle et fleur d\\'oranger.', active: false, translated: false },
    { id: 5, category: 'Desserts', name: 'Orange à la Cannelle', price: '50 MAD', desc: 'Tranches d\\'orange fraîche, cannelle moulue et sirop de fleur d\\'oranger.', active: true, translated: true, translations: { en: { name: 'Cinnamon Orange', desc: 'Fresh orange slices, ground cinnamon, and orange blossom syrup.' }, es: { name: 'Naranja a la Canela', desc: 'Rodajas de naranja fresca, canela molida y sirope de azahar.' }, ar: { name: 'برتقال بالقرفة', desc: 'شرائح برتقال طازجة، قرفة مطحونة وشراب زهر البرتقال.' } } },
    { id: 6, category: 'Boissons', name: 'Thé à la Menthe Royal', price: '40 MAD', desc: 'Thé vert traditionnel infusé à la menthe fraîche et pignons de pin.', active: true, translated: true, translations: { en: { name: 'Royal Mint Tea', desc: 'Traditional green tea infused with fresh mint and pine nuts.' }, es: { name: 'Té de Menta Real', desc: 'Té verde tradicional infundido con menta fresca y piñones.' }, ar: { name: 'شاي ملكي بالنعناع', desc: 'شاي أخضر تقليدي منقوع بالنعناع الطازج وحبوب الصنوبر.' } } }
  ]);`;

const replacementState = `  const [menuItems, setMenuItems] = useState([
    { id: 1, category: 'Entrées', name: 'Briouates au Fromage', price: '85 MAD', desc: 'Feuilletés croustillants farcis au fromage de chèvre et herbes fraîches.', active: true, translated: false },
    { id: 2, category: 'Entrées', name: 'Salade Zaalouk', price: '75 MAD', desc: 'Caviar d\\'aubergines grillées à la tomate, ail et épices.', active: true, translated: false },
    { id: 3, category: 'Plats Principaux', name: 'Tagine d\\'Agneau aux Pruneaux', price: '220 MAD', desc: 'Agneau mijoté aux épices douces, pruneaux caramélisés et amandes.', active: true, translated: false },
    { id: 4, category: 'Plats Principaux', name: 'Pastilla au Pigeon', price: '240 MAD', desc: 'Tourte sucrée-salée aux amandes, cannelle et fleur d\\'oranger.', active: false, translated: false },
    { id: 5, category: 'Desserts', name: 'Orange à la Cannelle', price: '50 MAD', desc: 'Tranches d\\'orange fraîche, cannelle moulue et sirop de fleur d\\'oranger.', active: true, translated: false },
    { id: 6, category: 'Boissons', name: 'Thé à la Menthe Royal', price: '40 MAD', desc: 'Thé vert traditionnel infusé à la menthe fraîche et pignons de pin.', active: true, translated: false }
  ]);`;

content = content.replace(targetState, replacementState);

fs.writeFileSync('src/App.tsx', content);
