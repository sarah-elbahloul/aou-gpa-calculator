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


  /**
   * useEffect hook to save or update user data whenever relevant state changes.
   * It checks if a user record already exists to decide between saving or updating.
   * It also prevents unnecessary API calls while mutations are pending.
   */
  useEffect(() => {
    // Only attempt to save/update once the initial userRecord has been processed and we have a faculty/program selected.
    if (!isInitialLoadComplete || !selectedFaculty || !selectedProgram) {
      return;
    }

    const currentData = {
      sessionId,
      facultyCode: selectedFaculty,
      programCode: selectedProgram,
      semesters,
    };

    // Prevent immediate re-trigger if mutations are pending or if data hasn't truly changed
    if (saveUserRecord.isPending || updateUserRecord.isPending) {
      return;
    }

    // OPTIMIZATION: Check if the data has actually changed before mutating
    // This is crucial to prevent unnecessary Firestore writes.
    // Perform a deep comparison if `semesters` can be large or complex.
    // For basic types and simple arrays, a shallow comparison might be enough,
    // but for semesters with courses, deep comparison is safer.
    const hasDataChanged =
      userRecord?.facultyCode !== currentData.facultyCode ||
      userRecord?.programCode !== currentData.programCode ||
      // Simple JSON stringify comparison for semesters.
      // Be cautious with this for very large objects, but it's often practical.
      JSON.stringify(userRecord?.semesters || []) !== JSON.stringify(currentData.semesters);

    if (!hasDataChanged && userRecord) {
      // If data hasn't changed and a userRecord already exists, no need to update.
      return;
    }

    // Decide whether to update existing or save new
    if (userRecord) {
      updateUserRecord.mutate(currentData);
    } else {
      // Only save a new record if it genuinely doesn't exist yet based on userRecord being undefined.
      saveUserRecord.mutate(currentData);
    }

  }, [selectedFaculty, selectedProgram, semesters, userRecord, isInitialLoadComplete, saveUserRecord.isPending, updateUserRecord.isPending]);

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
                        : "N/A"
                    }
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
            <p>Built by Sarah Elbahloul</p>
            <a
              href="https://www.linkedin.com/in/sarah-elbahloul/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              <svg
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-6 h-6"
                aria-hidden="true"
              >
                {LinkedInIcon}
                <path d="M16.35 16.35h-2.1c0 0 0-3.69 0-3.9 0-.21.09-.43.3-.59.21-.16.51-.21.71-.21.9 0 1.21.68 1.21 1.63v3.07zM20 20h-3.69v-5.83c0-1.42-.51-2.3-1.89-2.3-1.02 0-1.63.68-1.89 1.34h-.05v-1.12H10V20h3.7V14.3c0-.1.01-.2.02-.31.07-.4.32-.67.75-.67.54 0 .9.39.9.96V20H20v-.05zM7.17 9.12a2 2 0 10-.01-4 2 2 0 000 4zM5.27 20H9V9.17H5.27V20zM22 0H2C.9 0 0 .9 0 2v20c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2z" />
              </svg>
              <span className="sr-only">LinkedIn</span>
            </a>
            <a
              href="https://github.com/sarah-elbahloul"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              <svg
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-6 h-6"
                aria-hidden="true"
              >
                {GitHubIcon}
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.418 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.529 2.341 1.088 2.91.829.091-.642.359-1.083.654-1.334-2.22-.253-4.555-1.113-4.555-4.93 0-1.09.39-1.984 1.029-2.685-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.701.12 2.499.356 1.909-1.296 2.747-1.025 2.747-1.025.546 1.379.202 2.398.099 2.65.64.701 1.029 1.595 1.029 2.685 0 3.826-2.339 4.673-4.566 4.92.369.317.672.92.672 1.855 0 1.33-.012 2.41-.012 2.727 0 .267.18.577.688.484C21.137 20.28 24 16.518 24 12.017 24 6.484 19.522 2 14 2h-2z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="sr-only">GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}