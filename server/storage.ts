import { 
  departments, 
  majors, 
  courses, 
  userRecords,
  type Department, 
  type Major, 
  type Course, 
  type UserRecord, 
  type InsertDepartment, 
  type InsertMajor, 
  type InsertCourse, 
  type InsertUserRecord 
} from "@shared/schema";

export interface IStorage {
  // Department operations
  getDepartments(): Promise<Department[]>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  
  // Major operations
  getMajorsByDepartment(departmentId: string): Promise<Major[]>;
  createMajor(major: InsertMajor): Promise<Major>;
  
  // Course operations
  getCoursesByMajor(majorId: string): Promise<Course[]>;
  searchCourses(query: string, majorId: string): Promise<Course[]>;
  getCourseByCode(code: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  
  // User record operations
  getUserRecord(sessionId: string): Promise<UserRecord | undefined>;
  createUserRecord(userRecord: InsertUserRecord): Promise<UserRecord>;
  updateUserRecord(sessionId: string, userRecord: Partial<InsertUserRecord>): Promise<UserRecord>;
}

export class MemStorage implements IStorage {
  private departments: Map<string, Department> = new Map();
  private majors: Map<string, Major> = new Map();
  private courses: Map<string, Course> = new Map();
  private userRecords: Map<string, UserRecord> = new Map();
  private currentId: number = 1;

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize departments
    const itcDept: Department = { id: 'itc', name: 'Information Technology and Computing' };
    const businessDept: Department = { id: 'business', name: 'Business Studies' };
    const educationDept: Department = { id: 'education', name: 'Education' };
    const englishDept: Department = { id: 'english', name: 'English Language and Literature' };

    this.departments.set(itcDept.id, itcDept);
    this.departments.set(businessDept.id, businessDept);
    this.departments.set(educationDept.id, educationDept);
    this.departments.set(englishDept.id, englishDept);

    // Initialize majors
    const csMajor: Major = { id: 'cs', name: 'Computer Science', departmentId: 'itc' };
    const itMajor: Major = { id: 'it', name: 'Information Technology', departmentId: 'itc' };
    const graphicsMajor: Major = { id: 'graphics', name: 'Graphics and Web Design', departmentId: 'itc' };

    this.majors.set(csMajor.id, csMajor);
    this.majors.set(itMajor.id, itMajor);
    this.majors.set(graphicsMajor.id, graphicsMajor);

    // Initialize courses
    const courses: Course[] = [
      { code: 'EL118', name: 'English Communication Skills', credits: 3, departmentId: 'itc', majorId: 'cs', prerequisites: [] },
      { code: 'MS102', name: 'Mathematics for Computing', credits: 4, departmentId: 'itc', majorId: 'cs', prerequisites: [] },
      { code: 'CS101', name: 'Introduction to Programming', credits: 3, departmentId: 'itc', majorId: 'cs', prerequisites: [] },
      { code: 'CS201', name: 'Data Structures', credits: 4, departmentId: 'itc', majorId: 'cs', prerequisites: ['CS101'] },
      { code: 'CS301', name: 'Database Systems', credits: 3, departmentId: 'itc', majorId: 'cs', prerequisites: ['CS201'] },
      { code: 'IT101', name: 'Introduction to Information Technology', credits: 3, departmentId: 'itc', majorId: 'it', prerequisites: [] },
      { code: 'IT201', name: 'Network Fundamentals', credits: 3, departmentId: 'itc', majorId: 'it', prerequisites: ['IT101'] },
      { code: 'GR101', name: 'Graphic Design Fundamentals', credits: 3, departmentId: 'itc', majorId: 'graphics', prerequisites: [] },
      { code: 'WD101', name: 'Web Design Basics', credits: 3, departmentId: 'itc', majorId: 'graphics', prerequisites: [] },
    ];

    courses.forEach(course => {
      this.courses.set(course.code, course);
    });
  }

  async getDepartments(): Promise<Department[]> {
    return Array.from(this.departments.values());
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const newDepartment: Department = { ...department };
    this.departments.set(newDepartment.id, newDepartment);
    return newDepartment;
  }

  async getMajorsByDepartment(departmentId: string): Promise<Major[]> {
    return Array.from(this.majors.values()).filter(major => major.departmentId === departmentId);
  }

  async createMajor(major: InsertMajor): Promise<Major> {
    const newMajor: Major = { ...major };
    this.majors.set(newMajor.id, newMajor);
    return newMajor;
  }

  async getCoursesByMajor(majorId: string): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(course => course.majorId === majorId);
  }

  async searchCourses(query: string, majorId: string): Promise<Course[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.courses.values()).filter(course => 
      course.majorId === majorId && 
      (course.code.toLowerCase().includes(searchTerm) || 
       course.name.toLowerCase().includes(searchTerm))
    );
  }

  async getCourseByCode(code: string): Promise<Course | undefined> {
    return this.courses.get(code);
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const newCourse: Course = { ...course };
    this.courses.set(newCourse.code, newCourse);
    return newCourse;
  }

  async getUserRecord(sessionId: string): Promise<UserRecord | undefined> {
    return this.userRecords.get(sessionId);
  }

  async createUserRecord(userRecord: InsertUserRecord): Promise<UserRecord> {
    const newUserRecord: UserRecord = {
      ...userRecord,
      id: this.currentId++,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.userRecords.set(newUserRecord.sessionId, newUserRecord);
    return newUserRecord;
  }

  async updateUserRecord(sessionId: string, userRecord: Partial<InsertUserRecord>): Promise<UserRecord> {
    const existing = this.userRecords.get(sessionId);
    if (!existing) {
      throw new Error('User record not found');
    }
    
    const updated: UserRecord = {
      ...existing,
      ...userRecord,
      updatedAt: Date.now(),
    };
    
    this.userRecords.set(sessionId, updated);
    return updated;
  }
}

export const storage = new MemStorage();
