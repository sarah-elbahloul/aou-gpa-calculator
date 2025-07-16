import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from "lucide-react";
import type { Department, Major } from "@shared/schema";

interface DepartmentMajorSelectionProps {
  selectedDepartment: string;
  selectedMajor: string;
  onDepartmentChange: (department: string) => void;
  onMajorChange: (major: string) => void;
}

export function DepartmentMajorSelection({
  selectedDepartment,
  selectedMajor,
  onDepartmentChange,
  onMajorChange,
}: DepartmentMajorSelectionProps) {
  const { data: departments = [], isLoading: loadingDepartments } = useQuery<Department[]>({
    queryKey: ['/api/departments'],
  });

  const { data: majors = [], isLoading: loadingMajors } = useQuery<Major[]>({
    queryKey: ['/api/majors', selectedDepartment],
    enabled: !!selectedDepartment,
  });

  const handleDepartmentChange = (value: string) => {
    onDepartmentChange(value);
    onMajorChange(""); // Reset major when department changes
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <Select value={selectedDepartment} onValueChange={handleDepartmentChange} disabled={loadingDepartments}>
              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Major</label>
            <Select value={selectedMajor} onValueChange={onMajorChange} disabled={!selectedDepartment || loadingMajors}>
              <SelectTrigger>
                <SelectValue placeholder="Select Major" />
              </SelectTrigger>
              <SelectContent>
                {majors.map((major) => (
                  <SelectItem key={major.id} value={major.id}>
                    {major.name}
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
