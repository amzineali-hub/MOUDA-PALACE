const fs = require('fs');
let content = fs.readFileSync('src/Recettes.tsx', 'utf-8');

const oldCode = `  const [activeCategory, setActiveCategory] = useState('toutes');
  
  const recettes = [
    { id: 'R001', nom: 'Pastilla au Pigeon', categorie: 'Plats Principaux', cout: '120 MAD', temps: '1h 30m', portion: '4 personnes', difficulte: 'Difficile' },
    { id: 'R002', nom: 'Couscous Royal', categorie: 'Plats Principaux', cout: '150 MAD', temps: '2h', portion: '6 personnes', difficulte: 'Moyenne' },
    { id: 'R003', nom: 'Zaalouk d\\'Aubergines', categorie: 'Entrées', cout: '25 MAD', temps: '40m', portion: '2 personnes', difficulte: 'Facile' },
    { id: 'R004', nom: 'Tajine d\\'Agneau aux Pruneaux', categorie: 'Plats Principaux', cout: '110 MAD', temps: '1h 45m', portion: '4 personnes', difficulte: 'Moyenne' },
    { id: 'R005', nom: 'Corne de Gazelle', categorie: 'Desserts', cout: '60 MAD', temps: '2h', portion: '12 pièces', difficulte: 'Difficile' },
  ];`;

const newCode = `  const [activeCategory, setActiveCategory] = useState('toutes');
  const [isNewRecetteModalOpen, setIsNewRecetteModalOpen] = useState(false);
  const { showToast } = useToast();
  
  const [recettes, setRecettes] = useState<any[]>([
    { id: 'R001', nom: 'Pastilla au Pigeon', categorie: 'Plats Principaux', cout: '120 MAD', temps: '1h 30m', portion: '4 personnes', difficulte: 'Difficile' },
    { id: 'R002', nom: 'Couscous Royal', categorie: 'Plats Principaux', cout: '150 MAD', temps: '2h', portion: '6 personnes', difficulte: 'Moyenne' },
    { id: 'R003', nom: 'Zaalouk d\\'Aubergines', categorie: 'Entrées', cout: '25 MAD', temps: '40m', portion: '2 personnes', difficulte: 'Facile' },
    { id: 'R004', nom: 'Tajine d\\'Agneau aux Pruneaux', categorie: 'Plats Principaux', cout: '110 MAD', temps: '1h 45m', portion: '4 personnes', difficulte: 'Moyenne' },
    { id: 'R005', nom: 'Corne de Gazelle', categorie: 'Desserts', cout: '60 MAD', temps: '2h', portion: '12 pièces', difficulte: 'Difficile' },
  ]);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'recettes'), orderBy('createdAt', 'desc')), (snapshot) => {
      if (!snapshot.empty) {
        setRecettes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    });
    return () => unsub();
  }, []);`;

content = content.replace(oldCode, newCode);

const oldModal = `<button 
                onClick={() => {
                  setIsNewRecetteModalOpen(false);
                }}
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-6 hover:bg-[#333] transition-colors"
              >
                Sauvegarder la recette
              </button>`;

const newModal = `<button 
                type="submit"
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-6 hover:bg-[#333] transition-colors"
              >
                Sauvegarder la recette
              </button>`;
content = content.replace(oldModal, newModal);

const oldFormTag = `<form className="p-6">`;
const newFormTag = `<form className="p-6" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newRecette = {
                id: 'R' + Date.now().toString().slice(-4),
                nom: formData.get('nom'),
                categorie: formData.get('categorie'),
                cout: formData.get('cout') + ' MAD',
                temps: formData.get('temps') + 'm',
                portion: formData.get('portion'),
                difficulte: formData.get('difficulte'),
                createdAt: serverTimestamp()
              };
              setRecettes([newRecette, ...recettes]);
              showToast("Recette ajoutée avec succès");
              setIsNewRecetteModalOpen(false);
              
              try {
                await addDoc(collection(db, 'recettes'), newRecette);
              } catch(err) {
                console.error(err);
              }
            }}>`;
content = content.replace(oldFormTag, newFormTag);

fs.writeFileSync('src/Recettes.tsx', content);
