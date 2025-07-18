import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CourseSearch } from "./course-search";
import { Calendar, Plus, Trash2, Book } from "lucide-react";
import { gradeOptions, gradePoints, Semester, Course } from "@shared/schema";

interface SemesterManagementProps {
  semesters: Semester[];
  selectedProgram: string; // Corresponds to `programCode` from UserRecord
  selectedFaculty: string; // <--- ADDED: Corresponds to `facultyCode` from UserRecord
  onAddSemester: () => void;
  onRemoveSemester: (semesterId: string) => void;
  onUpdateSemester: (semesterId: string, semester: Semester) => void;
}

export function SemesterManagement({
  semesters,
  selectedProgram,
  selectedFaculty, // <--- Destructure the new prop here
  onAddSemester,
  onRemoveSemester,
  onUpdateSemester,
}: SemesterManagementProps) {
  const [editingSemester, setEditingSemester] = useState<string | null>(null);
  const [semesterNames, setSemesterNames] = useState<Record<string, string>>({});

  const updateSemesterName = (semesterId: string, newName: string) => {
    setSemesterNames(prev => ({ ...prev, [semesterId]: newName }));
    const semester = semesters.find(s => s.id === semesterId);
    if (semester) {
      onUpdateSemester(semesterId, { ...semester, name: newName });
    }
  };

  const addCourseToSemester = (semesterId: string, course: Course) => {
    const semester = semesters.find(s => s.id === semesterId);
    if (semester) {
      const updatedSemester = {
        ...semester,
        courses: [...semester.courses, course],
      };
      onUpdateSemester(semesterId, updatedSemester);
    }
  };

  const removeCourseFromSemester = (semesterId: string, courseCode: string) => {
    const semester = semesters.find(s => s.id === semesterId);
    if (semester) {
      const updatedSemester = {
        ...semester,
        courses: semester.courses.filter(c => c.code !== courseCode),
      };
      onUpdateSemester(semesterId, updatedSemester);
    }
  };

  const updateCourseGrade = (semesterId: string, courseCode: string, grade: string) => {
    const semester = semesters.find(s => s.id === semesterId);
    if (semester) {
      const updatedSemester = {
        ...semester,
        courses: semester.courses.map(c =>
          c.code === courseCode ? { ...c, grade } : c
        ),
      };
      onUpdateSemester(semesterId, updatedSemester);
    }
  };

  const getSemesterGPA = (semester: Semester) => {
    let totalGradePoints = 0;
    let totalCredits = 0;

    semester.courses.forEach(course => {
      if (course.grade && gradePoints[course.grade] !== undefined) {
        totalGradePoints += gradePoints[course.grade] * course.credits;
        totalCredits += course.credits;
      }
    });

    return totalCredits > 0 ? Math.round((totalGradePoints / totalCredits) * 100) / 100 : 0;
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800 flex items-center">
            <Calendar className="text-primary mr-2" />
            Semesters
          </h3>
          <Button onClick={onAddSemester} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Add Semester
          </Button>
        </div>

        {semesters.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No semesters added yet. Click "Add Semester" to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {semesters.map((semester) => (
              <div key={semester.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Book className="text-secondary h-5 w-5" />
                    {editingSemester === semester.id ? (
                      <Input
                        value={semesterNames[semester.id] || semester.name}
                        onChange={(e) => updateSemesterName(semester.id, e.target.value)}
                        onBlur={() => setEditingSemester(null)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingSemester(null)}
                        className="h-8 w-48"
                        autoFocus
                      />
                    ) : (
                      <h4
                        className="font-medium text-gray-800 cursor-pointer hover:text-primary"
                        onClick={() => setEditingSemester(semester.id)}
                      >
                        {semester.name}
                      </h4>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveSemester(semester.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <CourseSearch
                  selectedProgram={selectedProgram}
                  selectedFaculty={selectedFaculty} // <--- PASSED THE NEW PROP HERE!
                  onCourseSelect={(course) => addCourseToSemester(semester.id, course)}
                  existingCourses={semester.courses.map(c => c.code)}
                />

                <div className="space-y-3 mt-4">
                  {semester.courses.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <p>No courses added to this semester yet.</p>
                    </div>
                  ) : (
                    semester.courses.map((course) => (
                      <div key={course.code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{course.code}</div>
                          <div className="text-sm text-gray-600">{course.name}</div>
                          <div className="text-xs text-gray-500">Credits: {course.credits}</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Select
                            value={course.grade}
                            onValueChange={(grade) => updateCourseGrade(semester.id, course.code, grade)}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue placeholder="Grade" />
                            </SelectTrigger>
                            <SelectContent>
                              {gradeOptions.map((grade) => (
                                <SelectItem key={grade} value={grade}>
                                  {grade}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCourseFromSemester(semester.id, course.code)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {semester.courses.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700">Semester GPA</div>
                    <div className="text-2xl font-bold text-primary">{getSemesterGPA(semester).toFixed(2)}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}