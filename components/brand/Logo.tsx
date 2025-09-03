"use client";

import Image from "next/image";

/**
 * Logo component
 * Usage:
 * <Logo size={28} />
 */
export function Logo({ size = 28, alt = "Flowlancer" }: { size?: number; alt?: string }) {
    return <Image src="/flowlancer_logo_dark.svg" alt={alt} width={size} height={size} />;
}


