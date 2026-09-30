import { Spinner } from "@/components/ui";

export default function RootLoading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-[var(--color-bg-primary)]">
      <Spinner size="lg" label="Thinking..." />
    </div>
  );
}
