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
import LinkedInIcon from '../assets/LinkedInIcon.svg';
import GitHubIcon from '../assets/GitHubIcon.svg';
import type { Course, Program, Semester } from "@shared/schema";

// Helper function to get or generate session ID
const getOrCreateSessionId = () => {
  let sessionId = localStorage.getItem('gpa_calculator_session_id');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substr(2, 9);
    localStorage.setItem('gpa_calculator_session_id', sessionId);
  }
  return sessionId;
};


export function GPACalculator() {
  // Initialize sessionId by trying to get it from localStorage, or creating a new one
  const [sessionId] = useState(getOrCreateSessionId); // State to manage a unique session ID for user data persistence
  const [selectedFaculty, setSelectedFaculty] = useState(""); // State to store the currently selected faculty
  const [selectedProgram, setSelectedProgram] = useState(""); // State to store the currently selected program within the faculty
  const [requiredCredits, setRequiredCredits] = useState<number | null>(null); // State to store the total required credits for the selected program
  const [semesters, setSemesters] = useState<Semester[]>([]); // State to store the list of semesters, each containing courses
  const [cumulativeGPA, setCumulativeGPA] = useState(0); // State to store the calculated cumulative GPA
  const [totalCredits, setTotalCredits] = useState(0); // State to store the total credits earned across all semesters
  const [completedCourses, setCompletedCourses] = useState(0); // State to store the number of courses completed

  // Add a state to track if initial load is complete and data is hydrated
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  const { toast } = useToast(); // Hook to access the toast notification system
  const queryClient = useQueryClient(); // Hook to interact with the React Query cache

  /**
   * useQuery hook to load user record from the API.
   * This fetches saved faculty, program, and semester data for the current session.
   * The data is fetched only once per session and cached.
   */
  const { data: userRecord } = useQuery<UserRecord | undefined>({
    queryKey: ['/api/user-record', sessionId],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/user-record/${sessionId}`);
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

  /**
   * useQuery hook to fetch program details (e.g., required credit hours).
   * This query is enabled only when a program is selected.
   */
  const { data: programData, isLoading: isLoadingProgram } = useQuery<Program | undefined>({
    queryKey: ['/api/programs', selectedProgram],
    queryFn: async () => {
      if (!selectedProgram) return undefined;
      try {
        const response = await apiRequest('GET', `/api/program-details?programCode=${encodeURIComponent(selectedProgram)}`);
        if (!response.ok) {
          if (response.status === 404) {
            console.warn(`Program details not found for: ${selectedProgram}`);
            return undefined;
          }
          throw new Error('Network response was not ok');
        }
        return response.json();
      } catch (error) {
        console.error("Error fetching program details:", error);
        return undefined;
      }
    },
    enabled: !!selectedProgram, // Only enable this query if a program is selected
    staleTime: Infinity,
  });

  /**
   * useEffect hook to update the `requiredCredits` state when `programData` changes.
   * This ensures the required credits are always in sync with the selected program.
   */
  useEffect(() => {
    if (programData?.requiredCreditHours !== undefined) {
      setRequiredCredits(programData.requiredCreditHours);
    } else {
      setRequiredCredits(null); // Reset if programData is not found or credits are missing
    }
  }, [programData]);


  /**
   * useEffect hook to clear all semester information when the selected faculty changes.
   * This ensures that old semester data from a different faculty is not retained.
   */
  useEffect(() => {
    // Only clear semesters if selectedFaculty actually changes and is not initially empty
    // This code runs AFTER every render where 'selectedFaculty' has changed.
    if (selectedFaculty && userRecord && userRecord.facultyCode !== selectedFaculty) {
      setSemesters([]); // Clear all semesters
      setCumulativeGPA(0); // Reset GPA
      setTotalCredits(0); // Reset total credits
      setCompletedCourses(0); // Reset completed courses
      setSelectedProgram("");
      toast({
        title: "Faculty Changed",
        description: "All semester information has been cleared.",
      });
    }
  }, [selectedFaculty]); // Dependency array: React will only re-run the code inside the useEffect if any of the values in this array have changed since the last render.

  /**
   * useMutation hook for saving a new user record to the API.
   * Invalidates the user record query on success to refetch the latest data.
   */

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

  /**
   * useMutation hook for updating an existing user record in the API.
   * Invalidates the user record query on success to refetch the latest data.
   */
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

  /**
   * useEffect hook to load saved user data into the component's state
   * once the `userRecord` is fetched.
   */
  // Load saved data
  useEffect(() => {
    if (userRecord) {
      setSelectedFaculty(userRecord.facultyCode || "");
      setSelectedProgram(userRecord.programCode || "");
      setSemesters(userRecord.semesters || []);
    }
  }, [userRecord]);

  /**
   * useEffect hook to load saved user data into the component's state
   * once the `userRecord` is fetched.
   */
  useEffect(() => {
    if (userRecord) {
      setSelectedFaculty(userRecord.facultyCode || "");
      setSelectedProgram(userRecord.programCode || "");
      setSemesters(userRecord.semesters || []);
      setIsInitialLoadComplete(true); // Mark initial load as complete
    } else if (userRecord === undefined && !isInitialLoadComplete) {
      // If userRecord is explicitly undefined (e.g., 404) and it's the very first load attempt,
      // we can consider the initial load complete and ready to potentially save a new record.
      // This handles the case where no record exists initially.
      setIsInitialLoadComplete(true);
    }
  }, [userRecord]);


  // Save data when it changes
  useEffect(() => {
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
  }, [selectedFaculty, selectedProgram, semesters,]);






  /**
   * Calculates the cumulative GPA based on all courses across all semesters.
   * Updates `cumulativeGPA`, `totalCredits`, and `completedCourses` states.
   * Displays a toast notification with the calculated GPA.
   */
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

  /**
   * Adds a new semester to the list of semesters.
   * Limits the number of semesters to 12 and shows a toast if the limit is reached.
   */
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

  /**
   * Removes a semester from the list based on its ID.
   * @param semesterId The ID of the semester to remove.
   */
  const removeSemester = (semesterId: string) => {
    setSemesters(semesters.filter(s => s.id !== semesterId));
  };

  /**
   * Updates an existing semester in the list.
   * @param semesterId The ID of the semester to update.
   * @param updatedSemester The new semester object to replace the old one.
   */
  const updateSemester = (semesterId: string, updatedSemester: Semester) => {
    setSemesters(semesters.map(s => s.id === semesterId ? updatedSemester : s));
  };


  /**
   * Calculates the GPA for the most recently added semester.
   * Returns 0 if no semesters exist.
   * @returns The GPA of the current (last) semester, rounded to two decimal places.
   */
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

  // Determine the remaining credits and estimated graduation year
  const remainingCredits = requiredCredits !== null ? Math.max(0, requiredCredits - totalCredits) : null;
  // Estimate years remaining based on remaining credits (assuming 15 credits per year for simplicity)
  const estimatedYearsRemaining = remainingCredits !== null && remainingCredits > 0
    ? Math.ceil(remainingCredits / 15)
    : 0;

  // Calculate estimated graduation year
  const estimatedGraduationYear = (remainingCredits !== null && totalCredits > 0)
    ? new Date().getFullYear() + estimatedYearsRemaining
    : "N/A";

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
          </div>
        </div>
      </header>

      {/* Hero Intro Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8 text-center max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-800 mb-3">
            🎓 Your GPA, Your Way — Instantly!
          </h2>
          <p className="text-gray-700 text-base md:text-lg">
            A smart and simple GPA calculator designed exclusively for <strong>Arab Open University</strong> students.
            Choose your faculty & program, add your courses & grades, and watch your GPA appear in real-time! — no logins, no setup!
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Your progress is saved automatically in your session — so feel free to come back anytime. 📌
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 max-w-4xl">

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
            selectedFaculty={selectedFaculty}
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
                    {isLoadingProgram
                      ? "Loading..."
                      : requiredCredits !== null
                        ? estimatedGraduationYear
                        : "N/A"}
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
          <div className="flex justify-center items-center mt-2 space-x-4">
            <p>Built by sarah-elbahloul </p>
            <a
              href="https://www.linkedin.com/in/sarah-elbahloul/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              <img
                src={LinkedInIcon}
                alt="LinkedIn"
                className="w-6 h-6 inline-block"
              />
              <span className="sr-only">LinkedIn</span>
            </a>
            <a
              href="https://github.com/sarah-elbahloul"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              <img
                src={GitHubIcon}
                alt="GitHub"
                className="w-6 h-6 inline-block"
              />
              <span className="sr-only">GitHub</span>
            </a>
          </div>
        </div>
      </footer>

    </div >
  );
}