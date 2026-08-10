import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

// Reusable auth providers – created once per app lifecycle
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
  provider: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Create user profile in Firestore
  const createUserProfile = async (user: User, additionalData: Partial<UserProfile> = {}) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const { displayName, email, emailVerified } = user;
        const createdAt = new Date().toISOString();
        const lastLoginAt = new Date().toISOString();
        
        // Extract first name from display name for social logins
        const firstName = displayName ? displayName.split(' ')[0] : '';
        
        const profileData: UserProfile = {
          uid: user.uid,
          email: email || '',
          displayName: displayName || '',
          firstName: firstName,
          emailVerified,
          createdAt,
          lastLoginAt,
          provider: user.providerData[0]?.providerId || 'email',
          ...additionalData,
        };

        await setDoc(userRef, profileData);
        setUserProfile(profileData);
      } else {
        // Update last login time
        const profileData = userSnap.data() as UserProfile;
        const updatedProfile = {
          ...profileData,
          lastLoginAt: new Date().toISOString(),
        };
        
        await setDoc(userRef, updatedProfile);
        setUserProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
      // Don't throw error, just log it and continue
      // Create a basic profile without database storage
      const { displayName, email, emailVerified } = user;
      const firstName = displayName ? displayName.split(' ')[0] : '';
      
      const basicProfile: UserProfile = {
        uid: user.uid,
        email: email || '',
        displayName: displayName || '',
        firstName: firstName,
        emailVerified,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        provider: user.providerData[0]?.providerId || 'email',
        ...additionalData,
      };
      setUserProfile(basicProfile);
    }
  };

  // Fetch user profile from Firestore
  const fetchUserProfile = async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const profileData = userSnap.data() as UserProfile;
        
        // If firstName doesn't exist but displayName does, extract it
        if (!profileData.firstName && profileData.displayName) {
          profileData.firstName = profileData.displayName.split(' ')[0];
        }
        
        setUserProfile(profileData);
      } else {
        // Create profile if it doesn't exist
        await createUserProfile(user);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Create a basic profile if database is unavailable
      const { displayName, email, emailVerified } = user;
      const firstName = displayName ? displayName.split(' ')[0] : '';
      
      const basicProfile: UserProfile = {
        uid: user.uid,
        email: email || '',
        displayName: displayName || '',
        firstName: firstName,
        emailVerified,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        provider: user.providerData[0]?.providerId || 'email',
      };
      setUserProfile(basicProfile);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // Update display name if provided
      if (userData.firstName && userData.lastName) {
        await updateProfile(user, {
          displayName: `${userData.firstName} ${userData.lastName}`,
        });
      }

      // Create user profile
      await createUserProfile(user, userData);

      // Send email verification
      await sendEmailVerification(user);

      toast({
        title: "Account Created Successfully!",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Update last login time
      await fetchUserProfile(user);

      toast({
        title: "Welcome Back!",
        description: "You have successfully signed in.",
      });
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await createUserProfile(user);
      toast({
        title: "Welcome!",
        description: "You have successfully signed in with Google.",
      });
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        throw new Error("Sign‑in window was closed before completing.");
      }
      if (error.code === "auth/popup-blocked") {
        throw new Error("The popup was blocked by the browser. Please enable pop‑ups for this site.");
      }
      console.error('Google sign in error:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  };

  // Sign in with GitHub
  const signInWithGithub = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;
      await createUserProfile(user);
      toast({
        title: "Welcome!",
        description: "You have successfully signed in with GitHub.",
      });
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        throw new Error("Sign‑in window was closed before completing.");
      }
      if (error.code === "auth/popup-blocked") {
        throw new Error("The popup was blocked by the browser. Please enable pop‑ups for this site.");
      }
      console.error('GitHub sign in error:', error);
      throw new Error(error.message || 'Failed to sign in with GitHub');
    }
  };

  // Sign out
  const signOutUser = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your email for password reset instructions.",
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(error.message || 'Failed to send password reset email');
    }
  };

  // Send email verification
  const sendVerificationEmail = async () => {
    if (!currentUser) throw new Error('No user logged in');
    
    try {
      await sendEmailVerification(currentUser);
      toast({
        title: "Verification Email Sent",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      console.error('Email verification error:', error);
      throw new Error(error.message || 'Failed to send verification email');
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) throw new Error('No user logged in');

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const updatedData = {
        ...userProfile,
        ...data,
        lastLoginAt: new Date().toISOString(),
      };

      await setDoc(userRef, updatedData);
      setUserProfile(updatedData);

      // Update Firebase Auth profile if display name changed
      if (data.firstName && data.lastName) {
        await updateProfile(currentUser, {
          displayName: `${data.firstName} ${data.lastName}`,
        });
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!currentUser) throw new Error('No user logged in');

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(currentUser.email!, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);

      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      });
    } catch (error: any) {
      console.error('Password change error:', error);
      throw new Error(error.message || 'Failed to change password');
    }
  };

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (currentUser) {
      await fetchUserProfile(currentUser);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Only fetch profile if we haven't already loaded it
        if (!userProfile) {
          await fetchUserProfile(user);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGithub,
    signOut: signOutUser,
    resetPassword,
    sendVerificationEmail,
    updateUserProfile,
    changePassword,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
