"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-dvh grid place-items-center p-8">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-foreground/60">Please try again later.</p>
        <button onClick={reset} className="inline-flex h-9 px-4 items-center justify-center rounded-md border border-black/10 bg-white hover:bg-black/5">Try again</button>
      </div>
    </div>
  );
}


