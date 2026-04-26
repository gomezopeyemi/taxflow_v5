// app/dashboard/new/page.tsx
import TaxForm from "@/components/TaxForm";

export default function NewEntryPage() {
  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <div className="mb-8 animate-slide-up">
        <h1 className="text-2xl font-light text-[#e8e8f0]">New tax estimate</h1>
        <p className="text-sm text-[#8888a8] mt-1">
          Enter your income details and get an instant estimate.
        </p>
      </div>
      <TaxForm />
    </div>
  );
}
