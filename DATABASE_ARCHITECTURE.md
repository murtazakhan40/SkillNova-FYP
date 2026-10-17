# SkillNova Academy — Database Architecture & Specification
**BS Computer Science Final Year Project (FYP)**

---

## 1. Executive Summary & Relational Integrity

The **SkillNova Academy** database is architected using **Prisma ORM** with full **Third Normal Form (3NF)** compliance and strict relational integrity constraints. 

It provides an end-to-end data lifecycle for students, instructors, and system administrators, featuring automatic course progress recalculation, dynamic quiz scoring, and cryptographic certificate issuance.

---

## 2. Relational Schema Model (12 Core Entities)

| Table Name | Description | Key Attributes & Constraints |
| :--- | :--- | :--- |
| **`User`** | Platform actors across all roles (RBAC: `STUDENT`, `TRAINER`, `ADMIN`). | Primary Key: `id` (UUID), `email` (Unique), `passwordHash` (Bcrypt), `role`, `phone`, `avatar`, `headline`, `bio`. |
| **`Category`** | Academic disciplines and course tracks. | Primary Key: `id`, `name` (Unique), `slug` (Unique), `icon`. |
| **`Course`** | Published & draft curricula with PKR fees. | Foreign Keys: `instructorId -> User.id`, `categoryId -> Category.id`. Float `price` (Rs. 10k - 30k). Cascade deletion. |
| **`Section`** | Curriculum modules within courses. | Foreign Key: `courseId -> Course.id` (Cascade). Integer ordering. |
| **`Lesson`** | Individual lecture units (video, notes, duration). | Foreign Key: `sectionId -> Section.id` (Cascade). `isFree` preview flag. |
| **`Enrollment`** | Student course registration & progress. | Compound Unique Key: `[userId, courseId]`. Dynamic float progress (0.0 to 100.0%). |
| **`LessonProgress`** | Granular per-lesson completion records. | Compound Unique Key: `[userId, lessonId]`. Boolean `isCompleted`, timestamp. |
| **`Quiz`** | Course assessments with passing threshold. | Foreign Key: `courseId -> Course.id` (Cascade). `passingScore` (e.g. 70%). |
| **`Question`** | Multiple-choice questions with answers & explanations. | Foreign Key: `quizId -> Quiz.id` (Cascade). JSON stringified options array. |
| **`QuizSubmission`**| Student assessment attempts & score logs. | Foreign Keys: `quizId -> Quiz.id`, `userId -> User.id`. Score %, Boolean `passed`. |
| **`Review`** | Course feedback, ratings, and testimonials. | Compound Unique Key: `[userId, courseId]`. 1 to 5 star rating, comment. |
| **`Certificate`** | Cryptographically verified credentials. | Compound Unique Key: `[userId, courseId]`. Unique `certificateCode` (e.g. `SN-2026-X89J21`). |

---

## 3. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    User ||--o{ Course : "authors"
    User ||--o{ Enrollment : "enrolls_in"
    User ||--o{ LessonProgress : "completes"
    User ||--o{ QuizSubmission : "submits"
    User ||--o{ Review : "writes"
    User ||--o{ Certificate : "earns"

    Category ||--o{ Course : "classifies"

    Course ||--|{ Section : "contains"
    Course ||--o{ Enrollment : "has"
    Course ||--o{ Quiz : "evaluates"
    Course ||--o{ Review : "receives"
    Course ||--o{ Certificate : "issues"

    Section ||--|{ Lesson : "contains"
    Lesson ||--o{ LessonProgress : "tracks"

    Quiz ||--|{ Question : "contains"
    Quiz ||--o{ QuizSubmission : "records"
```

---

## 4. Seeded Curricula Catalog (13 Production Courses across 6 Tracks)

| # | Curriculum Title | Academic Track | Lead Faculty | Fee (PKR) |
|---|---|---|---|---|
| 1 | **Full-Stack Web Engineering with Next.js 15 & TypeScript** | Web & Software Engineering | Murtaza Wazir | **Rs. 18,500** |
| 2 | **Advanced Backend Engineering with Go, gRPC & Microservices** | Web & Software Engineering | Prof. David Chen | **Rs. 24,000** |
| 3 | **Cross-Platform Mobile Engineering with React Native & Expo** | Web & Software Engineering | Murtaza Wazir | **Rs. 16,000** |
| 4 | **Applied Machine Learning & Deep Neural Networks with PyTorch** | Artificial Intelligence & Data | Dr. Sarah Mitchell | **Rs. 26,500** |
| 5 | **Large Language Models (LLMs) & Generative AI Engineering** | Artificial Intelligence & Data | Dr. Sarah Mitchell | **Rs. 29,000** |
| 6 | **Computer Vision & Image Processing with OpenCV & PyTorch** | Artificial Intelligence & Data | Dr. Sarah Mitchell | **Rs. 21,000** |
| 7 | **Cloud Infrastructure Engineering with Docker, Kubernetes & AWS** | Cloud & DevOps Architecture | Prof. David Chen | **Rs. 17,500** |
| 8 | **Enterprise Infrastructure as Code (IaC) with Terraform & AWS** | Cloud & DevOps Architecture | Prof. David Chen | **Rs. 19,500** |
| 9 | **Offensive Cybersecurity & Ethical Penetration Testing Mastery** | Cybersecurity & System Defense | Alex Rivera | **Rs. 27,000** |
| 10 | **Zero-Trust Security & Cloud Defenses on AWS and Azure** | Cybersecurity & System Defense | Alex Rivera | **Rs. 22,500** |
| 11 | **Data Structures, Competitive Algorithms & LeetCode Mastery** | Core Algorithms & Computer Science | Prof. David Chen | **Rs. 14,500** |
| 12 | **Database Engine Internals, Query Optimization & Storage Systems** | Core Algorithms & Computer Science | Dr. Zainab Ahmed | **Rs. 25,000** |
| 13 | **UI/UX Design Systems & Interactive Prototyping in Figma** | UI/UX & Product Design | Dr. Sarah Mitchell | **Rs. 12,000** |

---

## 5. Live Functional Database Workflows

### A. Automatic Progress Calculation & Certificate Issuance
1. Student clicks **"Mark as Completed"** inside the lesson classroom (`/courses/[slug]/learn/[lessonId]`).
2. Server Action triggers `toggleLessonProgress()`:
   - Upserts `LessonProgress` for `(userId, lessonId)`.
   - Queries database for total course lessons vs. completed lessons by this user.
   - Computes: `progressPercent = Math.round((completedLessons / totalLessons) * 100)`.
   - Updates `Enrollment.progress` in the database.
3. If `progressPercent === 100`:
   - Checks if a `Certificate` record already exists.
   - If not, automatically creates a new row in `Certificate` with unique cryptographic code `SN-2026-XXXXXX` and timestamp!

### B. Dynamic Quiz Evaluation & Score Persistence
1. Student answers questions and clicks **"Submit Assessment"** (`/courses/[slug]/quiz/[quizId]`).
2. Server Action `submitQuizAttempt()`:
   - Fetches questions and correct option indices from the database.
   - Grades the attempt on the server (cannot be tampered with on client).
   - Persists a new row in `QuizSubmission` with `score` and `passed` status.

### C. Trainer Course Studio
1. Trainer submits new curriculum metadata (`/dashboard/trainer/new-course`).
2. Server Action `createCourseAction()`:
   - Inserts new `Course` with foreign key linking to `instructorId`.
   - Automatically initializes default `Section` and `Lesson` in a single relational transaction.

### D. Admin User Role Governance (RBAC)
1. Administrator views `/dashboard/admin/users`.
2. Clicking **"Set STUDENT"**, **"Set TRAINER"**, or **"Set ADMIN"** executes `updateUserRole()`:
   - Directly mutates the user's role in the database.

---

## 6. Visual Database GUI: Prisma Studio

You can inspect, search, create, and edit raw database records in real-time through **Prisma Studio**:

```powershell
# Inside e:\SkillNova-FYP
npx prisma studio
```
Then open: **`http://localhost:5555`** in your browser. Evaluators can visually inspect every table and row during presentations.

---

## 7. How to Switch from SQLite to PostgreSQL (Optional / Production)

The Prisma schema is designed for zero-code changes between SQLite and PostgreSQL:

1. Open `prisma/schema.prisma` and change:
   ```prisma
   datasource db {
     provider = "postgresql" // was "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
2. In `.env`, change `DATABASE_URL` to your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/skillnova_db?schema=public"
   ```
3. Run the sync command:
   ```powershell
   npx prisma db push
   npx tsx prisma/seed.ts
   ```
Your entire database with all seed accounts and courses will instantly be replicated on PostgreSQL!

