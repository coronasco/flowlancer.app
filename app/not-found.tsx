import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
    return (
        <div className="min-h-dvh grid place-items-center p-6">
            <div className="text-center space-y-6">
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold">Profile not found</h1>
                    <p className="text-sm text-foreground/60">This user doesn&apos;t exist or doesn&apos;t have a public profile.</p>
                </div>
                <Link href="/dashboard/profile">
                    <Button variant="outline" className="rounded-xl">
                        ← Back to Flowlancer
                    </Button>
                </Link>
            </div>
        </div>
    );
}


