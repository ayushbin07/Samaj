import { Spinner } from "@/components/ui";

export default function AppLoading() {
  return (
    <div className="flex flex-1 min-h-[60vh] w-full items-center justify-center p-6">
      <Spinner size="lg" label="Thinking..." />
    </div>
  );
}
