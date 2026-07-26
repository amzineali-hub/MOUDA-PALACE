import { collection, setDoc, doc } from 'firebase/firestore';
import { db } from './src/firebase';

const defaultTables = [
      { id: 'T1', capacity: 2, status: 'occupee', x: 50, y: 80, shape: 'rond', zone: 'patio' },
      { id: 'T2', capacity: 2, status: 'libre', x: 50, y: 220, shape: 'rond', zone: 'patio' },
      { id: 'T3', capacity: 4, status: 'reservee', x: 50, y: 360, shape: 'carre', zone: 'patio' },
      { id: 'T4', capacity: 4, status: 'libre', x: 220, y: 80, shape: 'carre', zone: 'patio' },
      { id: 'T5', capacity: 6, status: 'libre', x: 220, y: 220, shape: 'rectangle', zone: 'terrasse' },
      { id: 'T6', capacity: 2, status: 'libre', x: 220, y: 360, shape: 'rond', zone: 'terrasse' },
      { id: 'T7', capacity: 8, status: 'libre', x: 420, y: 80, shape: 'rectangle', zone: 'terrasse' },
      { id: 'T8', capacity: 4, status: 'libre', x: 420, y: 220, shape: 'carre', zone: 'terrasse' },
      { id: 'T9', capacity: 4, status: 'occupee', x: 420, y: 360, shape: 'carre', zone: 'salon' },
      { id: 'T10', capacity: 2, status: 'libre', x: 620, y: 80, shape: 'rond', zone: 'salon' },
      { id: 'T11', capacity: 6, status: 'reservee', x: 620, y: 220, shape: 'rectangle', zone: 'salon' },
      { id: 'T12', capacity: 2, status: 'libre', x: 620, y: 360, shape: 'rond', zone: 'salon' },
      { id: 'T13', capacity: 8, status: 'libre', x: 820, y: 120, shape: 'rectangle', zone: 'salon' },
      { id: 'T14', capacity: 4, status: 'libre', x: 820, y: 280, shape: 'carre', zone: 'patio' },
];

async function seed() {
  for (const t of defaultTables) {
    await setDoc(doc(db, 'tables', t.id), t);
  }
  console.log("Seeded tables");
}

seed();
