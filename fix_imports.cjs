const fs = require('fs');
let content = fs.readFileSync('src/ProductionJournaliere.tsx', 'utf-8');

content = content.replace(
  "import { collection, query, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, getDocs, where, runTransaction } from 'firebase/firestore';",
  "import { collection, query, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, getDocs, where, runTransaction, deleteDoc } from 'firebase/firestore';"
);

content = content.replace(
  "import { ChefHat, Plus, Activity, Clock, CheckCircle, Package, ArrowRight, X } from 'lucide-react';",
  "import { ChefHat, Plus, Activity, Clock, CheckCircle, Package, ArrowRight, X, Trash2 } from 'lucide-react';"
);

fs.writeFileSync('src/ProductionJournaliere.tsx', content);
