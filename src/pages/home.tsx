import { GPACalculator } from "@/components/gpa-calculator"; // Use the @/ alias and omit .tsx

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <GPACalculator />
    </div>
  );
}
