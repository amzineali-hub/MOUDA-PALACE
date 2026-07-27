const fs = require('fs');

let rhCode = fs.readFileSync('src/RH.tsx', 'utf8');

// Replace the initialStaff and useState(initialStaff) with Firebase loading logic
const oldStaffData = `  const initialStaff = [
    { id: 'EMP-01', name: 'Ahmed Benali', role: 'Chef de Cuisine', department: 'Cuisine', phone: '+212 6 00 11 22 33', email: 'ahmed.b@moudapalace.com', status: 'Actif', shift: 'Soir', baseSalary: 14500, photo: '', cin: 'A123456', cnss: '123456789', hireDate: '2022-03-15', language: 'Français, Arabe' },
    { id: 'EMP-02', name: 'Karima Idrissi', role: 'Maître d\\'Hôtel', department: 'Salle', phone: '+212 6 00 11 22 34', email: 'karima.i@moudapalace.com', status: 'Actif', shift: 'Matin', baseSalary: 9500, photo: '', cin: 'AB98765', cnss: '987654321', hireDate: '2023-01-10', language: 'Français, Anglais, Arabe' },
    { id: 'EMP-03', name: 'Youssef Tazi', role: 'Serveur', department: 'Salle', phone: '+212 6 00 11 22 35', email: 'youssef.t@moudapalace.com', status: 'En congé', shift: '-', baseSalary: 4000, photo: '', cin: 'C456789', cnss: '456123789', hireDate: '2024-06-01', language: 'Français, Arabe' },
    { id: 'EMP-04', name: 'Sofia Amrani', role: 'Réceptionniste', department: 'Accueil', phone: '+212 6 00 11 22 36', email: 'sofia.a@moudapalace.com', status: 'Actif', shift: 'Soir', baseSalary: 6000, photo: '', cin: 'D654321', cnss: '789123456', hireDate: '2024-02-20', language: 'Français, Anglais, Espagnol' },
  ];
  const [staffData, setStaffData] = useState(initialStaff);`;

const newStaffData = `  const [staffData, setStaffData] = useState<any[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'staff'), orderBy('createdAt', 'desc')), (snapshot) => {
      if (snapshot.empty) {
        // Fallback or empty state
        setStaffData([
          { id: 'EMP-01', name: 'Ahmed Benali', role: 'Chef de Cuisine', department: 'Cuisine', phone: '+212 6 00 11 22 33', email: 'ahmed.b@moudapalace.com', status: 'Actif', shift: 'Soir', baseSalary: 14500, photo: '', cin: 'A123456', cnss: '123456789', hireDate: '2022-03-15', language: 'Français, Arabe' },
          { id: 'EMP-02', name: 'Karima Idrissi', role: 'Maître d\\'Hôtel', department: 'Salle', phone: '+212 6 00 11 22 34', email: 'karima.i@moudapalace.com', status: 'Actif', shift: 'Matin', baseSalary: 9500, photo: '', cin: 'AB98765', cnss: '987654321', hireDate: '2023-01-10', language: 'Français, Anglais, Arabe' },
        ]);
      } else {
        setStaffData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
      setLoadingStaff(false);
    });
    return () => unsub();
  }, []);`;

rhCode = rhCode.replace(oldStaffData, newStaffData);

// Update save logic
const oldSaveLogic = `  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newStaff = {
      id: editingStaff ? editingStaff.id : 'EMP-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      department: formData.get('department') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      status: formData.get('status') as string,
      shift: formData.get('shift') as string,
      baseSalary: Number(formData.get('baseSalary')),
      cin: formData.get('cin') as string,
      cnss: formData.get('cnss') as string,
      hireDate: formData.get('hireDate') as string,
      language: formData.get('language') as string,
      photo: editingStaff ? editingStaff.photo : ''
    };
    if (editingStaff) {
      setStaffData(prev => prev.map(s => s.id === editingStaff.id ? newStaff : s));
      showToast("Employé mis à jour avec succès");
    } else {
      setStaffData(prev => [...prev, newStaff]);
      showToast("Employé ajouté avec succès");
    }
    
    setIsModalOpen(false);
    setEditingStaff(null);
  };`;

const newSaveLogic = `  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const staffObj = {
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      department: formData.get('department') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      status: formData.get('status') as string,
      shift: formData.get('shift') as string,
      baseSalary: Number(formData.get('baseSalary')),
      cin: formData.get('cin') as string,
      cnss: formData.get('cnss') as string,
      hireDate: formData.get('hireDate') as string,
      language: formData.get('language') as string,
      photo: editingStaff ? editingStaff.photo : ''
    };
    
    try {
      if (editingStaff) {
        if (!editingStaff.id.startsWith('EMP-')) {
          await updateDoc(doc(db, 'staff', editingStaff.id), staffObj);
        }
        showToast("Employé mis à jour avec succès");
      } else {
        await addDoc(collection(db, 'staff'), {
          ...staffObj,
          createdAt: serverTimestamp()
        });
        showToast("Employé ajouté avec succès");
      }
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de l'enregistrement de l'employé");
    }
    
    setIsModalOpen(false);
    setEditingStaff(null);
  };`;

rhCode = rhCode.replace(oldSaveLogic, newSaveLogic);

// Update delete logic
const oldDeleteLogic = `  const handleDeleteStaff = (id: string) => {
    setStaffData(prev => prev.filter(s => s.id !== id));
    showToast("Employé supprimé");
    setIsModalOpen(false);
    setEditingStaff(null);
  };`;
  
const newDeleteLogic = `  const handleDeleteStaff = async (id: string) => {
    try {
      if (!id.startsWith('EMP-')) {
        await deleteDoc(doc(db, 'staff', id));
      }
      showToast("Employé supprimé");
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de la suppression");
    }
    setIsModalOpen(false);
    setEditingStaff(null);
  };`;

rhCode = rhCode.replace(oldDeleteLogic, newDeleteLogic);

fs.writeFileSync('src/RH.tsx', rhCode);
