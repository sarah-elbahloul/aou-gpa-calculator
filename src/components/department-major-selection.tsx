import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from "lucide-react";
import type { Faculty, Program } from "@shared/schema";

interface FacultyProgramSelectionProps {
  selectedFaculty: string;
  selectedProgram: string;
  onFacultyChange: (Faculty: string) => void;
  onProgramChange: (Program: string) => void;
}

export function FacultyProgramSelection({
  selectedFaculty,
  selectedProgram,
  onFacultyChange,
  onProgramChange,
}: FacultyProgramSelectionProps) {
  const { data: faculties = [], isLoading: loadingFaculties } = useQuery<Faculty[]>({
    queryKey: ['/api/faculties'],
  });

  const { data: Programs = [], isLoading: loadingPrograms } = useQuery<Program[]>({
    queryKey: ['/api/Programs', selectedFaculty],
    enabled: !!selectedFaculty,
  });

  const handleFacultyChange = (value: string) => {
    onFacultyChange(value);
    onProgramChange(""); // Reset Program when Faculty changes
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
          <Building2 className="text-primary mr-2" />
          Academic Information
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Faculty</label>
            <Select value={selectedFaculty} onValueChange={handleFacultyChange} disabled={loadingFaculties}>
              <SelectTrigger>
                <SelectValue placeholder="Select Faculty" />
              </SelectTrigger>
              <SelectContent>
                {faculties.map((dept) => (
                  <SelectItem key={dept.code} value={dept.code}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
            <Select value={selectedProgram} onValueChange={onProgramChange} disabled={!selectedFaculty || loadingPrograms}>
              <SelectTrigger>
                <SelectValue placeholder="Select Program" />
              </SelectTrigger>
              <SelectContent>
                {Programs.map((Program) => (
                  <SelectItem key={Program.code} value={Program.code}>
                    {Program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
