const fs = require('fs');
let content = fs.readFileSync('src/ProductionJournaliere.tsx', 'utf-8');

if (!content.includes('import { deleteDoc }')) {
  if (content.includes("import { collection, query, onSnapshot, orderBy, doc, runTransaction, serverTimestamp } from 'firebase/firestore';")) {
     content = content.replace("import { collection, query, onSnapshot, orderBy, doc, runTransaction, serverTimestamp } from 'firebase/firestore';", 
       "import { collection, query, onSnapshot, orderBy, doc, runTransaction, serverTimestamp, deleteDoc } from 'firebase/firestore';");
  } else if (!content.includes('deleteDoc')) {
     content = content.replace("from 'firebase/firestore';", ", deleteDoc } from 'firebase/firestore';");
  }
}

if (!content.includes('Trash2')) {
  if (content.includes("import { ChefHat, ArrowRight, CheckCircle, Package, Search, Plus, X } from 'lucide-react';")) {
     content = content.replace("import { ChefHat, ArrowRight, CheckCircle, Package, Search, Plus, X } from 'lucide-react';", 
       "import { ChefHat, ArrowRight, CheckCircle, Package, Search, Plus, X, Trash2 } from 'lucide-react';");
  } else if (!content.includes('Trash2')) {
     content = content.replace("from 'lucide-react';", ", Trash2 } from 'lucide-react';");
  }
}

fs.writeFileSync('src/ProductionJournaliere.tsx', content);
console.log("Patched missing imports");
