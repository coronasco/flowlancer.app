'use client';

import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, signOut, signInWithRedirect, getRedirectResult, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

let app: FirebaseApp | null = null;

export function getFirebaseApp() {
	if (!app) {
		app = initializeApp({
			apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
			authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
			projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
			storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
			messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
			appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
			measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
		});
		if (typeof window !== "undefined") {
			isSupported().then((ok) => {
				if (ok && app) getAnalytics(app);
			});
		}
	}
	return app;
}

export const auth = getAuth(getFirebaseApp());
setPersistence(auth, browserLocalPersistence).catch(() => {});
export const db = getFirestore(getFirebaseApp());

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

function getErrorCode(e: unknown): string {
	if (e && typeof e === "object" && "code" in e) {
		const code = (e as { code?: unknown }).code;
		return typeof code === "string" ? code : "";
	}
	return "";
}

export async function signInWithGoogle() {
	try {
		await signInWithPopup(auth, googleProvider);
	} catch (e: unknown) {
		const code = getErrorCode(e);
		if (code === "auth/popup-blocked" || code === "auth/cancelled-popup-request" || code === "auth/popup-closed-by-user") {
			await signInWithRedirect(auth, googleProvider);
			return;
		}
		throw e;
	}
}

export async function signInWithGitHub() {
	try {
		await signInWithPopup(auth, githubProvider);
	} catch (e: unknown) {
		const code = getErrorCode(e);
		if (code === "auth/popup-blocked" || code === "auth/cancelled-popup-request" || code === "auth/popup-closed-by-user") {
			await signInWithRedirect(auth, githubProvider);
			return;
		}
		throw e;
	}
}

export async function resolveRedirectResult() {
	try {
		return await getRedirectResult(auth);
	} catch {
		return null;
	}
}

export async function signOutFirebase() {
	await signOut(auth);
}

export async function ensureCustomerProfile(user: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }) {
  try {
    const uid = user.uid;
    const ref = doc(db, "customers", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        email: user.email ?? null,
        name: user.displayName ?? (user.email ? user.email.split("@")[0] : null),
        avatar_url: user.photoURL ?? null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
    }
  } catch {
    // ignore
  }
}
