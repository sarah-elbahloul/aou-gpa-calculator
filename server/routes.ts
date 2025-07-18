import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./firestore-storage";
import { z } from "zod";
import { insertUserRecordSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {

  // Get all faculties
  app.get("/api/faculties", async (req, res) => {
    try {
      const faculties = await storage.getFaculties();
      res.json(faculties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch faculties" });
    }
  });

  // Get programs by faculty
  app.get("/api/programs/:facultyCode", async (req, res) => {
    try {
      const { facultyCode } = req.params;
      const programs = await storage.getProgramsByFaculty(facultyCode);
      res.json(programs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch programs" });
    }
  });

  // Search courses by query and programCode
  app.get("/api/courses/search", async (req, res) => {
    try {
      const { query, programCode } = req.query;

      if (!query || !programCode) {
        return res.status(400).json({ message: "Query and programCode are required" });
      }

      const courses = await storage.searchCourses(query as string, programCode as string);
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

  // Get user record by sessionId
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
