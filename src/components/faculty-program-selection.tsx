import { Card, CardContent } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Building2 } from "lucide-react";
import type { Faculty, Program } from "@shared/schema";

interface FacultyProgramSelectionProps {
  selectedFaculty: string;
  selectedProgram: string;
  onFacultyChange: (facultyCode: string) => void; // Renamed param for clarity
  onProgramChange: (programCode: string) => void; // Renamed param for clarity
  allFaculties: Faculty[]; // New prop to receive all faculties
  allPrograms: Program[];   // New prop to receive all programs
}

export function FacultyProgramSelection({
  selectedFaculty,
  selectedProgram,
  onFacultyChange,
  onProgramChange,
  allFaculties, // Destructure new props
  allPrograms,    // Destructure new props
}: FacultyProgramSelectionProps) {

  // Filter programs based on the selected faculty
  const filteredPrograms = allPrograms.filter(
    (program) => program.facultyCode === selectedFaculty
  );

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
            <Select value={selectedFaculty} onValueChange={handleFacultyChange} disabled={allFaculties.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder={allFaculties.length === 0 ? "Loading Faculties..." : "Select Faculty"} />
              </SelectTrigger>
              <SelectContent>
                {allFaculties.map((faculty) => ( // Use allFaculties prop
                  <SelectItem key={faculty.code} value={faculty.code}>
                    {faculty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
            <Select
              value={selectedProgram}
              onValueChange={onProgramChange}
              disabled={!selectedFaculty || filteredPrograms.length === 0} // Disable if no faculty selected or no programs available
            >
              <SelectTrigger>
                <SelectValue placeholder={!selectedFaculty ? "Select Faculty First" : (filteredPrograms.length === 0 ? "No Programs Available" : "Select Program")} />
              </SelectTrigger>
              <SelectContent>
                {filteredPrograms.map((program) => ( // Use filteredPrograms
                  <SelectItem key={program.code} value={program.code}>
                    {program.name}
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