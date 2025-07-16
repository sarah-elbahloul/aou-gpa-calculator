import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import { gradePoints } from "@shared/schema";

const gradePercentages: Record<string, string> = {
  'A': '100-90%',
  'B+': '89-82%',
  'B': '81-74%',
  'C+': '73-66%',
  'C': '65-58%',
  'D': '57-50%',
  'F': 'Below 50%',
};

export function GradeScale() {
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
          <Info className="text-primary mr-2" />
          AOU Grading Scale
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Grade</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Grade Points</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.entries(gradePoints).map(([grade, points]) => (
                <tr key={grade}>
                  <td className="px-4 py-2 font-medium">{grade}</td>
                  <td className="px-4 py-2">{points.toFixed(2)}</td>
                  <td className="px-4 py-2">{gradePercentages[grade]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
