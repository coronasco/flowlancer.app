import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
  title: "Client Portal - Flowlancer",
  description: "Private client portal for project collaboration.",
};

export default function PortalLayout({ children }: { children: ReactNode }) {
  return children;
}
