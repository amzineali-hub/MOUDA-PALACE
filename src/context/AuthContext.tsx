import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
      setUser(currentUser);
      if (currentUser) {
        try {
          // Ensure user exists in users collection
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setRole(userSnap.data().role || 'staff');
          } else {
            // Default new users to staff (in a real app, maybe default to customer or pending)
            // For Mouda Palace SaaS, we are the admin signing in
            const newRole = 'admin'; // Grant admin for quick dev testing
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
