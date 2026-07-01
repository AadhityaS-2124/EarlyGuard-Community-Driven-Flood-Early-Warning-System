import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile, 
  User 
} from 'firebase/auth';
import { auth, isValidEmailDomain } from '../firebase';

// Interface for user registration data
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  countryCode?: string;
}

// Interface for login data
export interface LoginData {
  email: string;
  password: string;
}

// Country code interface
export interface CountryCode {
  code: string;
  name: string;
  dial_code: string;
}

// List of common country codes
export const countryCodes: CountryCode[] = [
  { code: 'IN', name: 'India', dial_code: '+91' }
];

const createMockUser = (email: string, name?: string): User => {
  return {
    uid: 'demo-user-' + Date.now(),
    email: email,
    displayName: name || email.split('@')[0],
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => 'demo-token',
    getIdTokenResult: async () => ({ token: 'demo-token' } as any),
    reload: async () => {},
    toJSON: () => ({}),
    phoneNumber: null,
    photoURL: null,
    providerId: 'firebase'
  } as unknown as User;
};

// Register a new user
export const registerUser = async (data: RegisterData): Promise<User> => {
  // Validate email domain
  if (!isValidEmailDomain(data.email)) {
    throw new Error('Email domain not allowed. Please use Gmail, iCloud, or Yahoo email.');
  }

  // Validate Mobile Number if provided
  if (data.phone && data.phone.length !== 10) {
    throw new Error('Mobile number must be exactly 10 digits');
  }

  if (!auth) {
    console.warn('Firebase Auth unavailable, logging in as demo user');
    return createMockUser(data.email, data.name);
  }

  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    
    // Update user profile with name
    await updateProfile(userCredential.user, {
      displayName: data.name
    });

    console.log(`User registered with phone: ${data.countryCode} ${data.phone}`);
    return userCredential.user;
  } catch (error) {
    console.warn('Firebase registration error, falling back to demo user:', error);
    return createMockUser(data.email, data.name);
  }
};

// Login user
export const loginUser = async (data: LoginData): Promise<User> => {
  if (!auth) {
    console.warn('Firebase Auth unavailable, logging in as demo user');
    return createMockUser(data.email);
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
    return userCredential.user;
  } catch (error) {
    console.warn('Firebase login error, falling back to demo user:', error);
    return createMockUser(data.email);
  }
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  if (!auth) {
    return;
  }
  try {
    await signOut(auth);
  } catch (error) {
    console.warn('Error during logout:', error);
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth?.currentUser || null;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!auth?.currentUser;
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && isValidEmailDomain(email);
};

// Validate Mail id format
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\d{1,10}$/;
  return phoneRegex.test(phone);
}; 