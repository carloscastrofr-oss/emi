
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { app, db } from '@/lib/firebase';

export type UserRole = "viewer" | "producer" | "core" | "admin";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
});

// Helper function to create a default user profile in Firestore
const createDefaultUserProfile = async (user: User) => {
    const userDocRef = doc(db, 'users', user.uid);
    const defaultProfile = {
      email: user.email,
      displayName: user.displayName || 'New User',
      role: 'viewer' // Assign a default role
    };
    await setDoc(userDocRef, defaultProfile, { merge: true });
    return { uid: user.uid, ...defaultProfile } as UserProfile;
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If firebase config is not valid, app will be an empty object, so we check one of its properties
    if (!app.options?.apiKey) {
      console.warn("Firebase not initialized, using mock user. All gated features will be available.");
      // Set a default mock user profile for UI to render correctly without auth
      setUserProfile({
          uid: 'mock-user',
          email: 'usuario@example.com',
          displayName: 'Usuario de Muestra',
          role: 'admin' // Give admin role so all UI is visible for development
      });
      setLoading(false);
      return;
    }

    const auth = getAuth(app);
    
    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(authUser);
        const userDocRef = doc(db, 'users', authUser.uid);
        
        const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile({
              uid: authUser.uid,
              email: authUser.email,
              displayName: authUser.displayName,
              ...docSnap.data(),
            } as UserProfile);
          } else {
             // If user document doesn't exist, create one with a default role
            createDefaultUserProfile(authUser).then(profile => {
                setUserProfile(profile);
            });
          }
          setLoading(false);
        }, (error) => {
            console.error("Error fetching user profile:", error);
            setUserProfile(null);
            setLoading(false);
        });

        return () => unsubscribeSnapshot();
      } else {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const value = { user, userProfile, loading };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
