import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  setDoc, 
  query, 
  where, 
  orderBy,
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase-config';
import { 
  type Department, 
  type Major, 
  type Course, 
  type UserRecord, 
  type InsertDepartment, 
  type InsertMajor, 
  type InsertCourse, 
  type InsertUserRecord 
} from "@shared/schema";
import { IStorage } from './storage';

export class FirestoreStorage implements IStorage {
  
  // Department operations
  async getDepartments(): Promise<Department[]> {
    try {
      const snapshot = await getDocs(collection(db, 'departments'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Department);
    } catch (error) {
      console.error('Error getting departments:', error);
      // Fallback to hardcoded data if Firestore permissions are not configured
      return [
        { id: 'itc', name: 'Information Technology and Computing' },
        { id: 'business', name: 'Business Studies' },
        { id: 'education', name: 'Education' },
        { id: 'english', name: 'English Language and Literature' }
      ];
    }
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    try {
      const docRef = await addDoc(collection(db, 'departments'), department);
      return { id: docRef.id, ...department };
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  }

  // Major operations
  async getMajorsByDepartment(departmentId: string): Promise<Major[]> {
    try {
      const q = query(
        collection(db, 'majors'), 
        where('departmentId', '==', departmentId),
        orderBy('name')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Major);
    } catch (error) {
      console.error('Error getting majors by department:', error);
      // Fallback to hardcoded data if Firestore permissions are not configured
      const allMajors = [
        { id: 'cs', name: 'Computer Science', departmentId: 'itc' },
        { id: 'it', name: 'Information Technology', departmentId: 'itc' },
        { id: 'graphics', name: 'Graphics and Web Design', departmentId: 'itc' },
        { id: 'business', name: 'Business Administration', departmentId: 'business' },
        { id: 'accounting', name: 'Accounting', departmentId: 'business' },
        { id: 'english', name: 'English Language and Literature', departmentId: 'english' },
        { id: 'education', name: 'Education', departmentId: 'education' }
      ];
      return allMajors.filter(major => major.departmentId === departmentId);
    }
  }

  async createMajor(major: InsertMajor): Promise<Major> {
    try {
      const docRef = await addDoc(collection(db, 'majors'), major);
      return { id: docRef.id, ...major };
    } catch (error) {
      console.error('Error creating major:', error);
      throw error;
    }
  }

  // Course operations
  async getCoursesByMajor(majorId: string): Promise<Course[]> {
    try {
      const q = query(
        collection(db, 'courses'), 
        where('majorId', '==', majorId),
        orderBy('code')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data() }) as Course);
    } catch (error) {
      console.error('Error getting courses by major:', error);
      return [];
    }
  }

  async searchCourses(searchQuery: string, majorId: string): Promise<Course[]> {
    try {
      // Get all courses for the major first
      const coursesQuery = query(
        collection(db, 'courses'),
        where('majorId', '==', majorId),
        orderBy('code')
      );
      
      const snapshot = await getDocs(coursesQuery);
      const courses = snapshot.docs.map(doc => ({ ...doc.data() }) as Course);
      
      // Filter courses based on search query (case-insensitive)
      const searchTerm = searchQuery.toLowerCase();
      return courses.filter(course => 
        course.code.toLowerCase().includes(searchTerm) ||
        course.name.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('Error searching courses:', error);
      // Fallback to hardcoded data if Firestore permissions are not configured
      const allCourses = this.getFallbackCourses();
      const searchTerm = searchQuery.toLowerCase();
      return allCourses.filter(course => 
        course.majorId === majorId &&
        (course.code.toLowerCase().includes(searchTerm) ||
         course.name.toLowerCase().includes(searchTerm))
      );
    }
  }

  async getCourseByCode(code: string): Promise<Course | undefined> {
    try {
      const q = query(
        collection(db, 'courses'),
        where('code', '==', code),
        limit(1)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        return { ...snapshot.docs[0].data() } as Course;
      }
      return undefined;
    } catch (error) {
      console.error('Error getting course by code:', error);
      return undefined;
    }
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    try {
      await setDoc(doc(db, 'courses', course.code), course);
      return { ...course };
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  // User record operations
  async getUserRecord(sessionId: string): Promise<UserRecord | undefined> {
    try {
      const docRef = doc(db, 'user_records', sessionId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { ...docSnap.data() } as UserRecord;
      }
      return undefined;
    } catch (error) {
      console.error('Error getting user record:', error);
      return undefined;
    }
  }

  async createUserRecord(userRecord: InsertUserRecord): Promise<UserRecord> {
    try {
      const record = {
        ...userRecord,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      await setDoc(doc(db, 'user_records', userRecord.sessionId), record);
      return { id: Date.now(), ...record };
    } catch (error) {
      console.error('Error creating user record:', error);
      throw error;
    }
  }

  async updateUserRecord(sessionId: string, userRecord: Partial<InsertUserRecord>): Promise<UserRecord> {
    try {
      const docRef = doc(db, 'user_records', sessionId);
      const updateData = {
        ...userRecord,
        updatedAt: Date.now()
      };
      
      await updateDoc(docRef, updateData);
      
      // Get the updated record
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { ...docSnap.data() } as UserRecord;
      }
      throw new Error('Failed to retrieve updated user record');
    } catch (error) {
      console.error('Error updating user record:', error);
      throw error;
    }
  }

  // Initialize Firestore with default data
  async initializeFirestore(): Promise<void> {
    try {
      await this.initializeDepartments();
      await this.initializeMajors();
      await this.initializeCourses();
      console.log('Firestore initialized with default data');
    } catch (error) {
      console.error('Error initializing Firestore:', error);
    }
  }

  private async initializeDepartments(): Promise<void> {
    const departments = [
      { id: 'itc', name: 'Information Technology and Computing' },
      { id: 'business', name: 'Business Studies' },
      { id: 'education', name: 'Education' },
      { id: 'english', name: 'English Language and Literature' }
    ];

    for (const dept of departments) {
      await setDoc(doc(db, 'departments', dept.id), dept);
    }
  }

  private async initializeMajors(): Promise<void> {
    const majors = [
      { id: 'cs', name: 'Computer Science', departmentId: 'itc' },
      { id: 'it', name: 'Information Technology', departmentId: 'itc' },
      { id: 'graphics', name: 'Graphics and Web Design', departmentId: 'itc' },
      { id: 'business', name: 'Business Administration', departmentId: 'business' },
      { id: 'accounting', name: 'Accounting', departmentId: 'business' },
      { id: 'english', name: 'English Language and Literature', departmentId: 'english' },
      { id: 'education', name: 'Education', departmentId: 'education' }
    ];

    for (const major of majors) {
      await setDoc(doc(db, 'majors', major.id), major);
    }
  }

  private async initializeCourses(): Promise<void> {
    const courses = [
      // General courses
      { code: 'GT101', name: 'Learning and Information Technology', credits: 3, departmentId: 'itc', majorId: 'cs', prerequisites: [] },
      { code: 'EL118', name: 'Reading', credits: 4, departmentId: 'english', majorId: 'cs', prerequisites: ['EL112'] },
      
      // Computer Science courses
      { code: 'M110', name: 'Python Programming', credits: 8, departmentId: 'itc', majorId: 'cs', prerequisites: [] },
      { code: 'M115', name: 'Python for ML and DS', credits: 3, departmentId: 'itc', majorId: 'cs', prerequisites: ['M110'] },
      { code: 'M109', name: '.NET Programming', credits: 3, departmentId: 'itc', majorId: 'cs', prerequisites: ['M110'] },
      { code: 'MS102', name: 'Mathematics for Computing', credits: 4, departmentId: 'itc', majorId: 'cs', prerequisites: [] },
      { code: 'MS103', name: 'Statistics for Computing', credits: 4, departmentId: 'itc', majorId: 'cs', prerequisites: ['MS102'] },
      
      // IT courses
      { code: 'T215A', name: 'Communication and Information Technologies', credits: 8, departmentId: 'itc', majorId: 'it', prerequisites: ['GT101'] },
      { code: 'T215B', name: 'Communication and Information Technologies', credits: 8, departmentId: 'itc', majorId: 'it', prerequisites: ['T215A'] },
      { code: 'T216A', name: 'Cisco Networking', credits: 8, departmentId: 'itc', majorId: 'it', prerequisites: ['T215B'] },
      { code: 'T216B', name: 'Cisco Networking', credits: 8, departmentId: 'itc', majorId: 'it', prerequisites: ['T216A'] },
      
      // Graphics and Web Design courses
      { code: 'GD111', name: 'Introduction to Visual Perception', credits: 4, departmentId: 'itc', majorId: 'graphics', prerequisites: [] },
      { code: 'GD124', name: 'Digital Photography I', credits: 4, departmentId: 'itc', majorId: 'graphics', prerequisites: [] },
      { code: 'GD126', name: 'Introduction to Multimedia Design', credits: 4, departmentId: 'itc', majorId: 'graphics', prerequisites: [] },
      
      // Business courses
      { code: 'BUS110', name: 'Introduction to Business', credits: 8, departmentId: 'business', majorId: 'business', prerequisites: [] },
      { code: 'B207A', name: 'Shaping Business Opportunities', credits: 8, departmentId: 'business', majorId: 'business', prerequisites: ['BUS110'] },
      { code: 'B207B', name: 'Shaping Business Opportunities', credits: 8, departmentId: 'business', majorId: 'business', prerequisites: ['B207A'] },
      { code: 'BUS310', name: 'Strategic Management', credits: 8, departmentId: 'business', majorId: 'business', prerequisites: ['B207B'] },
      
      // Accounting courses
      { code: 'ACC101', name: 'Principles of Accounting', credits: 8, departmentId: 'business', majorId: 'accounting', prerequisites: [] },
      { code: 'ACC201', name: 'Financial Accounting', credits: 8, departmentId: 'business', majorId: 'accounting', prerequisites: ['ACC101'] },
      { code: 'ACC301', name: 'Management Accounting', credits: 8, departmentId: 'business', majorId: 'accounting', prerequisites: ['ACC201'] },
      
      // English courses
      { code: 'EL112', name: 'English for Academic Purposes', credits: 4, departmentId: 'english', majorId: 'english', prerequisites: [] },
      { code: 'EL119', name: 'Writing', credits: 4, departmentId: 'english', majorId: 'english', prerequisites: ['EL112'] },
      { code: 'EL120', name: 'Listening and Speaking', credits: 4, departmentId: 'english', majorId: 'english', prerequisites: ['EL112'] },
      
      // Education courses
      { code: 'ED101', name: 'Introduction to Education', credits: 8, departmentId: 'education', majorId: 'education', prerequisites: [] },
      { code: 'ED201', name: 'Educational Psychology', credits: 8, departmentId: 'education', majorId: 'education', prerequisites: ['ED101'] },
      { code: 'ED301', name: 'Curriculum and Instruction', credits: 8, departmentId: 'education', majorId: 'education', prerequisites: ['ED201'] },
    ];

    for (const course of courses) {
      await setDoc(doc(db, 'courses', course.code), course);
    }
  }
  private getFallbackCourses(): Course[] {
    return [
      // General courses
      { code: 'GT101', name: 'Learning and Information Technology', credits: 3, departmentId: 'itc', majorId: 'cs', prerequisites: [] },
      { code: 'EL118', name: 'Reading', credits: 4, departmentId: 'english', majorId: 'cs', prerequisites: ['EL112'] },
      
      // Computer Science courses
      { code: 'M110', name: 'Python Programming', credits: 8, departmentId: 'itc', majorId: 'cs', prerequisites: [] },
      { code: 'M115', name: 'Python for ML and DS', credits: 3, departmentId: 'itc', majorId: 'cs', prerequisites: ['M110'] },
      { code: 'M109', name: '.NET Programming', credits: 3, departmentId: 'itc', majorId: 'cs', prerequisites: ['M110'] },
      { code: 'MS102', name: 'Mathematics for Computing', credits: 4, departmentId: 'itc', majorId: 'cs', prerequisites: [] },
      { code: 'MS103', name: 'Statistics for Computing', credits: 4, departmentId: 'itc', majorId: 'cs', prerequisites: ['MS102'] },
      
      // IT courses
      { code: 'T215A', name: 'Communication and Information Technologies', credits: 8, departmentId: 'itc', majorId: 'it', prerequisites: ['GT101'] },
      { code: 'T215B', name: 'Communication and Information Technologies', credits: 8, departmentId: 'itc', majorId: 'it', prerequisites: ['T215A'] },
      { code: 'T216A', name: 'Cisco Networking', credits: 8, departmentId: 'itc', majorId: 'it', prerequisites: ['T215B'] },
      { code: 'T216B', name: 'Cisco Networking', credits: 8, departmentId: 'itc', majorId: 'it', prerequisites: ['T216A'] },
      
      // Graphics and Web Design courses
      { code: 'GD111', name: 'Introduction to Visual Perception', credits: 4, departmentId: 'itc', majorId: 'graphics', prerequisites: [] },
      { code: 'GD124', name: 'Digital Photography I', credits: 4, departmentId: 'itc', majorId: 'graphics', prerequisites: [] },
      { code: 'GD126', name: 'Introduction to Multimedia Design', credits: 4, departmentId: 'itc', majorId: 'graphics', prerequisites: [] },
      
      // Business courses
      { code: 'BUS110', name: 'Introduction to Business', credits: 8, departmentId: 'business', majorId: 'business', prerequisites: [] },
      { code: 'B207A', name: 'Shaping Business Opportunities', credits: 8, departmentId: 'business', majorId: 'business', prerequisites: ['BUS110'] },
      { code: 'B207B', name: 'Shaping Business Opportunities', credits: 8, departmentId: 'business', majorId: 'business', prerequisites: ['B207A'] },
      { code: 'BUS310', name: 'Strategic Management', credits: 8, departmentId: 'business', majorId: 'business', prerequisites: ['B207B'] },
      
      // Accounting courses
      { code: 'ACC101', name: 'Principles of Accounting', credits: 8, departmentId: 'business', majorId: 'accounting', prerequisites: [] },
      { code: 'ACC201', name: 'Financial Accounting', credits: 8, departmentId: 'business', majorId: 'accounting', prerequisites: ['ACC101'] },
      { code: 'ACC301', name: 'Management Accounting', credits: 8, departmentId: 'business', majorId: 'accounting', prerequisites: ['ACC201'] },
      
      // English courses
      { code: 'EL112', name: 'English for Academic Purposes', credits: 4, departmentId: 'english', majorId: 'english', prerequisites: [] },
      { code: 'EL119', name: 'Writing', credits: 4, departmentId: 'english', majorId: 'english', prerequisites: ['EL112'] },
      { code: 'EL120', name: 'Listening and Speaking', credits: 4, departmentId: 'english', majorId: 'english', prerequisites: ['EL112'] },
      
      // Education courses
      { code: 'ED101', name: 'Introduction to Education', credits: 8, departmentId: 'education', majorId: 'education', prerequisites: [] },
      { code: 'ED201', name: 'Educational Psychology', credits: 8, departmentId: 'education', majorId: 'education', prerequisites: ['ED101'] },
      { code: 'ED301', name: 'Curriculum and Instruction', credits: 8, departmentId: 'education', majorId: 'education', prerequisites: ['ED201'] },
    ];
  }
}

// Initialize and export the Firestore storage
export const storage = new FirestoreStorage();