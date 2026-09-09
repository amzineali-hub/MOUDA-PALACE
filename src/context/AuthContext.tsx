import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db, signOut } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Application interne à usage privé (un seul restaurant, pas de multi-tenant) :
// seuls ces comptes sont autorisés à se connecter. Toute autre tentative est déconnectée
// immédiatement, sans jamais créer de document dans la collection `users`.
// Doit rester synchronisé avec la liste dans firestore.rules.
export const AUTHORIZED_EMAILS = ['amzine.ali@gmail.com', 'contact@moudapalace.com', 'moudapalace@gmail.com'];

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: string | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, role: null });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && !AUTHORIZED_EMAILS.includes(currentUser.email || '')) {
        console.warn('Tentative de connexion non autorisée:', currentUser.email);
        try {
          await signOut(auth);
        } catch (err) {
          console.error('Error signing out unauthorized user', err);
        }
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);
      if (currentUser) {
        try {
          // Ensure user exists in users collection
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setRole(userSnap.data().role || 'admin');
          } else {
            const newRole = 'admin';
            try {
              await setDoc(userRef, {
                email: currentUser.email,
                role: newRole,
                createdAt: new Date().toISOString()
              });
            } catch (writeErr) {
              console.warn("Could not create user doc (might be permission or offline):", writeErr);
            }
            setRole(newRole);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          // Fallback if offline
          setRole('admin');
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, role }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
