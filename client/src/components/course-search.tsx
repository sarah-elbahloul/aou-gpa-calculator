import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Course } from "@shared/schema";

interface CourseSearchProps {
  selectedMajor: string;
  onCourseSelect: (course: Course) => void;
  existingCourses: string[];
}

export function CourseSearch({ selectedMajor, onCourseSelect, existingCourses }: CourseSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const { data: searchResults = [], isLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses/search', searchQuery, selectedMajor],
    queryFn: () => fetch(`/api/courses/search?query=${encodeURIComponent(searchQuery)}&majorId=${encodeURIComponent(selectedMajor)}`).then(res => res.json()),
    enabled: !!searchQuery && searchQuery.length > 1 && !!selectedMajor,
  });

  useEffect(() => {
    setShowResults(searchQuery.length > 1 && searchResults.length > 0);
  }, [searchQuery, searchResults]);

  const handleCourseSelect = (course: Course) => {
    if (existingCourses.includes(course.code)) {
      toast({
        title: "Course already added",
        description: `${course.code} is already in this semester`,
        variant: "destructive",
      });
      return;
    }

    onCourseSelect({ ...course, grade: "" });
    setSearchQuery("");
    setShowResults(false);
    
    toast({
      title: "Course added",
      description: `${course.code} - ${course.name} has been added to the semester`,
    });
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">Search and Add Courses</label>
      <div className="relative">
        <Input
          type="text"
          placeholder="Enter course code (e.g., EL118, MS102)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowResults(searchQuery.length > 1 && searchResults.length > 0)}
          className="pr-10"
        />
        <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
      </div>
      
      {showResults && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : searchResults.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No courses found</div>
          ) : (
            searchResults.map((course) => {
              const isAlreadyAdded = existingCourses.includes(course.code);
              return (
                <div
                  key={course.code}
                  className={`p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 flex items-center justify-between ${
                    isAlreadyAdded ? 'opacity-50' : ''
                  }`}
                  onClick={() => !isAlreadyAdded && handleCourseSelect(course)}
                >
                  <div>
                    <div className="font-medium">{course.code} - {course.name}</div>
                    <div className="text-sm text-gray-600">Credits: {course.credits}</div>
                  </div>
                  {isAlreadyAdded ? (
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                      Added
                    </span>
                  ) : (
                    <Button size="sm" variant="outline">
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
      
      {showResults && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
