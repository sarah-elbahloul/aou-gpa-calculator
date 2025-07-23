import { Firestore, getFirestore, collection, getDocs, query, where, doc, getDoc, setDoc } from "firebase/firestore";
import { initializeApp, type FirebaseApp } from "firebase/app";
import type { Faculty, Program, Course, UserRecord, InsertUserRecord, InsertFaculty, InsertProgram, InsertCourse } from "@shared/schema";
import { insertFacultySchema, insertProgramSchema, insertCourseSchema, insertUserRecordSchema } from "@shared/schema";
import dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export class FirestoreStorage {
    private app!: FirebaseApp;
    private db!: Firestore;

    async initializeFirestore() {
        this.app = initializeApp(firebaseConfig);
        this.db = getFirestore(this.app);
    }

    // Faculties
    async getFaculties(): Promise<Faculty[]> {
        const facultiesCol = collection(this.db, "faculties");
        const snapshot = await getDocs(facultiesCol);
        return snapshot.docs.map(doc => doc.data() as Faculty);
    }

    async createFaculty(faculty: InsertFaculty): Promise<Faculty> {
        insertFacultySchema.parse(faculty);
        const facultiesCol = collection(this.db, "faculties");
        await setDoc(doc(facultiesCol, faculty.code), faculty);
        return faculty;
    }

    // Programs by facultyCode
    async getProgramsByFaculty(facultyCode: string): Promise<Program[]> {
        const programsCol = collection(this.db, "programs");
        const q = query(programsCol, where("facultyCode", "==", facultyCode));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as Program);
    }

    async createProgram(program: InsertProgram): Promise<Program> {
        insertProgramSchema.parse(program);
        const programsCol = collection(this.db, "programs");
        await setDoc(doc(programsCol, program.code), program);
        return program;
    }

    // Get a single program's details by programCode
    async getProgramDetails(programCode: string): Promise<Program | undefined> {
        const programsCol = collection(this.db, "programs");
        const q = query(programsCol, where("code", "==", programCode));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return undefined;
        }
        const programData = snapshot.docs[0].data() as Program;
        return programData;
    }

    // Courses by facultyCode plus search
    async searchCourses(queryStr: string, facultyCode: string): Promise<Course[]> {
        const coursesCol = collection(this.db, "courses");
        const q = query(
            coursesCol,
            where("facultyCode", "array-contains", facultyCode),
            where("code", ">=", queryStr.toUpperCase()),
            where("code", "<=", queryStr.toUpperCase() + "\uf8ff")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as Course);
    }

    async getCourseByCode(code: string): Promise<Course | null> {
        const coursesCol = collection(this.db, "courses");
        const docRef = doc(coursesCol, code);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as Course;
        }
        return null;
    }

    async createCourse(course: InsertCourse): Promise<Course> {
        insertCourseSchema.parse(course);
        const coursesCol = collection(this.db, "courses");
        await setDoc(doc(coursesCol, course.code), course);
        return course;
    }

    // UserRecords by sessionId
    async getUserRecord(sessionId: string): Promise<UserRecord | null> {
        const userRecordsCol = collection(this.db, "userrecords");
        const docRef = doc(userRecordsCol, sessionId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as UserRecord;
        }
        return null;
    }

    async createUserRecord(record: InsertUserRecord): Promise<UserRecord> {
        insertUserRecordSchema.parse(record);
        const userRecordsCol = collection(this.db, "userrecords");
        const now = Date.now();
        const recordWithTimestamps = { ...record, createdAt: now, updatedAt: now };
        await setDoc(doc(userRecordsCol, record.sessionId), recordWithTimestamps);
        return recordWithTimestamps;
    }

    async updateUserRecord(sessionId: string, partialRecord: Partial<InsertUserRecord>): Promise<UserRecord> {
        // For partial updates, validate partialRecord carefully
        const userRecordsCol = collection(this.db, "userrecords");
        const docRef = doc(userRecordsCol, sessionId);
        const existingDoc = await getDoc(docRef);
        if (!existingDoc.exists()) {
            throw new Error("User record does not exist");
        }
        const existingData = existingDoc.data() as UserRecord;
        const updatedData = {
            ...existingData,
            ...partialRecord,
            updatedAt: Date.now(),
        };
        insertUserRecordSchema.parse(updatedData); // validate full data
        await setDoc(docRef, updatedData);
        return updatedData;
    }
}

export const storage = new FirestoreStorage();
