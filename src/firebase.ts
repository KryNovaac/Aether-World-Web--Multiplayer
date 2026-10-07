/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import firebaseConfigJson from '../firebase-applet-config.json';

// Mendukung Environment Variables (Vercel / .env) dengan fallback otomatis ke firebase-applet-config.json
const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env || {};

const resolvedFirebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
  storageBucket:
    env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
  messagingSenderId:
    env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    firebaseConfigJson.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId,
  firestoreDatabaseId:
    env.VITE_FIREBASE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId,
};

// Initialize Firebase SDK
export const app = initializeApp(resolvedFirebaseConfig);
export const auth = getAuth(app);
export const db =
  resolvedFirebaseConfig.firestoreDatabaseId &&
  resolvedFirebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, resolvedFirebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
  shouldThrow = false
): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  if (shouldThrow) {
    throw new Error(JSON.stringify(errInfo));
  }
  return errInfo;
}

// Validate connection to Firestore on boot
async function verifyFirestoreConnectivity() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
verifyFirestoreConnectivity();

export {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
};
export type { User };
