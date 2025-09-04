import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

let adminApp: App | null = null;

export function getFirebaseAdminApp(): App {
	if (adminApp) {
		return adminApp;
	}

	// Check if already initialized
	const existingApps = getApps();
	if (existingApps.length > 0) {
		adminApp = existingApps[0];
		return adminApp;
	}

	// Initialize with service account
	const serviceAccount = {
		projectId: process.env.FIREBASE_PROJECT_ID,
		clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
		privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
	};

	if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
		throw new Error("Firebase Admin credentials are missing. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.");
	}

	adminApp = initializeApp({
		credential: cert(serviceAccount),
		storageBucket: `${serviceAccount.projectId}.appspot.com`,
	});

	return adminApp;
}

// Export adminSdk object with commonly used services
export const adminSdk = {
	firestore: () => getFirestore(getFirebaseAdminApp()),
	auth: () => getAuth(getFirebaseAdminApp()),
	app: () => getFirebaseAdminApp(),
};

// Verify Firebase ID token
export async function verifyIdToken(token: string) {
	try {
		const auth = getAuth(getFirebaseAdminApp());
		const decodedToken = await auth.verifyIdToken(token);
		return decodedToken;
	} catch (error) {
		console.error("Error verifying Firebase token:", error);
		return null;
	}
}
