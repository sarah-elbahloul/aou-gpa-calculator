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
    const businessMajor: Major = { id: 'business', name: 'Business Administration', departmentId: 'business' };
    const accountingMajor: Major = { id: 'accounting', name: 'Accounting', departmentId: 'business' };
    const englishMajor: Major = { id: 'english', name: 'English Language and Literature', departmentId: 'english' };
    const educationMajor: Major = { id: 'education', name: 'Education', departmentId: 'education' };

    this.majors.set(csMajor.id, csMajor);
    this.majors.set(itMajor.id, itMajor);
    this.majors.set(graphicsMajor.id, graphicsMajor);
    this.majors.set(businessMajor.id, businessMajor);
    this.majors.set(accountingMajor.id, accountingMajor);
    this.majors.set(englishMajor.id, englishMajor);
    this.majors.set(educationMajor.id, educationMajor);

    // Initialize courses with official AOU data
    const courses: Course[] = [
      // General courses
      { code: 'GT101', name: 'Learning and Information Technology', credits: 3, departmentId: 'itc', majorId: 'cs', prerequisites: [] },
      { code: 'EL118', name: 'Reading', credits: 4, departmentId: 'english', majorId: 'cs', prerequisites: ['EL112'] },
      
      // Computer Science courses
      { code: 'M110', name: 'Python Programming', credits: 8, departmentId: 'itc', majorId: 'cs', prerequisites: [] },
      { code: 'M115', name: 'Python for ML and DS', credits: 3, departmentId: 'itc', majorId: 'cs', prerequisites: ['M110'] },
      { code: 'M109', name: '.NET Programming', credits: 3, departmentId: 'itc', majorId: 'cs', prerequisites: ['M110'] },
      
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
      
      // Additional Math courses
      { code: 'MS102', name: 'Mathematics for Computing', credits: 4, departmentId: 'itc', majorId: 'cs', prerequisites: [] },
      { code: 'MS103', name: 'Statistics for Computing', credits: 4, departmentId: 'itc', majorId: 'cs', prerequisites: ['MS102'] },
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
