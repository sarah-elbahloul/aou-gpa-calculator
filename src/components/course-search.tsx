import { useState, useMemo } from "react"; // Added useMemo
import { Button } from "../components/ui/button";
import { Search } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import type { Course } from "@shared/schema";

// Importing Shadcn UI components for a better search/select experience
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";


interface CourseSearchProps {
  allCourses: Course[];
  selectedFaculty: string;
  onCourseSelect: (course: Course) => void;
  existingCourses: string[];
}

export function CourseSearch({
  allCourses, // Destructure new prop
  selectedFaculty,
  onCourseSelect,
  existingCourses,
}: CourseSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false); // State to control popover visibility
  const { toast } = useToast();

  // Use useMemo to filter courses locally
  const filteredCourses = useMemo(() => {
    if (!selectedFaculty || !allCourses.length) {
      return []; // No faculty selected or no courses loaded yet
    }

    // Filter by selected faculty (course's facultyCode array must include the selectedFaculty)
    let coursesByFaculty = allCourses.filter(course =>
      course.facultyCode.includes(selectedFaculty)
    );

    // Further filter by search query (case-insensitive)
    if (searchQuery.length > 1) { // Only filter by query if it's long enough
      coursesByFaculty = coursesByFaculty.filter(
        (course) =>
          course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter out courses that are already added to the current semester
    return coursesByFaculty.filter(
      (course) => !existingCourses.includes(course.code)
    );
  }, [allCourses, selectedFaculty, searchQuery, existingCourses]);

  const handleCourseSelect = (course: Course) => {
    if (existingCourses.includes(course.code)) {
      toast({
        title: "Course already added",
        description: `${course.code} is already in this semester`,
        variant: "destructive",
      });
      return;
    }

    onCourseSelect({ ...course, grade: "" }); // Add a default empty grade
    setSearchQuery(""); // Clear search input
    setOpen(false); // Close the popover after selection

    toast({
      title: "Course added",
      description: `${course.code} - ${course.name} has been added to the semester`,
    });
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">Search and Add Courses</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            // Disable if no faculty selected or no courses loaded
            disabled={!selectedFaculty || allCourses.length === 0}
          >
            {selectedFaculty
              ? (searchQuery || "Search for a course...")
              : "Select a Faculty first to search courses"}
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput
              placeholder="Search courses..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {/* Show loading state if allCourses is empty */}
              {allCourses.length === 0 ? (
                <CommandEmpty>Loading courses...</CommandEmpty>
              ) : filteredCourses.length === 0 && searchQuery.length > 1 ? (
                <CommandEmpty>No courses found matching your search for this faculty.</CommandEmpty>
              ) : filteredCourses.length === 0 && searchQuery.length <= 1 && selectedFaculty ? (
                <CommandEmpty>Start typing to search for courses.</CommandEmpty>
              ) : filteredCourses.length === 0 && !selectedFaculty ? (
                <CommandEmpty>Select a faculty to see available courses.</CommandEmpty>
              ) : null}

              <CommandGroup>
                {filteredCourses.map((course) => (
                  <CommandItem
                    key={course.code}
                    value={`${course.code} ${course.name}`} // Value for search matching
                    onSelect={() => handleCourseSelect(course)}
                  >
                    {course.name} ({course.code}) - {course.credits} Credits
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}