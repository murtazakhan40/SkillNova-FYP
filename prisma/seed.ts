import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Full SkillNova Academy Database Seed...");

  // Clean existing records in relational order
  await prisma.certificate.deleteMany();
  await prisma.review.deleteMany();
  await prisma.quizSubmission.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.section.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Default Users (Hashed passwords with bcrypt)
  const studentPassword = await bcrypt.hash("student123", 10);
  const trainerPassword = await bcrypt.hash("trainer123", 10);
  const adminPassword = await bcrypt.hash("admin123", 10);

  // --- Lead Student (Murtaza Wazir) ---
  const studentMurtaza = await prisma.user.create({
    data: {
      name: "Murtaza Wazir",
      email: "murtazwazir.edu@gmail.com",
      passwordHash: studentPassword,
      role: "STUDENT",
      phone: "03029983146",
      headline: "Lead Software Architect & BS CS Graduate",
      bio: "Creator and Lead Developer of SkillNova Academy. Specializing in Next.js 16 App Router, TypeScript, relational 3NF database design, and cloud systems.",
      avatar: "/murtaza-wazir.jpg",
    },
  });

  // Alias student accounts for evaluators
  const studentAli = await prisma.user.create({
    data: {
      name: "Ali Khan",
      email: "student@skillnova.com",
      passwordHash: studentPassword,
      role: "STUDENT",
      phone: "03001234567",
      headline: "BS Computer Science Undergraduate",
      bio: "Aspiring software engineer passionate about modern web apps, microservices, and AI.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  await prisma.user.create({
    data: {
      name: "Student (Edu Portal)",
      email: "student@skillnova.edu",
      passwordHash: studentPassword,
      role: "STUDENT",
      phone: "03009876543",
      headline: "SkillNova Enrolled Scholar",
      bio: "Computer Science candidate pursuing specialized software engineering certifications.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
  });

  const studentFatima = await prisma.user.create({
    data: {
      name: "Fatima Noor",
      email: "fatima.noor@skillnova.edu",
      passwordHash: studentPassword,
      role: "STUDENT",
      phone: "03335551234",
      headline: "AI & Data Science Student",
      bio: "Researching deep learning neural networks, computer vision, and transformers.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    },
  });

  // --- Instructors / Trainers ---
  const trainerMurtaza = await prisma.user.create({
    data: {
      name: "Murtaza Wazir",
      email: "trainer@skillnova.com",
      passwordHash: trainerPassword,
      role: "TRAINER",
      phone: "03029983146",
      headline: "Lead Software Architect & Web Engineering Specialist",
      bio: "Creator and Lead Architect of SkillNova Academy. Specializing in Next.js 16 App Router, TypeScript, Prisma ORM, and high-performance cloud architectures.",
      avatar: "/murtaza-wazir.jpg",
    },
  });

  await prisma.user.create({
    data: {
      name: "Murtaza Wazir (Faculty)",
      email: "trainer@skillnova.edu",
      passwordHash: trainerPassword,
      role: "TRAINER",
      phone: "03029983146",
      headline: "Faculty Lead in Web & Mobile Engineering",
      bio: "Lead trainer for Next.js, React Native, and enterprise TypeScript architectures.",
      avatar: "/murtaza-wazir.jpg",
    },
  });

  const trainerMitchell = await prisma.user.create({
    data: {
      name: "Dr. Sarah Mitchell",
      email: "sarah.mitchell@skillnova.com",
      passwordHash: trainerPassword,
      role: "TRAINER",
      headline: "Principal AI Researcher & Machine Learning Faculty",
      bio: "12+ years building distributed AI platforms, deep neural networks, and generative LLMs.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    },
  });

  const trainerChen = await prisma.user.create({
    data: {
      name: "Prof. David Chen",
      email: "david.chen@skillnova.com",
      passwordHash: trainerPassword,
      role: "TRAINER",
      headline: "Former Tech Lead at Google • Cloud & Distributed Systems",
      bio: "Author of advanced competitive programming textbooks and veteran Kubernetes/Go architect.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
  });

  const trainerRivera = await prisma.user.create({
    data: {
      name: "Alex Rivera",
      email: "alex.rivera@skillnova.com",
      passwordHash: trainerPassword,
      role: "TRAINER",
      headline: "Principal Offensive Cybersecurity Architect",
      bio: "Certified Ethical Hacker (CEH) and OSCP specializing in cloud vulnerability research and zero-trust engineering.",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    },
  });

  const trainerAhmed = await prisma.user.create({
    data: {
      name: "Dr. Zainab Ahmed",
      email: "zainab.ahmed@skillnova.com",
      passwordHash: trainerPassword,
      role: "TRAINER",
      headline: "Database Engine & Storage Systems Researcher",
      bio: "PhD in Distributed Databases, active open-source contributor to LSM-tree storage engines and SQL planners.",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    },
  });

  const trainerAdeel = await prisma.user.create({
    data: {
      name: "Adeel Qasir",
      email: "adeel.qasir@skillnova.com",
      passwordHash: trainerPassword,
      role: "TRAINER",
      phone: "03129876543",
      headline: "Senior Lead UI/UX & Product Design Specialist",
      bio: "10+ years architecting design systems, human-centered UI/UX frameworks, responsive design tokens, and interactive Figma prototypes for enterprise platforms.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  const trainerMisbah = await prisma.user.create({
    data: {
      name: "Misbah Ullah",
      email: "misbah.ullah@skillnova.com",
      passwordHash: trainerPassword,
      role: "TRAINER",
      phone: "03017765432",
      headline: "Principal Full-Stack Web Architect & Distributed Systems Specialist",
      bio: "Veteran software architect specializing in Next.js 16 App Router, TypeScript monorepos, MERN full-stack architectures, high-concurrency Node.js APIs, and database query optimization.",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    },
  });

  const trainerIbrahim = await prisma.user.create({
    data: {
      name: "Muhammad Ibrahim",
      email: "muhammad.ibrahim@skillnova.com",
      passwordHash: trainerPassword,
      role: "TRAINER",
      phone: "03451122334",
      headline: "Senior Mobile Engineering Lead & Cross-Platform Architect",
      bio: "Specializing in React Native New Architecture (Fabric & TurboModules), Google Flutter & Dart native compilation, offline-first SQLite sync, and production app releases.",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    },
  });

  // --- Administrators ---
  await prisma.user.create({
    data: {
      name: "Platform Administrator",
      email: "admin@skillnova.com",
      passwordHash: adminPassword,
      role: "ADMIN",
      headline: "SkillNova Academic Operations & Oversight",
      bio: "Managing academic standards, course reviews, and user governance.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
  });

  await prisma.user.create({
    data: {
      name: "System Administrator",
      email: "admin@skillnova.edu",
      passwordHash: adminPassword,
      role: "ADMIN",
      headline: "University Academic Governance",
      bio: "Overseeing BS Computer Science evaluation benchmarks and course quality.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
  });

  console.log("✓ Seeded comprehensive user directory (Students, Instructors, Admins)");

  // 2. Create Categories
  const catWeb = await prisma.category.create({
    data: {
      name: "Web & Software Engineering",
      slug: "web-software-engineering",
      description: "Modern full-stack web applications, TypeScript, Next.js, and scalable APIs.",
      icon: "Code",
    },
  });

  const catAI = await prisma.category.create({
    data: {
      name: "Artificial Intelligence & Data",
      slug: "artificial-intelligence-data",
      description: "Machine learning, deep neural networks, computer vision, and generative LLMs.",
      icon: "Brain",
    },
  });

  const catCloud = await prisma.category.create({
    data: {
      name: "Cloud & DevOps Architecture",
      slug: "cloud-devops-architecture",
      description: "Docker, Kubernetes, AWS infrastructure, and enterprise CI/CD pipelines.",
      icon: "Cloud",
    },
  });

  const catCyber = await prisma.category.create({
    data: {
      name: "Cybersecurity & System Defense",
      slug: "cybersecurity-system-defense",
      description: "Ethical hacking, penetration testing, network hardening, and cryptography.",
      icon: "Shield",
    },
  });

  const catAlgo = await prisma.category.create({
    data: {
      name: "Core Algorithms & Computer Science",
      slug: "algorithms-computer-science",
      description: "Data structures, complexity analysis, dynamic programming, and storage engines.",
      icon: "Terminal",
    },
  });

  const catDesign = await prisma.category.create({
    data: {
      name: "UI/UX & Product Design",
      slug: "ui-ux-product-design",
      description: "Design systems, Figma, typography, and human-computer interaction.",
      icon: "Palette",
    },
  });

  console.log("✓ Created 6 academic disciplines");

  // Helper for adding course with sections, lessons, and quizzes
  async function seedCurriculum(data: {
    title: string;
    slug: string;
    subtitle: string;
    description: string;
    price: number;
    level: string;
    thumbnail: string;
    featured: boolean;
    instructorId: string;
    categoryId: string;
    sections: {
      title: string;
      lessons: { title: string; duration: string; isFree?: boolean; content: string }[];
    }[];
    quizTitle: string;
    questions: { text: string; options: string[]; correctIndex: number; explanation: string }[];
  }) {
    const course = await prisma.course.create({
      data: {
        title: data.title,
        slug: data.slug,
        subtitle: data.subtitle,
        description: data.description,
        price: data.price,
        level: data.level,
        thumbnail: data.thumbnail,
        published: true,
        featured: data.featured,
        instructorId: data.instructorId,
        categoryId: data.categoryId,
      },
    });

    for (let sIdx = 0; sIdx < data.sections.length; sIdx++) {
      const sData = data.sections[sIdx];
      const section = await prisma.section.create({
        data: {
          title: sData.title,
          order: sIdx + 1,
          courseId: course.id,
        },
      });

      for (let lIdx = 0; lIdx < sData.lessons.length; lIdx++) {
        const lData = sData.lessons[lIdx];
        await prisma.lesson.create({
          data: {
            title: lData.title,
            duration: lData.duration,
            isFree: lData.isFree ?? false,
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            content: lData.content,
            order: lIdx + 1,
            sectionId: section.id,
          },
        });
      }
    }

    if (data.questions.length > 0) {
      const quiz = await prisma.quiz.create({
        data: {
          title: data.quizTitle,
          passingScore: 70,
          courseId: course.id,
        },
      });

      for (const q of data.questions) {
        await prisma.question.create({
          data: {
            quizId: quiz.id,
            text: q.text,
            optionsJson: JSON.stringify(q.options),
            correctIndex: q.correctIndex,
            explanation: q.explanation,
          },
        });
      }
    }

    return course;
  }

  // --- COURSE 1: Web Development ---
  const course1 = await seedCurriculum({
    title: "Web Development",
    slug: "fullstack-nextjs-typescript",
    subtitle: "Build modern websites and web apps with HTML, CSS, JavaScript, and Next.js.",
    description: "Learn modern full-stack web development from scratch. Build responsive user interfaces, work with modern React and Next.js, connect relational databases, and deploy live websites to the cloud.",
    price: 18500,
    level: "INTERMEDIATE",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    featured: true,
    instructorId: trainerMurtaza.id,
    categoryId: catWeb.id,
    sections: [
      {
        title: "Module 1: Next.js Architecture & Server Components",
        lessons: [
          {
            title: "Platform Overview & Next.js App Router Paradigms",
            duration: "14 mins",
            isFree: true,
            content: `### Architecture Overview
React Server Components (RSC) allow developers to render components on the server without shipping JavaScript to the client bundle.
- **Server Components:** Default in Next.js App Router. Zero client-side JS bundle overhead.
- **Client Components:** Opt-in with 'use client'. Required for state, effects, and event listeners.
- **Streaming:** Progressive rendering with React Suspense boundaries.`,
          },
          {
            title: "Designing Responsive Layouts with Tailwind CSS v4",
            duration: "22 mins",
            isFree: true,
            content: `### Design System Configuration
Tailwind CSS v4 introduces CSS-first configuration using @theme blocks directly in globals.css.
- Utilizing CSS custom properties for fonts and palettes.
- Fluid typography and responsive grid structures.
- Accessible contrast ratios conforming to WCAG AA.`,
          },
          {
            title: "Server Actions and Safe Form Mutations",
            duration: "19 mins",
            isFree: false,
            content: `### Server Actions Implementation
Server Actions provide type-safe asynchronous RPC functions executed exclusively on the server.
- Built-in CSRF prevention.
- Optimistic UI updates with useOptimistic hook.
- Server-side input validation and error dispatching.`,
          },
        ],
      },
      {
        title: "Module 2: Relational Modeling & Prisma ORM",
        lessons: [
          {
            title: "Relational Schema Normalization (3NF)",
            duration: "25 mins",
            isFree: false,
            content: `### Third Normal Form (3NF) Rules
1. Eliminate repeating groups in individual tables.
2. Create a separate table for each set of related data (2NF).
3. Remove fields that do not depend on the primary key (transitive dependency removal).`,
          },
          {
            title: "Query Optimization, Indexes & Connection Pooling",
            duration: "30 mins",
            isFree: false,
            content: `### Indexing Strategy
Compound indexes on foreign keys and search terms dramatically reduce B-Tree traversal times during complex JOIN queries.`,
          },
        ],
      },
    ],
    quizTitle: "Next.js Full-Stack Architecture Assessment",
    questions: [
      {
        text: "What is the primary benefit of React Server Components (RSC) in Next.js?",
        options: [
          "They render solely on the server and transmit zero JavaScript to the client bundle",
          "They replace the need for CSS entirely",
          "They require a mandatory Redux store",
          "They can only run on mobile devices",
        ],
        correctIndex: 0,
        explanation: "RSCs execute entirely on the server, resulting in faster initial page loads and zero client-bundle bloat.",
      },
      {
        text: "Which database normalization form eliminates transitive dependencies?",
        options: ["First Normal Form (1NF)", "Second Normal Form (2NF)", "Third Normal Form (3NF)", "Boyce-Codd Normal Form"],
        correctIndex: 2,
        explanation: "3NF requires that every non-key attribute must depend directly on the primary key, with zero transitive dependencies.",
      },
    ],
  });

  // --- COURSE 2: Backend Development ---
  const course2 = await seedCurriculum({
    title: "Backend Development",
    slug: "advanced-backend-go-grpc",
    subtitle: "Build scalable server systems, APIs, and microservices with Go.",
    description: "Learn how to build resilient, distributed backend microservices handling hundreds of thousands of concurrent requests with Go routines, channels, protocol buffers, and distributed tracing.",
    price: 24000,
    level: "ADVANCED",
    thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&auto=format&fit=crop&q=80",
    featured: true,
    instructorId: trainerChen.id,
    categoryId: catWeb.id,
    sections: [
      {
        title: "Module 1: Concurrency Internals & Channels",
        lessons: [
          {
            title: "Goroutines, OS Threads, and the Go Scheduler (M:N Model)",
            duration: "26 mins",
            isFree: true,
            content: `### Go Runtime Scheduler
Go utilizes an M:N scheduler matching M goroutines to N operating system threads via work-stealing algorithms.`,
          },
          {
            title: "Channel Semantics: Buffered, Unbuffered, and Select",
            duration: "20 mins",
            isFree: false,
            content: `### Channel Communications
Channels synchronize execution and prevent race conditions without explicit mutex locks.`,
          },
        ],
      },
      {
        title: "Module 2: gRPC, Protobuf & Distributed Systems",
        lessons: [
          {
            title: "Protocol Buffers v3 Schema Design & Binary Serialization",
            duration: "22 mins",
            isFree: false,
            content: `### Protobuf Binary Wire Format
Protocol Buffers encode messages into compact binary payloads, achieving up to 10x throughput over traditional JSON HTTP/1.1 APIs.`,
          },
          {
            title: "Implementing Bidirectional Streaming with gRPC",
            duration: "35 mins",
            isFree: false,
            content: `### HTTP/2 Multiplexing
gRPC utilizes HTTP/2 streams to allow multiple requests and responses concurrently over a single TCP socket.`,
          },
        ],
      },
    ],
    quizTitle: "Go Microservices & Concurrency Quiz",
    questions: [
      {
        text: "How does the Go runtime scheduler allocate Goroutines to OS threads?",
        options: [
          "Via an M:N work-stealing scheduler mapped over logical processors",
          "One thread per goroutine strictly",
          "By halting the CPU until completion",
          "Through browser Web Workers",
        ],
        correctIndex: 0,
        explanation: "Go uses an M:N scheduler multiplexing M goroutines onto N OS threads across logical CPU processors.",
      },
    ],
  });

  // --- COURSE 3: App Development ---
  const course3 = await seedCurriculum({
    title: "App Development",
    slug: "cross-platform-react-native-expo",
    subtitle: "Create cross-platform mobile apps for iOS and Android with React Native.",
    description: "Construct production mobile apps with native gesture handling, offline persistence, push notifications, and App Store / Google Play deployment pipelines.",
    price: 16000,
    level: "INTERMEDIATE",
    thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80",
    featured: false,
    instructorId: trainerMurtaza.id,
    categoryId: catWeb.id,
    sections: [
      {
        title: "Module 1: Expo Architecture & Navigation",
        lessons: [
          {
            title: "Expo Router & File-Based Native Navigation",
            duration: "18 mins",
            isFree: true,
            content: `### Expo Router File Conventions
File-based routing provides deep linking and nested stack / tab navigators native to mobile OS environments.`,
          },
          {
            title: "Native Gestures & Reanimated 3 Animations",
            duration: "24 mins",
            isFree: false,
            content: `### UI Thread Animations
Reanimated 3 runs worklets on the native UI thread, guaranteeing steady 60 FPS transitions without blocking the JS bridge.`,
          },
        ],
      },
    ],
    quizTitle: "React Native Performance Quiz",
    questions: [
      {
        text: "Why does React Native Reanimated run animations on the UI thread?",
        options: [
          "To avoid frame drops when the JavaScript thread is busy with business logic",
          "Because JavaScript cannot compute numbers",
          "To disable GPU acceleration",
          "Because iOS bans JavaScript",
        ],
        correctIndex: 0,
        explanation: "Running animations directly on the UI thread guarantees steady 60-120fps motion unaffected by JS processing spikes.",
      },
    ],
  });

  // --- COURSE 4: Machine Learning & AI ---
  const course4 = await seedCurriculum({
    title: "Machine Learning & AI",
    slug: "applied-machine-learning-pytorch",
    subtitle: "Train neural networks, deep learning models, and smart algorithms with PyTorch.",
    description: "Gain hands-on mastery over machine learning and deep learning fundamentals. Build classifiers, sequential models, and export optimized models for production applications.",
    price: 26500,
    level: "ADVANCED",
    thumbnail: "https://images.unsplash.com/photo-1507146426996-ef05388b69b9?w=800&auto=format&fit=crop&q=80",
    featured: true,
    instructorId: trainerMitchell.id,
    categoryId: catAI.id,
    sections: [
      {
        title: "Module 1: Tensors, Autograd & Optimization",
        lessons: [
          {
            title: "Computational Graphs & Dynamic Autograd in PyTorch",
            duration: "28 mins",
            isFree: true,
            content: `### Dynamic Computation Graphs
PyTorch builds computation graphs on the fly with every forward pass, allowing dynamic flow control and intuitive debugging.`,
          },
          {
            title: "Loss Functions, Gradient Descent & Adam Optimizer",
            duration: "22 mins",
            isFree: false,
            content: `### Stochastic Optimization
Adam combines Momentum and RMSProp adaptive learning rate concepts for robust convergence on non-convex surfaces.`,
          },
        ],
      },
      {
        title: "Module 2: Convolutional Neural Networks (CNNs)",
        lessons: [
          {
            title: "Kernel Filters, Pooling, and Feature Map Extractions",
            duration: "30 mins",
            isFree: false,
            content: `### Convolution Operation
Kernels slide across pixel matrices to extract spatial representations such as edges, textures, and object hierarchies.`,
          },
        ],
      },
    ],
    quizTitle: "PyTorch & Deep Neural Network Quiz",
    questions: [
      {
        text: "What mechanism enables automatic backpropagation in PyTorch?",
        options: [
          "The Autograd engine tracking operations on Tensors with requires_grad=True",
          "Manual calculus lookup tables",
          "Compiler regex parsing",
          "Thread sleep listeners",
        ],
        correctIndex: 0,
        explanation: "Autograd records an acyclic directed graph of tensor operations, computing reverse vector-Jacobian products during .backward().",
      },
    ],
  });

  // --- COURSE 5: Generative AI ---
  const course5 = await seedCurriculum({
    title: "Generative AI",
    slug: "large-language-models-generative-ai",
    subtitle: "Build AI agents, ChatGPT chatbots, and intelligent applications with LLMs.",
    description: "Deep dive into generative AI and large language models. Master the Transformer attention mechanism, fine-tune open models, and build production Retrieval-Augmented Generation (RAG) architectures with vector search.",
    price: 29000,
    level: "ADVANCED",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80",
    featured: true,
    instructorId: trainerMitchell.id,
    categoryId: catAI.id,
    sections: [
      {
        title: "Module 1: Transformer Architecture & Self-Attention",
        lessons: [
          {
            title: "Query, Key, Value Matrices & Scaled Dot-Product Attention",
            duration: "35 mins",
            isFree: true,
            content: `### Attention Is All You Need
Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V
Allows token-to-token contextual weighting independent of distance.`,
          },
        ],
      },
      {
        title: "Module 2: Vector Search & Production RAG Systems",
        lessons: [
          {
            title: "Chunking Strategies, Dense Embeddings, and HNSW Vector Indexing",
            duration: "28 mins",
            isFree: false,
            content: `### Retrieval Augmented Generation (RAG)
Combining semantic search over private documents with LLM context windows to eliminate hallucinations.`,
          },
        ],
      },
    ],
    quizTitle: "LLM & Transformer Architecture Quiz",
    questions: [
      {
        text: "What does dividing by sqrt(d_k) achieve in Scaled Dot-Product Attention?",
        options: [
          "It prevents dot products from growing excessively large, avoiding vanishing gradients in the softmax function",
          "It makes the tensor size smaller",
          "It rounds all floats to integers",
          "It converts text to audio",
        ],
        correctIndex: 0,
        explanation: "Scaling prevents extremely large dot-product magnitudes that push softmax into regions with near-zero gradients.",
      },
    ],
  });

  // --- COURSE 6: Computer Vision ---
  await seedCurriculum({
    title: "Computer Vision",
    slug: "computer-vision-opencv-pytorch",
    subtitle: "Image recognition, face detection, and video analysis with OpenCV.",
    description: "Comprehensive curriculum covering classic image filtering, edge detection, optical flow, YOLO real-time object detection, and Mask R-CNN semantic segmentation.",
    price: 21000,
    level: "INTERMEDIATE",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    featured: false,
    instructorId: trainerMitchell.id,
    categoryId: catAI.id,
    sections: [
      {
        title: "Module 1: Image Processing with OpenCV",
        lessons: [
          {
            title: "Color Spaces, Affine Transforms, and Canny Edge Detection",
            duration: "20 mins",
            isFree: true,
            content: "Spatial image filtering, Gaussian blurs, and gradient-based edge extraction algorithms.",
          },
        ],
      },
    ],
    quizTitle: "Computer Vision Fundamentals Quiz",
    questions: [
      {
        text: "What color channel order does OpenCV use by default?",
        options: ["BGR", "RGB", "CMYK", "Grayscale"],
        correctIndex: 0,
        explanation: "OpenCV reads images in BGR format rather than the standard RGB representation.",
      },
    ],
  });

  // --- COURSE 7: Cloud Computing & DevOps ---
  const course7 = await seedCurriculum({
    title: "Cloud Computing & DevOps",
    slug: "cloud-infrastructure-docker-kubernetes-aws",
    subtitle: "Deploy and manage software using Docker, Kubernetes, and AWS.",
    description: "Deploy scalable, enterprise-grade cloud applications. Master Docker multi-stage builds, Kubernetes pods, deployments, services, ingress routing, Helm charts, and AWS Cloud networking.",
    price: 17500,
    level: "INTERMEDIATE",
    thumbnail: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80",
    featured: true,
    instructorId: trainerChen.id,
    categoryId: catCloud.id,
    sections: [
      {
        title: "Module 1: Docker Containerization Best Practices",
        lessons: [
          {
            title: "Multi-Stage Dockerfiles & Minimal Alpine/Distroless Images",
            duration: "21 mins",
            isFree: true,
            content: "Minimizing attack surfaces and reducing container image payloads from 1GB to under 50MB.",
          },
        ],
      },
      {
        title: "Module 2: Kubernetes Orchestration",
        lessons: [
          {
            title: "ReplicaSets, Deployments, Rolling Updates & HPA",
            duration: "32 mins",
            isFree: false,
            content: "Zero-downtime rolling deployments and Horizontal Pod Autoscalers triggered by CPU/Memory metrics.",
          },
        ],
      },
    ],
    quizTitle: "Kubernetes & Cloud Engineering Quiz",
    questions: [
      {
        text: "What is the smallest deployable computing unit in Kubernetes?",
        options: ["A Pod", "A Node", "A Dockerfile", "A Virtual Machine"],
        correctIndex: 0,
        explanation: "A Pod represents a single instance of a running process in a cluster, encapsulating one or more containers.",
      },
    ],
  });

  // --- COURSE 8: Cloud Infrastructure ---
  await seedCurriculum({
    title: "Cloud Infrastructure",
    slug: "enterprise-infrastructure-as-code-terraform",
    subtitle: "Automate server setup and cloud networks using Terraform.",
    description: "Automate entire cloud environments with HashiCorp Terraform. Learn HCL, remote state locking with DynamoDB, modular architectures, and automated testing.",
    price: 19500,
    level: "ADVANCED",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    featured: false,
    instructorId: trainerChen.id,
    categoryId: catCloud.id,
    sections: [
      {
        title: "Module 1: Terraform Core & Remote State",
        lessons: [
          {
            title: "State Locking with S3 Buckets & DynamoDB Tables",
            duration: "24 mins",
            isFree: true,
            content: "Preventing race conditions and corrupting terraform.tfstate in multi-engineer teams.",
          },
        ],
      },
    ],
    quizTitle: "Terraform State Management Quiz",
    questions: [
      {
        text: "Why is DynamoDB used alongside Amazon S3 for Terraform remote backend?",
        options: [
          "To provide distributed state locking and prevent concurrent writes",
          "To host website images",
          "To compile Terraform code",
          "To calculate tax fees",
        ],
        correctIndex: 0,
        explanation: "DynamoDB provides atomic distributed locks, ensuring two engineers cannot apply changes simultaneously.",
      },
    ],
  });

  // --- COURSE 9: Cyber Security ---
  const course9 = await seedCurriculum({
    title: "Cyber Security",
    slug: "offensive-cybersecurity-ethical-hacking",
    subtitle: "Learn ethical hacking, penetration testing, and system defense.",
    description: "Learn practical cyber security and ethical hacking. Master network scanning, vulnerability identification, SQL injection defense, web penetration testing, and threat mitigation.",
    price: 27000,
    level: "ADVANCED",
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80",
    featured: true,
    instructorId: trainerRivera.id,
    categoryId: catCyber.id,
    sections: [
      {
        title: "Module 1: Web Application Penetration Testing",
        lessons: [
          {
            title: "OWASP Top 10: SQL Injection & Blind Injection Defense",
            duration: "27 mins",
            isFree: true,
            content: "Constructing union queries, error-based payloads, and implementing parameterized prepared statements.",
          },
        ],
      },
    ],
    quizTitle: "Cybersecurity & Web Defense Quiz",
    questions: [
      {
        text: "What is the most effective defense against SQL Injection?",
        options: [
          "Parameterized queries / Prepared statements with ORM abstraction",
          "Encrypting the hard drive",
          "Changing the port to 8080",
          "Using complex passwords",
        ],
        correctIndex: 0,
        explanation: "Prepared statements ensure user inputs are treated strictly as data literals rather than executable SQL syntax.",
      },
    ],
  });

  // --- COURSE 10: Network & Cloud Security ---
  await seedCurriculum({
    title: "Network & Cloud Security",
    slug: "zero-trust-cloud-security-defenses",
    subtitle: "Protect servers, cloud networks, and firewalls against cyber threats.",
    description: "Learn essential cloud and network defenses. Master identity and access management (IAM), firewall configurations, security group isolation, and threat detection on AWS and Azure.",
    price: 22500,
    level: "INTERMEDIATE",
    thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
    featured: false,
    instructorId: trainerRivera.id,
    categoryId: catCyber.id,
    sections: [
      {
        title: "Module 1: Identity & Access Management (IAM)",
        lessons: [
          {
            title: "Least Privilege Principle & AWS IAM Policy Evaluations",
            duration: "20 mins",
            isFree: true,
            content: "Crafting explicit Deny statements, condition keys, and temporary STS credentials.",
          },
        ],
      },
    ],
    quizTitle: "Zero-Trust Architecture Quiz",
    questions: [
      {
        text: "What is the core axiom of Zero-Trust architecture?",
        options: [
          "Never trust, always verify, regardless of network location",
          "Trust everyone inside the company Wi-Fi",
          "Disable all passwords",
          "Allow root access on port 22",
        ],
        correctIndex: 0,
        explanation: "Zero-Trust assumes breach and continuously authenticates and authorizes every transaction at every layer.",
      },
    ],
  });

  // --- COURSE 11: Data Structures & Algorithms ---
  const course11 = await seedCurriculum({
    title: "Data Structures & Algorithms",
    slug: "data-structures-algorithms-leetcode-mastery",
    subtitle: "Master fundamental coding logic, problem solving, and technical interviews.",
    description: "Rigorous computer science algorithms course. Master Big-O analysis, binary heaps, topological sorting, Dijkstra shortest path, dynamic programming memoization, and bit manipulation.",
    price: 14500,
    level: "INTERMEDIATE",
    thumbnail: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&auto=format&fit=crop&q=80",
    featured: false,
    instructorId: trainerChen.id,
    categoryId: catAlgo.id,
    sections: [
      {
        title: "Module 1: Graph Algorithms",
        lessons: [
          {
            title: "Breadth-First Search (BFS) vs Depth-First Search (DFS)",
            duration: "25 mins",
            isFree: true,
            content: "Iterative queue vs recursive stack implementations, cycle detection, and connected components.",
          },
        ],
      },
    ],
    quizTitle: "Algorithm Complexity Quiz",
    questions: [
      {
        text: "What is the time complexity of searching in a balanced Binary Search Tree (AVL / Red-Black)?",
        options: ["O(log n)", "O(n)", "O(1)", "O(n^2)"],
        correctIndex: 0,
        explanation: "Balanced BSTs guarantee maximum tree height of O(log n), making lookup, insertion, and deletion O(log n).",
      },
    ],
  });

  // --- COURSE 12: Database Systems & SQL ---
  await seedCurriculum({
    title: "Database Systems & SQL",
    slug: "database-engine-internals-query-optimization",
    subtitle: "Master relational databases, SQL queries, indexes, and storage.",
    description: "Understand database fundamentals and storage internals. Learn page buffer managers, B+ Trees vs LSM-Trees, Write-Ahead Logging (WAL) for crash recovery, and multi-version concurrency control.",
    price: 25000,
    level: "ADVANCED",
    thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80",
    featured: false,
    instructorId: trainerAhmed.id,
    categoryId: catAlgo.id,
    sections: [
      {
        title: "Module 1: Storage Structures",
        lessons: [
          {
            title: "B+ Tree Fanout, Leaf Chaining, and Buffer Pool Evictions",
            duration: "30 mins",
            isFree: true,
            content: "Page layout, slotted pages, LRU vs CLOCK buffer eviction policies.",
          },
        ],
      },
    ],
    quizTitle: "Database Storage & Indexing Quiz",
    questions: [
      {
        text: "Why are B+ Trees preferred over regular B-Trees for database index structures?",
        options: [
          "All data pointers are stored in the leaf nodes, enabling efficient sequential range scans and higher node fanout",
          "They take zero disk space",
          "They only store string data",
          "They eliminate the need for primary keys",
        ],
        correctIndex: 0,
        explanation: "In B+ Trees, non-leaf nodes only hold keys, maximizing fanout and linking all leaf nodes for sequential disk scans.",
      },
    ],
  });

  // --- COURSE 13: UI/UX Design (Adeel Qasir) ---
  const course13 = await seedCurriculum({
    title: "UI/UX Design",
    slug: "ui-ux-design-systems-prototyping",
    subtitle: "Design stunning digital experiences, component systems, and prototypes in Figma.",
    description: "Elevate your user experience design skills from wireframing to high-fidelity accessible design systems with Adeel Qasir. Learn typography scales, WCAG contrast compliance, auto-layout variants, and engineering handoff.",
    price: 12000,
    level: "BEGINNER",
    thumbnail: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80",
    featured: true,
    instructorId: trainerAdeel.id,
    categoryId: catDesign.id,
    sections: [
      {
        title: "Module 1: Design Tokens & Typography",
        lessons: [
          {
            title: "Constructing Harmonious Color Systems & Accessible Scales",
            duration: "18 mins",
            isFree: true,
            content: "Color theory, semantic naming, dark mode variants, and WCAG AA guidelines.",
          },
          {
            title: "Figma Component Auto-Layout & Multi-State Variants",
            duration: "24 mins",
            isFree: false,
            content: "Mastering nested auto-layout, min/max dimensions, and responsive component properties.",
          },
        ],
      },
    ],
    quizTitle: "UI/UX Accessibility & Design Tokens Quiz",
    questions: [
      {
        text: "What is the minimum WCAG AA contrast ratio requirement for normal body text?",
        options: ["4.5:1", "2:1", "7:1", "1:1"],
        correctIndex: 0,
        explanation: "WCAG 2.1 AA mandates a minimum contrast ratio of 4.5:1 for standard body text.",
      },
    ],
  });

  // --- COURSE 14: UX Research & Wireframing (Adeel Qasir) ---
  const course14 = await seedCurriculum({
    title: "UX Research & Wireframing",
    slug: "ux-research-journey-mapping-wireframing",
    subtitle: "Master user interviews, information architecture, wireframing, and usability testing.",
    description: "Delve deep into cognitive psychology and UX research methodologies with Adeel Qasir. Conduct qualitative user interviews, construct data-driven empathy maps, user journey workflows, and run tree testing to architect friction-free user flows.",
    price: 15000,
    level: "BEGINNER",
    thumbnail: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&auto=format&fit=crop&q=80",
    featured: true,
    instructorId: trainerAdeel.id,
    categoryId: catDesign.id,
    sections: [
      {
        title: "Module 1: UX Discovery & Behavioral Research",
        lessons: [
          {
            title: "Conducting User Interviews & Quantitative Persona Archetypes",
            duration: "16 mins",
            isFree: true,
            content: "Formulating open-ended inquiry protocols, avoiding cognitive bias, and synthesizing interview transcripts.",
          },
          {
            title: "Constructing Empathy Maps & Journey Flow Architecture",
            duration: "22 mins",
            isFree: false,
            content: "Visualizing user emotional states, pain points, and friction-reducing transition gates.",
          },
        ],
      },
      {
        title: "Module 2: Usability Testing & Information Architecture",
        lessons: [
          {
            title: "Card Sorting & Heuristic Usability Audits (Nielsen Norman)",
            duration: "25 mins",
            isFree: false,
            content: "Applying the 10 Jakob Nielsen usability heuristics to evaluate digital applications.",
          },
          {
            title: "Low-Fidelity Paper Prototyping & Rapid Validation",
            duration: "18 mins",
            isFree: false,
            content: "Fast-iteration wireframing cycles for early concept validation before high-fidelity handoff.",
          },
        ],
      },
    ],
    quizTitle: "UX Discovery & Heuristics Certification Quiz",
    questions: [
      {
        text: "Which research method is specifically designed to evaluate and discover intuitive navigation tree structures?",
        options: [
          "Card Sorting and Tree Testing",
          "Automated Load Testing",
          "A/B Price Testing",
          "SQL Query Plan Auditing",
        ],
        correctIndex: 0,
        explanation: "Card sorting and tree testing reveal mental models for categorizing navigation menus and site taxonomy.",
      },
    ],
  });

  // --- COURSE 15: Mobile UI/UX Design (Adeel Qasir) ---
  const course15 = await seedCurriculum({
    title: "Mobile UI/UX Design",
    slug: "mobile-app-ui-ux-micro-interactions",
    subtitle: "Design pixel-perfect mobile interfaces and smooth micro-animations in Figma.",
    description: "Design cutting-edge mobile applications following Apple Human Interface Guidelines and Google Material Design 3 with Adeel Qasir. Learn touch ergonomics, spring physics, smart animate transitions, and design token integration for seamless developer handoff.",
    price: 18500,
    level: "INTERMEDIATE",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    featured: true,
    instructorId: trainerAdeel.id,
    categoryId: catDesign.id,
    sections: [
      {
        title: "Module 1: Touch Ergonomics & Mobile Design Standards",
        lessons: [
          {
            title: "iOS Human Interface Guidelines vs Material Design 3",
            duration: "20 mins",
            isFree: true,
            content: "Comparing navigation bars, bottom sheets, system typography, and native icon behaviors.",
          },
          {
            title: "Touch Targets, Thumb Zones & Bottom Sheet Ergonomics",
            duration: "19 mins",
            isFree: false,
            content: "Designing for one-handed thumb reachability and standard 48x48dp interactive bounding boxes.",
          },
        ],
      },
      {
        title: "Module 2: Micro-Interactions & Motion Design",
        lessons: [
          {
            title: "Figma Smart Animate & Interactive Component Variants",
            duration: "24 mins",
            isFree: false,
            content: "Crafting delightful button feedback, pull-to-refresh micro-interactions, and tab transitions.",
          },
          {
            title: "Exporting Production Lottie JSON & Design Token Specs",
            duration: "21 mins",
            isFree: false,
            content: "Bridging the designer-developer gap with clean token exports and JSON vector animations.",
          },
        ],
      },
    ],
    quizTitle: "Mobile UX Standards & Micro-Interactions Quiz",
    questions: [
      {
        text: "What is Apple's recommended minimum interactive touch target dimension?",
        options: ["44 x 44 points", "16 x 16 points", "100 x 100 points", "24 x 24 points"],
        correctIndex: 0,
        explanation: "Apple Human Interface Guidelines mandate at least 44x44 points for touch target accessibility.",
      },
    ],
  });

  // --- COURSE 16: MERN Stack Development (Misbah Ullah) ---
  const course16 = await seedCurriculum({
    title: "MERN Stack Development",
    slug: "enterprise-mern-nextjs-architecture",
    subtitle: "Build web apps with MongoDB, Express, React, and Node.js.",
    description: "Led by Misbah Ullah, master modern full-stack web engineering from monorepo orchestration to server actions, optimistic UI, state management with Zustand, and production Docker containerization. Build resilient, scalable architectures with type-safety end-to-end.",
    price: 25000,
    level: "INTERMEDIATE",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    featured: true,
    instructorId: trainerMisbah.id,
    categoryId: catWeb.id,
    sections: [
      {
        title: "Module 1: Monorepos & Next.js 16 Server Architecture",
        lessons: [
          {
            title: "Turborepo Setup with Shared TypeScript Packages",
            duration: "22 mins",
            isFree: true,
            content: "Configuring multi-package monorepos, shared ESLint rules, and UI component packages.",
          },
          {
            title: "React Server Components (RSC) & Streaming SSR Patterns",
            duration: "28 mins",
            isFree: false,
            content: "Leveraging Suspense boundaries, streaming HTML, and reducing client JavaScript execution overhead.",
          },
        ],
      },
      {
        title: "Module 2: State Synchronization & Secure Data Flow",
        lessons: [
          {
            title: "Optimistic State Mutation with Server Actions & Zod",
            duration: "25 mins",
            isFree: false,
            content: "Using useOptimistic, validating input boundaries with Zod schemas, and managing database rollbacks.",
          },
          {
            title: "Production Authentication, Session Cookies & RBAC Protection",
            duration: "30 mins",
            isFree: false,
            content: "HttpOnly cookie tokens, middleware routing gates, and role-based access control.",
          },
        ],
      },
    ],
    quizTitle: "Enterprise Next.js Architecture & Data Mutations Quiz",
    questions: [
      {
        text: "Why do React Server Components (RSC) dramatically improve mobile web performance?",
        options: [
          "RSC components and dependencies execute solely on the server and are not bundled into client JavaScript",
          "They disable CSS completely",
          "They require no server at all",
          "They convert all images to ASCII text",
        ],
        correctIndex: 0,
        explanation: "Server components ship zero JavaScript to the browser bundle, drastically reducing Time to Interactive (TTI).",
      },
    ],
  });

  // --- COURSE 17: API & Backend Engineering (Misbah Ullah) ---
  const course17 = await seedCurriculum({
    title: "API & Backend Engineering",
    slug: "scalable-rest-graphql-api-engineering",
    subtitle: "Design fast REST and GraphQL APIs with Node.js and PostgreSQL.",
    description: "Learn the mechanics of engineering high-throughput backend services with Misbah Ullah. Implement connection pooling with pgBouncer, write optimized Prisma and raw SQL queries, engineer Apollo GraphQL schemas with DataLoader N+1 prevention, and deploy resilient CI/CD pipelines.",
    price: 22000,
    level: "ADVANCED",
    thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
    featured: false,
    instructorId: trainerMisbah.id,
    categoryId: catWeb.id,
    sections: [
      {
        title: "Module 1: Database Throughput & Query Optimization",
        lessons: [
          {
            title: "PostgreSQL Index Strategies: B-Tree, GIN & Partitioning",
            duration: "24 mins",
            isFree: true,
            content: "Optimizing sequential scans, designing compound indexes, and partitioning time-series tables.",
          },
          {
            title: "Solving the N+1 Query Problem with DataLoader & Batching",
            duration: "26 mins",
            isFree: false,
            content: "Coalescing individual relation queries into grouped IN queries during single tick execution.",
          },
        ],
      },
      {
        title: "Module 2: Security & High-Concurrency Throughput",
        lessons: [
          {
            title: "Redis Token Bucket Rate Limiting & Sliding Windows",
            duration: "22 mins",
            isFree: false,
            content: "Thwarting DDoS attacks and brute-force attempts with distributed Redis counters.",
          },
          {
            title: "Real-Time WebSocket Streams & Event-Driven Architecture",
            duration: "30 mins",
            isFree: false,
            content: "Publish-subscribe message brokers, heartbeat ping/pong keepalives, and connection failovers.",
          },
        ],
      },
    ],
    quizTitle: "Backend Scalability & High-Throughput APIs Quiz",
    questions: [
      {
        text: "How does DataLoader resolve the N+1 query problem in GraphQL resolver trees?",
        options: [
          "By batching multiple individual load requests within a single event loop tick into a single bulk query",
          "By deleting foreign keys from the database",
          "By running every query in a synchronous loop",
          "By caching all data permanently in memory",
        ],
        correctIndex: 0,
        explanation: "DataLoader groups individual load calls into an array of IDs and executes one aggregated batch query.",
      },
    ],
  });

  // --- COURSE 18: React Native App Development (Muhammad Ibrahim) ---
  const course18 = await seedCurriculum({
    title: "React Native App Development",
    slug: "react-native-expo-production-engineering",
    subtitle: "Build high-speed mobile apps for iOS and Android with React Native and Expo.",
    description: "Taught by Muhammad Ibrahim, harness the power of React Native, TypeScript, Expo SDK, and native gesture handlers. Master Fabric rendering, TurboModule JSI bridges, Reanimated 3 spring physics, and push notification pipelines with Expo EAS.",
    price: 24000,
    level: "INTERMEDIATE",
    thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80",
    featured: true,
    instructorId: trainerIbrahim.id,
    categoryId: catWeb.id,
    sections: [
      {
        title: "Module 1: React Native New Architecture & Fabric",
        lessons: [
          {
            title: "Understanding Fabric Renderer & TurboModule JSI Bindings",
            duration: "24 mins",
            isFree: true,
            content: "Transitioning away from the legacy asynchronous JSON bridge to direct C++ memory pointers.",
          },
          {
            title: "Fluid Gestures & Physics with React Native Reanimated 3",
            duration: "28 mins",
            isFree: false,
            content: "Running gesture handling and spring animations directly on the UI thread at 120 FPS.",
          },
        ],
      },
      {
        title: "Module 2: Offline Persistence & Store Deployment",
        lessons: [
          {
            title: "Offline-First Data Sync with WatermelonDB & SQLite",
            duration: "30 mins",
            isFree: false,
            content: "Architecting local SQLite relational stores that sync seamlessly when network reconnects.",
          },
          {
            title: "Building & Distributing Binaries with Expo Application Services (EAS)",
            duration: "26 mins",
            isFree: false,
            content: "Automated provisioning profiles, testflight distribution, and Google Play internal testing tracks.",
          },
        ],
      },
    ],
    quizTitle: "React Native Architecture & Performance Quiz",
    questions: [
      {
        text: "What architectural component in React Native replaces the legacy JSON serialization bridge?",
        options: [
          "JavaScript Interface (JSI) enabling direct C++ host object calls",
          "WebSockets over HTTP",
          "A background WebView thread",
          "Shared XML files",
        ],
        correctIndex: 0,
        explanation: "JSI allows JavaScript to hold direct references to C++ host objects without JSON string serialization.",
      },
    ],
  });

  // --- COURSE 19: Flutter App Development (Muhammad Ibrahim) ---
  const course19 = await seedCurriculum({
    title: "Flutter App Development",
    slug: "flutter-dart-masterclass-mobile-development",
    subtitle: "Create smooth, modern native mobile apps using Google Flutter & Dart.",
    description: "Taught by Muhammad Ibrahim, learn Dart 3 modern features like records and pattern matching, Flutter widget trees, BLoC state management, platform channels for native hardware access, and clean architecture patterns.",
    price: 26000,
    level: "BEGINNER",
    thumbnail: "https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=800&auto=format&fit=crop&q=80",
    featured: true,
    instructorId: trainerIbrahim.id,
    categoryId: catWeb.id,
    sections: [
      {
        title: "Module 1: Dart 3 Fundamentals & Flutter Widget Hierarchy",
        lessons: [
          {
            title: "Dart 3 Type System, Records, Pattern Matching & Null Safety",
            duration: "22 mins",
            isFree: true,
            content: "Mastering modern Dart sound null safety, exhaustive pattern switches, and record tuples.",
          },
          {
            title: "Declarative UI: StatelessWidget vs StatefulWidget Lifecycle",
            duration: "25 mins",
            isFree: false,
            content: "Understanding the Element, RenderObject, and Widget trees for 120 FPS frame stability.",
          },
        ],
      },
      {
        title: "Module 2: State Architecture & Native Hardware",
        lessons: [
          {
            title: "Clean Architecture with BLoC & Hydrated State Persistence",
            duration: "32 mins",
            isFree: false,
            content: "Unidirectional data flow with events, states, streams, and offline state dehydration.",
          },
          {
            title: "Platform Channels: Invoking Kotlin and Swift Native APIs",
            duration: "27 mins",
            isFree: false,
            content: "MethodChannel communication with native iOS CoreMotion and Android SensorManager.",
          },
        ],
      },
    ],
    quizTitle: "Flutter BLoC & Native Platform Channels Quiz",
    questions: [
      {
        text: "In Flutter, which architectural engine layer is responsible for rendering widgets directly to GPU surfaces?",
        options: [
          "Flutter Engine (C++ / Impeller / Skia)",
          "Chrome V8 JavaScript Engine",
          "Android Dalvik VM",
          "WebAssembly Runtime",
        ],
        correctIndex: 0,
        explanation: "The Flutter Engine is written in C++ and utilizes Impeller/Skia to draw UI directly to hardware surfaces.",
      },
    ],
  });

  console.log("✓ Seeded all 19 comprehensive computer science & engineering curricula");

  // 3. Seed Realistic Enrollments across Multiple Courses
  // Student 1 (Murtaza Wazir): Enrolled in 4 courses with certificates and progress
  await prisma.enrollment.create({
    data: {
      userId: studentMurtaza.id,
      courseId: course1.id,
      progress: 100.0,
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
  });

  await prisma.enrollment.create({
    data: {
      userId: studentMurtaza.id,
      courseId: course2.id,
      progress: 100.0,
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
  });

  await prisma.enrollment.create({
    data: {
      userId: studentMurtaza.id,
      courseId: course4.id,
      progress: 75.0,
    },
  });

  await prisma.enrollment.create({
    data: {
      userId: studentMurtaza.id,
      courseId: course7.id,
      progress: 45.0,
    },
  });

  // Student 2 (Ali Khan): Enrolled in course 1 and 5
  await prisma.enrollment.create({
    data: {
      userId: studentAli.id,
      courseId: course1.id,
      progress: 60.0,
    },
  });

  await prisma.enrollment.create({
    data: {
      userId: studentAli.id,
      courseId: course5.id,
      progress: 30.0,
    },
  });

  // Student 3 (Fatima Noor): Enrolled in course 4 and 5
  await prisma.enrollment.create({
    data: {
      userId: studentFatima.id,
      courseId: course4.id,
      progress: 90.0,
    },
  });

  // Student 1 (Murtaza Wazir): UI/UX Design with Adeel Qasir
  await prisma.enrollment.create({
    data: {
      userId: studentMurtaza.id,
      courseId: course13.id,
      progress: 85.0,
    },
  });

  await prisma.enrollment.create({
    data: {
      userId: studentMurtaza.id,
      courseId: course14.id,
      progress: 100.0,
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  // Student 2 (Ali Khan): Enterprise Next.js with Misbah Ullah
  await prisma.enrollment.create({
    data: {
      userId: studentAli.id,
      courseId: course16.id,
      progress: 50.0,
    },
  });

  // Student 3 (Fatima Noor): React Native with Muhammad Ibrahim
  await prisma.enrollment.create({
    data: {
      userId: studentFatima.id,
      courseId: course18.id,
      progress: 70.0,
    },
  });

  // 4. Seed Verified Digital Certificates
  await prisma.certificate.create({
    data: {
      certificateCode: "SN-2026-X89J21",
      userId: studentMurtaza.id,
      courseId: course1.id,
      issuedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.certificate.create({
    data: {
      certificateCode: "SN-2026-B94K12",
      userId: studentMurtaza.id,
      courseId: course2.id,
      issuedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.certificate.create({
    data: {
      certificateCode: "SN-2026-UX77A9",
      userId: studentMurtaza.id,
      courseId: course14.id,
      issuedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  // 5. Seed Course Reviews
  await prisma.review.create({
    data: {
      userId: studentMurtaza.id,
      courseId: course1.id,
      rating: 5,
      comment: "Outstanding architectural rigor! The Server Components and relational 3NF modeling sections are world-class.",
    },
  });

  await prisma.review.create({
    data: {
      userId: studentAli.id,
      courseId: course1.id,
      rating: 5,
      comment: "The best Next.js App Router guide available. Easy to follow, production-grade examples.",
    },
  });

  await prisma.review.create({
    data: {
      userId: studentMurtaza.id,
      courseId: course2.id,
      rating: 5,
      comment: "Prof. David Chen explains Go channels and the M:N scheduler with supreme clarity.",
    },
  });

  await prisma.review.create({
    data: {
      userId: studentFatima.id,
      courseId: course4.id,
      rating: 5,
      comment: "Dr. Sarah Mitchell breaks down autograd and backprop math intuitively.",
    },
  });

  await prisma.review.create({
    data: {
      userId: studentMurtaza.id,
      courseId: course13.id,
      rating: 5,
      comment: "Adeel Qasir's Figma design system breakdown is elite. The token naming conventions and auto-layout lessons saved me weeks of refactoring.",
    },
  });

  await prisma.review.create({
    data: {
      userId: studentAli.id,
      courseId: course16.id,
      rating: 5,
      comment: "Misbah Ullah explains Next.js server actions, optimistic UI, and Turborepo monorepos better than any course on the internet.",
    },
  });

  await prisma.review.create({
    data: {
      userId: studentFatima.id,
      courseId: course18.id,
      rating: 5,
      comment: "Muhammad Ibrahim's deep dive into React Native Fabric and JSI bridges is unbelievable! Pure senior engineering knowledge.",
    },
  });

  console.log("✓ Seeded realistic enrollments, reviews, and verified certificates");
  console.log("🚀 SkillNova Academy database is fully populated and ready for FYP evaluation!");
}

main()
  .catch((e) => {
    console.error("❌ Error during database seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
