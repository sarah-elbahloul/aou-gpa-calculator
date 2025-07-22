import { z } from "zod";

// Interfaces for Firestore Collections

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
  grade: string;
}

export interface Semester {
  id: string;
  name: string;
  courses: Course[];
}

export interface UserRecord {
  sessionId: string;
  facultyCode: string;
  programCode: string;
  semesters: Semester[];
  createdAt: number;
  updatedAt: number;
}

// Zod Schemas for Validation

export const insertFacultySchema = z.object({
  code: z.string().max(50),
  name: z.string(),
});

export const insertProgramSchema = z.object({
  code: z.string().max(50),
  name: z.string(),
  facultyCode: z.string().max(50),
  requiredCreditHours: z.number().max(3)
});

export const insertCourseSchema = z.object({
  code: z.string().max(20),
  name: z.string(),
  credits: z.number(),
  facultyCode: z.array(z.string().max(4)),
  grade: z.string().max(4),
});

export const insertUserRecordSchema = z.object({
  sessionId: z.string().max(100),
  facultyCode: z.string().max(50),
  programCode: z.string().max(50),
  semesters: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      courses: z.array(
        z.object({
          code: z.string(),
          name: z.string(),
          credits: z.number(),
          facultyCode: z.array(z.string().max(3)),
          grade: z.string(),
        })
      ),
    })
  ),
});

// Types

export type InsertFaculty = z.infer<typeof insertFacultySchema>;
export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertUserRecord = z.infer<typeof insertUserRecordSchema>;

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
