import { pgTable, text, serial, integer, real, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const departments = pgTable("departments", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: text("name").notNull(),
});

export const majors = pgTable("majors", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: text("name").notNull(),
  departmentId: varchar("department_id", { length: 50 }).notNull(),
});

export const courses = pgTable("courses", {
  code: varchar("code", { length: 20 }).primaryKey(),
  name: text("name").notNull(),
  credits: integer("credits").notNull(),
  departmentId: varchar("department_id", { length: 50 }).notNull(),
  majorId: varchar("major_id", { length: 50 }).notNull(),
  prerequisites: jsonb("prerequisites").$type<string[]>().default([]),
});

export const userRecords = pgTable("user_records", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  departmentId: varchar("department_id", { length: 50 }).notNull(),
  majorId: varchar("major_id", { length: 50 }).notNull(),
  semesters: jsonb("semesters").$type<{
    id: string;
    name: string;
    courses: {
      code: string;
      name: string;
      credits: number;
      grade: string;
    }[];
  }[]>().default([]),
  createdAt: integer("created_at").default(Date.now()),
  updatedAt: integer("updated_at").default(Date.now()),
});

export const insertDepartmentSchema = createInsertSchema(departments);
export const insertMajorSchema = createInsertSchema(majors);
export const insertCourseSchema = createInsertSchema(courses);
export const insertUserRecordSchema = createInsertSchema(userRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Department = typeof departments.$inferSelect;
export type Major = typeof majors.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type UserRecord = typeof userRecords.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type InsertMajor = z.infer<typeof insertMajorSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertUserRecord = z.infer<typeof insertUserRecordSchema>;

export const gradePoints: Record<string, number> = {
  'A': 4.0,
  'B+': 3.5,
  'B': 3.0,
  'C+': 2.5,
  'C': 2.0,
  'D': 1.5,
  'F': 0.0
};

export const gradeOptions = Object.keys(gradePoints);
