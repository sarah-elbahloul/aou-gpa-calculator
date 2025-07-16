import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./firestore-storage";
import { z } from "zod";
import { insertUserRecordSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all departments
  app.get("/api/departments", async (req, res) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  // Get majors by department
  app.get("/api/majors/:departmentId", async (req, res) => {
    try {
      const { departmentId } = req.params;
      const majors = await storage.getMajorsByDepartment(departmentId);
      res.json(majors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch majors" });
    }
  });

  // Search courses
  app.get("/api/courses/search", async (req, res) => {
    try {
      const { query, majorId } = req.query;
      
      if (!query || !majorId) {
        return res.status(400).json({ message: "Query and majorId are required" });
      }

      const courses = await storage.searchCourses(query as string, majorId as string);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to search courses" });
    }
  });

  // Get course by code
  app.get("/api/courses/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const course = await storage.getCourseByCode(code);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  // Get user record
  app.get("/api/user-record/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userRecord = await storage.getUserRecord(sessionId);
      
      if (!userRecord) {
        return res.status(404).json({ message: "User record not found" });
      }
      
      res.json(userRecord);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user record" });
    }
  });

  // Create user record
  app.post("/api/user-record", async (req, res) => {
    try {
      const validatedData = insertUserRecordSchema.parse(req.body);
      const userRecord = await storage.createUserRecord(validatedData);
      res.status(201).json(userRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create user record" });
      }
    }
  });

  // Update user record
  app.put("/api/user-record/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const validatedData = insertUserRecordSchema.partial().parse(req.body);
      const userRecord = await storage.updateUserRecord(sessionId, validatedData);
      res.json(userRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update user record" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
