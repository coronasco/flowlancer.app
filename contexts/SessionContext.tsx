"use client";

import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { auth, ensureCustomerProfile } from "@/lib/auth/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";

export type Session = { user: User | null; loading: boolean };

const SessionContext = createContext<Session>({ user: null, loading: true });

export function SessionProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsub = onAuthStateChanged(auth, (u) => {
			setUser(u);
			setLoading(false);
			if (u) {
				// best-effort create customer profile in Firestore
				ensureCustomerProfile({ uid: u.uid, email: u.email, displayName: u.displayName, photoURL: u.photoURL });
			}
		});
		return () => unsub();
	}, []);

	return (
		<SessionContext.Provider value={{ user, loading }}>
			{children}
		</SessionContext.Provider>
	);
}

export function useSession() {
	return useContext(SessionContext);
}
