const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Find the imports and add onSnapshot, query, collection
content = content.replace(
  "import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';",
  "import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';"
);

// We need to inject a useEffect that listens to 'tables'
const useEffectSyncStr = `
  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'tables')), (snapshot) => {
      const fbTables = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          fbId: doc.id,
          id: data.id,
          capacity: data.capacity || 2,
          status: data.status === 'libre' ? 'available' : (data.status === 'reservee' ? 'reserved' : 'occupied'),
          type: data.shape === 'rond' ? 'round' : (data.shape === 'rectangle' ? 'rectangle' : 'square'),
          x: data.x || Math.floor(Math.random() * 800),
          y: data.y || Math.floor(Math.random() * 400),
          ...data
        };
      });
      if (fbTables.length > 0) {
        setTables(fbTables);
      }
    });
    return () => unsub();
  }, []);
`;

// Insert it right after the local storage use effects
content = content.replace(
  "localStorage.setItem('mouda_waitlist', JSON.stringify(waitlist));\n  }, [waitlist]);",
  "localStorage.setItem('mouda_waitlist', JSON.stringify(waitlist));\n  }, [waitlist]);\n" + useEffectSyncStr
);

fs.writeFileSync('src/App.tsx', content);
console.log("Done");
