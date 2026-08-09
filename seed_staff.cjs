const fs = require('fs');
let code = fs.readFileSync('src/RH.tsx', 'utf8');

const hookOriginal = `  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'staff'), (snapshot) => {
      setStaffData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);`;

const hookReplacement = `  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'staff'), async (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Si la base de données est vide, on restaure les données initiales
      if (data.length === 0) {
        const initialStaff = [
          { name: 'Ahmed Benali', role: 'Chef de Cuisine', department: 'Cuisine', phone: '+212 6 00 11 22 33', email: 'ahmed.b@moudapalace.com', status: 'Actif', shift: 'Soir', baseSalary: 14500, photo: '', cin: 'A123456', cnss: '123456789', hireDate: '2022-03-15', language: 'Français, Arabe' },
          { name: 'Karima Idrissi', role: 'Maître d\\'Hôtel', department: 'Salle', phone: '+212 6 00 11 22 34', email: 'karima.i@moudapalace.com', status: 'Actif', shift: 'Matin', baseSalary: 9500, photo: '', cin: 'AB98765', cnss: '987654321', hireDate: '2023-01-10', language: 'Français, Anglais, Arabe' },
          { name: 'Youssef Tazi', role: 'Serveur', department: 'Salle', phone: '+212 6 00 11 22 35', email: 'youssef.t@moudapalace.com', status: 'En congé', shift: '-', baseSalary: 4000, photo: '', cin: 'C456789', cnss: '456123789', hireDate: '2024-06-01', language: 'Français, Arabe' },
          { name: 'Sofia Amrani', role: 'Réceptionniste', department: 'Accueil', phone: '+212 6 00 11 22 36', email: 'sofia.a@moudapalace.com', status: 'Actif', shift: 'Soir', baseSalary: 6000, photo: '', cin: 'D654321', cnss: '789123456', hireDate: '2024-02-20', language: 'Français, Anglais, Espagnol' },
        ];
        
        try {
          for (const staff of initialStaff) {
            await addDoc(collection(db, 'staff'), {
              ...staff,
              empId: \`EMP-\${Date.now().toString().slice(-4)}\`,
              createdAt: serverTimestamp()
            });
          }
        } catch (e) {
          console.error("Error seeding initial staff:", e);
        }
      } else {
        setStaffData(data);
      }
    });
    return () => unsub();
  }, []);`;

code = code.replace(hookOriginal, hookReplacement);
fs.writeFileSync('src/RH.tsx', code);
