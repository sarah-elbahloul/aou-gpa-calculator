import { useState, useEffect } from "react";
import { FacultyProgramSelection } from "./faculty-program-selection";
import { SemesterManagement } from "./semester-management";
import { GradeScale } from "./grade-scale";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Calculator, GraduationCap, TrendingUp } from "lucide-react";
import { gradePoints, Program, Semester, Course, Faculty } from "@shared/schema";
import { useToast } from "../hooks/use-toast";
import LinkedInIcon from '../assets/LinkedInIcon.svg';
import GitHubIcon from '../assets/GitHubIcon.svg';

export function GPACalculator() {
  // States for static data loaded from JSON
  const [allFaculties, setAllFaculties] = useState<Faculty[]>([]);
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [dataLoadingError, setDataLoadingError] = useState<string | null>(null);

  // User-selected states (these will reset on refresh)
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [requiredCredits, setRequiredCredits] = useState<number | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [cumulativeGPA, setCumulativeGPA] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [completedCourses, setCompletedCourses] = useState(0);

  const { toast } = useToast();

  // Step 1: Load JSON data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const base = import.meta.env.BASE_URL;

        const [facultiesRes, programsRes, coursesRes] = await Promise.all([
          fetch(`${base}faculties.json`),
          fetch(`${base}programs.json`),
          fetch(`${base}courses.json`),
        ]);


        if (!facultiesRes.ok) throw new Error(`Failed to load faculties.json: ${facultiesRes.statusText}`);
        if (!programsRes.ok) throw new Error(`Failed to load programs.json: ${programsRes.statusText}`);
        if (!coursesRes.ok) throw new Error(`Failed to load courses.json: ${coursesRes.statusText}`);

        const facultiesData: Faculty[] = await facultiesRes.json();
        const programsData: Program[] = await programsRes.json();
        const coursesData: Course[] = await coursesRes.json();

        setAllFaculties(facultiesData);
        setAllPrograms(programsData);
        setAllCourses(coursesData);

      } catch (error) {
        console.error("Error loading static data:", error);
        setDataLoadingError("Failed to load academic data. Please try again later.");
        toast({
          title: "Data Loading Error",
          description: "Could not load academic information (faculties, programs, courses).",
          variant: "destructive",
        });
      }
    };
    loadData();
  }, []); // Empty dependency array means this runs once on mount


  // Effect to update requiredCredits when selectedProgram changes
  useEffect(() => {
    if (selectedProgram && allPrograms.length > 0) {
      const program = allPrograms.find(p => p.code === selectedProgram);
      if (program?.requiredCreditHours !== undefined) {
        setRequiredCredits(program.requiredCreditHours);
      } else {
        setRequiredCredits(null); // Reset if program data is not found or credits are missing
      }
    } else {
      setRequiredCredits(null); // Reset if no program is selected
    }
  }, [selectedProgram, allPrograms]); // Depend on selectedProgram and allPrograms data

  // Effect to clear semesters when selected faculty changes (UX improvement)
  useEffect(() => {
    if (selectedFaculty && semesters.length > 0) {
      setSemesters([]); // Clear all semesters
      setCumulativeGPA(0); // Reset GPA
      setTotalCredits(0); // Reset total credits
      setCompletedCourses(0); // Reset completed courses
      setSelectedProgram(""); // Also reset program when faculty changes

      // Show toast only if a faculty was actually selected before and now changed
      if (selectedFaculty !== "" && semesters.length > 0) {
        toast({
          title: "Faculty Changed",
          description: "All semester information has been cleared. Please select a new program and add courses.",
        });
      }
    }
  }, [selectedFaculty]); // Dependency array: React will only re-run if selectedFaculty changes.


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
      id: Date.now().toString(), // Unique ID for the semester
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

  if (dataLoadingError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Data</h2>
          <p className="text-gray-700">{dataLoadingError}</p>
          <p className="text-sm text-gray-500 mt-2">Please ensure `faculties.json`, `programs.json`, and `courses.json` are in your public folder.</p>
        </Card>
      </div>
    );
  }

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
            Choose your faculty & program, add your courses & grades, and watch your GPA appear in real-time!
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Please note: Your data will reset if you refresh or close the page.
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
          allFaculties={allFaculties} // Pass loaded faculties
          allPrograms={allPrograms}   // Pass loaded programs
        />

        {/* Semester Management */}
        {selectedFaculty && selectedProgram && (
          <SemesterManagement
            semesters={semesters}
            selectedFaculty={selectedFaculty}
            allCourses={allCourses} // Pass loaded courses
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
                    {/* Simplified loading state as programData is no longer an API call */}
                    {allPrograms.length === 0
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