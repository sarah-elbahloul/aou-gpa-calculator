// Firebase configuration - user should provide these details
export const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.VITE_FIREBASE_APP_ID || "",
};

// TODO: Initialize Firebase when configuration is provided
// This file is prepared for Firebase integration
// User needs to provide the Firebase configuration details

/*
Required Firebase collections structure:

1. departments:
   - id: string (department ID)
   - name: string (department name)

2. majors:
   - id: string (major ID)
   - name: string (major name)
   - departmentId: string (reference to department)

3. courses:
   - code: string (course code, primary key)
   - name: string (course name)
   - credits: number (credit hours)
   - departmentId: string (reference to department)
   - majorId: string (reference to major)
   - prerequisites: array of strings (prerequisite course codes)

4. user_records:
   - sessionId: string (unique session identifier)
   - departmentId: string (selected department)
   - majorId: string (selected major)
   - semesters: array of objects containing:
     - id: string (semester ID)
     - name: string (semester name)
     - courses: array of objects containing:
       - code: string (course code)
       - name: string (course name)
       - credits: number (credit hours)
       - grade: string (letter grade)
   - createdAt: timestamp
   - updatedAt: timestamp

To enable Firebase:
1. Provide Firebase configuration in environment variables
2. Install Firebase SDK: npm install firebase
3. Implement Firebase initialization and database operations
4. Replace the in-memory storage with Firebase Firestore operations
*/
