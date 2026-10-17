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

  // --- COURSE 1: Next.js & TypeScript ---
  const course1 = await seedCurriculum({
    title: "Full-Stack Web Engineering with Next.js 15 & TypeScript",
    slug: "fullstack-nextjs-typescript",
    subtitle: "Master the App Router, Server Actions, Prisma ORM, and enterprise deployment.",
    description: "This flagship curriculum guides BS Computer Science students and professional engineers through the complete lifecycle of production-grade modern web applications. You will engineer reactive interfaces, design relational databases, secure authentication systems, and deploy cloud applications.",
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

  // --- COURSE 2: Go Backend & Microservices ---
  const course2 = await seedCurriculum({
    title: "Advanced Backend Engineering with Go, gRPC & Microservices",
    slug: "advanced-backend-go-grpc",
    subtitle: "High-throughput microservices, concurrency patterns, and gRPC communication.",
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

  // --- COURSE 3: React Native & Expo ---
  const course3 = await seedCurriculum({
    title: "Cross-Platform Mobile Engineering with React Native & Expo",
    slug: "cross-platform-react-native-expo",
    subtitle: "Build native iOS and Android apps with a single modern TypeScript codebase.",
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

  // --- COURSE 4: Machine Learning with PyTorch ---
  const course4 = await seedCurriculum({
    title: "Applied Machine Learning & Deep Neural Networks with PyTorch",
    slug: "applied-machine-learning-pytorch",
    subtitle: "From tensors and backpropagation to CNNs, RNNs, and model deployment.",
    description: "Gain hands-on mastery over deep learning mathematical fundamentals. Build computer vision classifiers, recurrent sequential models, and export optimized models using TorchScript and ONNX.",
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

  // --- COURSE 5: LLMs & Generative AI ---
  const course5 = await seedCurriculum({
    title: "Large Language Models (LLMs) & Generative AI Engineering",
    slug: "large-language-models-generative-ai",
    subtitle: "Transformers, Self-Attention, LoRA Fine-Tuning, and RAG Pipelines.",
    description: "Deep dive into the transformer revolution. Master the Multi-Head Attention mechanism, fine-tune open-weights models with LoRA/QLoRA, and build production Retrieval-Augmented Generation (RAG) architectures with vector databases.",
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
    title: "Computer Vision & Image Processing with OpenCV & PyTorch",
    slug: "computer-vision-opencv-pytorch",
    subtitle: "Real-time object detection, segmentation, and feature extraction.",
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

  // --- COURSE 7: Docker, Kubernetes & AWS ---
  const course7 = await seedCurriculum({
    title: "Cloud Infrastructure Engineering with Docker, Kubernetes & AWS",
    slug: "cloud-infrastructure-docker-kubernetes-aws",
    subtitle: "Container orchestration, ingress controllers, microservices on AWS EKS.",
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

  // --- COURSE 8: Terraform IaC ---
  await seedCurriculum({
    title: "Enterprise Infrastructure as Code (IaC) with Terraform & AWS",
    slug: "enterprise-infrastructure-as-code-terraform",
    subtitle: "Declarative infrastructure provisioning, state management, and modules.",
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

  // --- COURSE 9: Offensive Cybersecurity ---
  const course9 = await seedCurriculum({
    title: "Offensive Cybersecurity & Ethical Penetration Testing Mastery",
    slug: "offensive-cybersecurity-ethical-hacking",
    subtitle: "Network reconnaissance, web exploits, privilege escalation, and defense.",
    description: "Learn ethical hacking from scratch. Master Nmap scanning, Burp Suite intercepting, SQL injection, Cross-Site Scripting (XSS), Buffer Overflows, and Metasploit framework.",
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

  // --- COURSE 10: Zero-Trust Security ---
  await seedCurriculum({
    title: "Zero-Trust Security & Cloud Defenses on AWS and Azure",
    slug: "zero-trust-cloud-security-defenses",
    subtitle: "Identity-aware access, IAM policies, mutual TLS, and threat modeling.",
    description: "Replace legacy perimeter security with modern Zero-Trust architectures. Learn least privilege IAM policies, mTLS service meshes, micro-segmentation, and SIEM monitoring.",
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

  // --- COURSE 11: Data Structures & LeetCode ---
  const course11 = await seedCurriculum({
    title: "Data Structures, Competitive Algorithms & LeetCode Mastery",
    slug: "data-structures-algorithms-leetcode-mastery",
    subtitle: "Ace technical coding interviews: Graphs, DP, Trees, and Complexity Analysis.",
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

  // --- COURSE 12: Database Internals ---
  await seedCurriculum({
    title: "Database Engine Internals, Query Optimization & Storage Systems",
    slug: "database-engine-internals-query-optimization",
    subtitle: "B-Trees, LSM-Trees, Write-Ahead Logs (WAL), and MVCC Concurrency.",
    description: "Understand what happens underneath the SQL prompt. Learn page buffer managers, B+ Trees vs LSM-Trees, Write-Ahead Logging (WAL) for crash recovery, and multi-version concurrency control.",
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

  // --- COURSE 13: UI/UX Design Systems ---
  await seedCurriculum({
    title: "UI/UX Design Systems & Interactive Prototyping in Figma",
    slug: "ui-ux-design-systems-prototyping",
    subtitle: "Design stunning digital experiences, component libraries, and interactive design tokens in Figma.",
    description: "Elevate your user experience design skills from wireframing to high-fidelity accessible design systems. Learn typography scales, WCAG contrast compliance, auto-layout variants, and handoff to engineering.",
    price: 12000,
    level: "BEGINNER",
    thumbnail: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80",
    featured: false,
    instructorId: trainerMitchell.id,
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

  console.log("✓ Seeded all 13 comprehensive computer science curricula");

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
