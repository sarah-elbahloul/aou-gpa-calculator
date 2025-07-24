import { z } from "zod";

export interface Faculty {
  code: string;
  name: string;
}

export interface Program {
  code: string;
  name: string;
  facultyCode: string;
  requiredCreditHours: number;
}

export interface Course {
  code: string;
  name: string;
  credits: number;
  facultyCode: string[];
  grade?: string;
}

export interface Semester {
  id: string;
  name: string;
  courses: Course[];
}

export const insertFacultySchema = z.object({
  code: z.string().max(50),
  name: z.string(),
});

export const insertProgramSchema = z.object({
  code: z.string().max(50),
  name: z.string(),
  facultyCode: z.string().max(50),
  requiredCreditHours: z.number() // No max needed unless a specific constraint is applicable
});

export const insertCourseSchema = z.object({
  code: z.string().max(20),
  name: z.string(),
  credits: z.number(),
  facultyCode: z.array(z.string().max(4)),
  grade: z.string().max(4).optional(), // Grade is optional on initial course load
});

// Types
export type InsertFaculty = z.infer<typeof insertFacultySchema>;
export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

// Grade mappings (unchanged)
export const gradePoints: Record<string, number> = {
  'A': 4.0,
  'B+': 3.5,
  'B': 3.0,
  'C+': 2.5,
  'C': 2.0,
  'D': 1.5,
  'F': 0.0,
};

export const gradeOptions = Object.keys(gradePoints);