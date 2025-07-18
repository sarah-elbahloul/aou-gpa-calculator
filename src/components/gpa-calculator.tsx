import { useState, useEffect } from "react";
import { FacultyProgramSelection } from "./department-major-selection";
import { SemesterManagement } from "./semester-management";
import { GradeScale } from "./grade-scale";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Calculator, GraduationCap, TrendingUp } from "lucide-react";
import { gradePoints, UserRecord } from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Course {
  code: string;
  name: string;
  credits: number;
  grade: string;
}

interface Semester {
  id: string;
  name: string;
  courses: Course[];
}

export function GPACalculator() {
  const [sessionId] = useState(() => Math.random().toString(36).substr(2, 9));
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [cumulativeGPA, setCumulativeGPA] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [completedCourses, setCompletedCourses] = useState(0);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load user record using useQuery
  const { data: userRecord } = useQuery<UserRecord | undefined>({
    queryKey: ['/api/user-record', sessionId],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/user-record?sessionId=${sessionId}`);
        if (!response.ok) {
          if (response.status === 404) { // Handle case where user record might not exist yet
            return undefined;
          }
          throw new Error('Network response was not ok');
        }
        return response.json();
      } catch (error) {
        console.error("Error fetching user record:", error);
        return undefined; // Return undefined on error to prevent issues
      }
    },
    staleTime: Infinity, // Or a suitable time if you want to refetch on focus/mount
  });

  // Save user record mutation
  const saveUserRecord = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/user-record', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-record', sessionId] });
    },
  });

  // Update user record mutation
  const updateUserRecord = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', `/api/user-record/${sessionId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-record', sessionId] });
    },
  });

  // Load saved data
  useEffect(() => {
    if (userRecord) {
      setSelectedFaculty(userRecord.facultyCode || "");
      setSelectedProgram(userRecord.programCode || "");
      setSemesters(userRecord.semesters || []);
    }
  }, [userRecord]);

  // Save data when it changes
  useEffect(() => {
    // Only attempt to save if Faculty and Program are selected, and userRecord has been fetched (even if undefined for new users)
    // Use isPending instead of isLoading
    if (selectedFaculty && selectedProgram && (userRecord !== undefined || (userRecord === undefined && !saveUserRecord.isPending && !updateUserRecord.isPending))) {
      const userData = {
        sessionId,
        facultyCode: selectedFaculty,
        programCode: selectedProgram,
        semesters,
      };

      if (userRecord) {
        updateUserRecord.mutate(userData);
      } else {
        saveUserRecord.mutate(userData);
      }
    }
  }, [selectedFaculty, selectedProgram, semesters, userRecord, saveUserRecord.isPending, updateUserRecord.isPending]);

  const calculateGPA = () => {
    let totalGradePoints = 0;
    let totalCreditsEarned = 0;
    let coursesCompleted = 0;

    semesters.forEach(semester => {
      semester.courses.forEach(course => {
        if (course.grade && gradePoints[course.grade] !== undefined) {
          totalGradePoints += gradePoints[course.grade] * course.credits;
          totalCreditsEarned += course.credits;
          coursesCompleted++;
        }
      });
    });

    const gpa = totalCreditsEarned > 0 ? totalGradePoints / totalCreditsEarned : 0;
    setCumulativeGPA(Math.round(gpa * 100) / 100);
    setTotalCredits(totalCreditsEarned);
    setCompletedCourses(coursesCompleted);

    toast({
      title: "GPA Calculated",
      description: `Your cumulative GPA is ${Math.round(gpa * 100) / 100}`,
    });
  };

  const addSemester = () => {
    if (semesters.length >= 12) {
      toast({
        title: "Maximum semesters reached",
        description: "You can add up to 12 semesters",
        variant: "destructive",
      });
      return;
    }

    const newSemester: Semester = {
      id: Date.now().toString(),
      name: `Semester ${semesters.length + 1}`,
      courses: [],
    };

    setSemesters([...semesters, newSemester]);
  };

  const removeSemester = (semesterId: string) => {
    setSemesters(semesters.filter(s => s.id !== semesterId));
  };

  const updateSemester = (semesterId: string, updatedSemester: Semester) => {
    setSemesters(semesters.map(s => s.id === semesterId ? updatedSemester : s));
  };

  const getCurrentSemesterGPA = () => {
    if (semesters.length === 0) return 0;

    const lastSemester = semesters[semesters.length - 1];
    let totalGradePoints = 0;
    let totalCredits = 0;

    lastSemester.courses.forEach(course => {
      if (course.grade && gradePoints[course.grade] !== undefined) {
        totalGradePoints += gradePoints[course.grade] * course.credits;
        totalCredits += course.credits;
      }
    });

    return totalCredits > 0 ? Math.round((totalGradePoints / totalCredits) * 100) / 100 : 0;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-8 w-8" />
              <h1 className="text-2xl font-bold">AOU GPA Calculator</h1>
            </div>
            <div className="text-sm opacity-90">
              Arab Open University
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Welcome Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-800 mb-2">Calculate Your GPA</h2>
              <p className="text-gray-600">Select your Faculty, Program, and add your courses to calculate your cumulative and semester GPA</p>
            </div>
          </CardContent>
        </Card>

        {/* Faculty and Program Selection */}
        <FacultyProgramSelection
          selectedFaculty={selectedFaculty}
          selectedProgram={selectedProgram}
          onFacultyChange={setSelectedFaculty}
          onProgramChange={setSelectedProgram}
        />

        {/* Semester Management */}
        {selectedFaculty && selectedProgram && (
          <SemesterManagement
            semesters={semesters}
            selectedProgram={selectedProgram}
            onAddSemester={addSemester}
            onRemoveSemester={removeSemester}
            onUpdateSemester={updateSemester}
          />
        )}

        {/* GPA Calculation */}
        {semesters.length > 0 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-800 flex items-center">
                  <Calculator className="text-primary mr-2" />
                  GPA Calculation
                </h3>
                <Button onClick={calculateGPA} className="flex items-center">
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculate GPA
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-6 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm font-medium opacity-90 mb-2">Cumulative GPA</div>
                    <div className="text-4xl font-bold">{cumulativeGPA.toFixed(2)}</div>
                    <div className="text-sm opacity-75 mt-2">Based on {totalCredits} credits</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-secondary to-yellow-500 text-white p-6 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm font-medium opacity-90 mb-2">Current Semester GPA</div>
                    <div className="text-4xl font-bold">{getCurrentSemesterGPA().toFixed(2)}</div>
                    <div className="text-sm opacity-75 mt-2">Latest semester</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grade Scale */}
        <GradeScale />

        {/* Academic Progress */}
        {semesters.length > 0 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <TrendingUp className="text-primary mr-2" />
                Academic Progress
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{totalCredits}</div>
                  <div className="text-sm text-gray-600">Total Credits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">{completedCourses}</div>
                  <div className="text-sm text-gray-600">Completed Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">{semesters.length}</div>
                  <div className="text-sm text-gray-600">Semesters</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {totalCredits > 0 ? new Date().getFullYear() + Math.ceil((120 - totalCredits) / 15) : "N/A"}
                  </div>
                  <div className="text-sm text-gray-600">Est. Graduation</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Arab Open University - GPA Calculator</p>
        </div>
      </footer>
    </div>
  );
}