---
# Your GPA, Your Way! 🚀🎓

---

Ever wish calculating your GPA was less of a headache 🤯 and more of a "poof, it's done!" ✨ kind of deal? Well, **Arab Open University (AOU) students, this one's for you!** 🎉 I've whipped up a super cool, full-stack GPA calculator that's built just for AOU's grading system. Pick your department 🏫, choose your major 📚, plug in your course grades semester by semester 🗓️, and watch your cumulative GPA magically appear! 📈

---

## What Makes This App Tick? ⚙️

I've used some of the snazziest tech out there to make this calculator smooth, fast, and super reliable. 💨

### The Front-End Fun (What you see!) 👀

* **React 18 with TypeScript**: Think of this as the superstar duo 🌟 making everything look good and work flawlessly.
* **Vite**: The secret sauce 🤫 for super-speedy development and slick, optimized builds.
* **Shadcn/ui & Radix UI**: These are our go-to for beautiful, user-friendly components. 💖
* **Tailwind CSS**: Custom styling that makes the app look sharp! 🎨
* **React Query**: Keeps your data fresh and ready. 📊
* **Wouter**: Handles all the navigation behind the scenes. 🗺️
* **React Hook Form & Zod**: Makes filling out forms a breeze and keeps your data squeaky clean. ✅

### The Back-End Brains (What makes it smart!) 🧠

* **Node.js with Express.js**: The powerhouse running the show on the server. 💪
* **TypeScript**: Keeps our code organized and error-free. 🧑‍💻
* **Database**: Firebase Firestore – THE super-flexible NoSQL database, perfect for scalable, real-time data! 🔥

### The Database Blueprint (Where your info lives!) 🏡

I've got a few key places to store all the good stuff:

* `faculties`: All the academic departments. 🏛️
* `programs`: Your specific major, linked to its department. 🔗
* `courses`: The entire course catalog with all the details. 📖
* `user_records`: This is where your session data lives – your chosen faculty, program, and all your semester info. 💾

---

## Meet the Dream Team of Components! 🚀

### On the User's Side (Frontend Heroes) 🦸‍♀️

* **GPACalculator**: The main brain of the operation, handling all the magic. ✨
* **DepartmentMajorSelection**: Simple dropdowns to get you started. 🔽
* **SemesterManagement**: Your control center for adding and organizing semesters and courses. 📆
* **CourseSearch**: Find your courses in a flash! 🔍
* **GradeScale**: See how AOU's grading system translates to grade points. 💯

### Behind the Scenes (Backend Wizards) 🧙‍♂️

* **Storage Layer**: Handles how I save and retrieve your data. 📥📤
* **Route Handlers**: The traffic cops for all our data requests. 🚦
* **Database Integration**: Makes sure our app talks nicely to the database. 🗣️

---

## How It All Works: The Grand Tour! 🎢

1.  **First Stop**: You pick your faculty and program from a handy list. 👇
2.  **Semester Setup**: Create new semesters and start hunting for courses to add. 🎯
3.  **Course Catcher**: Search for courses in real-time – I even stop you from adding duplicates! 🚫👯
4.  **Grade Time!**: Pop in your grades using AOU's grading scale. 📝
5.  **GPA Reveal!**: Watch as your semester and cumulative GPAs are calculated instantly. 🚀
6.  **Save Your Spot**: Your progress is saved in your session, so you can pick up right where you left off! 🔖

---

## Our Awesome Tech Toolbox! 🧰

### Must-Have Tools

* **@tanstack/react-query**: For keeping our server data in tip-top shape. 👍
* **@radix-ui/***: The building blocks for accessible and sleek UI. 🧱
* **react-hook-form**: Makes form handling a walk in the park. 🚶‍♀️
* **zod**: Ensures all your data is valid and correct. ✔️

### Developer Goodies (For the tech-savvy!) 🤓

* **Vite**: Our trusty sidekick for blazing-fast development. ⚡
* **TypeScript**: Keeps our code clean and bug-free. 🐞🚫
* **Tailwind CSS**: For custom, utility-first styling. ✨
* **ESBuild**: Bundles up our JavaScript for super-efficient production builds. 📦

---

## Ready for Prime Time: Deployment! 🚀

### How I Build It 🏗️

* **Frontend**: Vite works its magic to build the React app. 🪄
* **Backend**: ESBuild bundles up the server code for action. 🎬
* **Database**: Drizzle migrations handle all the database schema changes. 🔄

### Getting It Running 🏃‍♀️

* **For Devs**: A simple `npm run dev` gets everything spinning! 💻
* **For the World**: `npm run build` prepares the app for launch! 🌐
* **Database Updates**: `npm run db:push` applies any new database changes. ⬆️

### What You'll Need

Just a few environment variables for any other services I might connect to! 🔑

---