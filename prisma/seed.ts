import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting SkillNova Academy Database Seed (Expanding Course Catalog)...");

  // Clean existing records in proper relational order
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

  // 1. Create Default Users (Hashed passwords)
  const studentPassword = await bcrypt.hash("student123", 10);
  const trainerPassword = await bcrypt.hash("trainer123", 10);
  const adminPassword = await bcrypt.hash("admin123", 10);

  const student = await prisma.user.create({
    data: {
      name: "Murtaza Wazir",
      email: "murtazwazir.edu@gmail.com",
      passwordHash: studentPassword,
      role: "STUDENT",
      phone: "03029983146",
      headline: "Lead Software Architect & BS Computer Science Project Lead",
      bio: "Creator and Lead Developer of SkillNova Academy. Specializing in Next.js 15 App Router, TypeScript, relational database modeling, and scalable web architectures. Contact: 0302-9983146 | murtazwazir.edu@gmail.com",
      avatar: "/murtaza-wazir.jpg",
    },
  });

  // Alias demo student account for convenience
  await prisma.user.create({
    data: {
      name: "Ali Khan",
      email: "student@skillnova.com",
      passwordHash: studentPassword,
      role: "STUDENT",
      phone: "03001234567",
      headline: "BS Computer Science Undergraduate",
      bio: "Aspiring software engineer passionate about modern web apps, cloud tech, and AI.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  const trainer1 = await prisma.user.create({
    data: {
      name: "Murtaza Wazir",
      email: "trainer@skillnova.com",
      passwordHash: trainerPassword,
      role: "TRAINER",
      phone: "03029983146",
      headline: "Lead Software Architect & Web Engineering Specialist",
      bio: "Creator and Lead Architect of SkillNova Academy. Specializing in Next.js 15 App Router, TypeScript, Prisma ORM, and high-performance cloud architectures. Contact: 0302-9983146 | murtazwazir.edu@gmail.com",
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
      bio: "12+ years building distributed cloud platforms, full-stack applications, and machine learning pipelines.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    },
  });

  const trainer2 = await prisma.user.create({
    data: {
      name: "Prof. David Chen",
      email: "david.chen@skillnova.com",
      passwordHash: trainerPassword,
      role: "TRAINER",
      headline: "Former Tech Lead at Google • Algorithms & Distributed Systems",
      bio: "Author of advanced competitive programming textbooks and veteran distributed systems researcher.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
  });

  const trainer3 = await prisma.user.create({
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

  const trainer4 = await prisma.user.create({
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

  console.log("✓ Created default users & faculty");

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
      description: "Machine learning, deep neural networks, computer vision, and NLP.",
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

  // --- COURSE 1: Next.js & Full-Stack ---
  const course1 = await seedCurriculum({
    title: "Full-Stack Web Engineering with Next.js 15 & TypeScript",
    slug: "fullstack-nextjs-typescript",
    subtitle: "Master the App Router, Server Actions, Prisma ORM, and enterprise deployment.",
    description: "This flagship curriculum guides BS Computer Science students and professional engineers through the complete lifecycle of production-grade modern web applications. You will engineer reactive interfaces, design relational databases, secure authentication systems, and deploy cloud applications.",
    price: 18500,
    level: "INTERMEDIATE",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    featured: true,
    instructorId: trainer1.id,
    categoryId: catWeb.id,
    sections: [
      {
        title: "Module 1: Next.js Architecture & Server Components",
        lessons: [
          {
            title: "Platform Overview & Next.js App Router Paradigms",
            duration: "14 mins",
            isFree: true,
            content: "Deep dive into React Server Components, hydration boundaries, and streaming HTML.",
          },
          {
            title: "Designing Responsive Layouts with Tailwind CSS",
            duration: "22 mins",
            isFree: true,
            content: "Configuring CSS variables, fluid breakpoints, and high-performance micro-interactions.",
          },
        ],
      },
      {
        title: "Module 2: Relational Modeling & Database Architecture",
        lessons: [
          {
            title: "Prisma Schema Design & Relational Constraints",
            duration: "28 mins",
            isFree: false,
            content: "3NF schema normalization, foreign key relations, cascade behaviors, and Prisma Client.",
          },
        ],
      },
    ],
    quizTitle: "Next.js & Server Components Mastery Assessment",
    questions: [
      {
        text: "What is the primary benefit of React Server Components (RSC) in Next.js?",
        options: [
          "They send zero JavaScript bundle to the browser for non-interactive content",
          "They run exclusively in local storage on the client machine",
          "They disable all CSS styling",
          "They convert React components into PHP scripts",
        ],
        correctIndex: 0,
        explanation: "RSC renders on the server and streams pure HTML/JSON, keeping the client bundle lean.",
      },
      {
        text: "Which directory in Next.js defines route segments using the App Router?",
        options: ["src/routes", "src/app", "src/pages", "src/controllers"],
        correctIndex: 1,
        explanation: "The App Router uses the 'app' directory to define nested routes using folder hierarchies.",
      },
    ],
  });

  // --- COURSE 2: Go, gRPC & Microservices ---
  await seedCurriculum({
    title: "Advanced Backend Engineering with Go, gRPC & Microservices",
    slug: "advanced-backend-go-grpc-microservices",
    subtitle: "Design high-throughput concurrent services with Protocol Buffers and event buses.",
    description: "Go is the language of modern cloud infrastructure. In this advanced backend course, you will build microservice architectures with gRPC, implement goroutines and channels for high concurrency, handle distributed tracing, and manage PostgreSQL connection pools.",
    price: 24000,
    level: "ADVANCED",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    featured: true,
    instructorId: trainer2.id,
    categoryId: catWeb.id,
    sections: [
      {
        title: "Module 1: Go Concurrency & Memory Model",
        lessons: [
          {
            title: "Goroutines, Channels & CSP Concurrency Patterns",
            duration: "25 mins",
            isFree: true,
            content: "Understanding Communicating Sequential Processes (CSP), buffered channels, and select statements.",
          },
          {
            title: "Mutexes, Atomic Primitives & Race Detection",
            duration: "20 mins",
            isFree: false,
            content: "Thread-safe data structures in Go, sync.Mutex, sync.RWMutex, and the -race flag.",
          },
        ],
      },
      {
        title: "Module 2: gRPC & Protocol Buffers",
        lessons: [
          {
            title: "Defining Schemas with Proto3 & Code Generation",
            duration: "30 mins",
            isFree: false,
            content: "Compiling .proto files into Go stubs, bidirectional streaming, and status codes.",
          },
        ],
      },
    ],
    quizTitle: "Go Microservices & Concurrency Quiz",
    questions: [
      {
        text: "What does CSP stand for in Go's concurrency model?",
        options: [
          "Communicating Sequential Processes",
          "Centralized Server Protocol",
          "Concurrent System Programming",
          "Core Socket Pipeline",
        ],
        correctIndex: 0,
        explanation: "Go concurrency is modeled after C.A.R. Hoare's Communicating Sequential Processes.",
      },
    ],
  });

  // --- COURSE 3: React Native Mobile Development ---
  await seedCurriculum({
    title: "Cross-Platform Mobile Engineering with React Native & Expo",
    slug: "cross-platform-react-native-expo",
    subtitle: "Build iOS and Android applications with native performance and shared TypeScript code.",
    description: "Learn to build cross-platform mobile apps for iOS and Android using React Native and Expo. Understand gesture responders, offline caching with SQLite, push notifications, and deployment to the Apple App Store and Google Play Store.",
    price: 16000,
    level: "INTERMEDIATE",
    thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80",
    featured: false,
    instructorId: trainer1.id,
    categoryId: catWeb.id,
    sections: [
      {
        title: "Module 1: Mobile UI Architecture",
        lessons: [
          {
            title: "Expo Router & File-Based Mobile Navigation",
            duration: "18 mins",
            isFree: true,
            content: "Setting up tab bars, stack navigators, and deep linking on mobile platforms.",
          },
          {
            title: "Native Layouts, Safe Areas & Touch Responders",
            duration: "24 mins",
            isFree: false,
            content: "Managing viewport notches, gesture handling, and React Native Reanimated.",
          },
        ],
      },
    ],
    quizTitle: "React Native Architecture Quiz",
    questions: [
      {
        text: "What is the new React Native rendering architecture called?",
        options: ["Fabric", "TurboDOM", "Blink", "Hermes"],
        correctIndex: 0,
        explanation: "Fabric is the new C++ rendering engine in React Native that communicates directly with native views without the legacy bridge.",
      },
    ],
  });

  // --- COURSE 4: Machine Learning & PyTorch ---
  const course4 = await seedCurriculum({
    title: "Applied Machine Learning & Deep Neural Networks with PyTorch",
    slug: "applied-machine-learning-deep-neural-networks",
    subtitle: "From gradient descent and loss functions to Transformer architectures with PyTorch.",
    description: "Understand mathematical foundations of artificial intelligence and build real-world vision and NLP models. Explore backpropagation, stochastic gradient descent, multi-layer perceptrons, regularization, and model evaluation metrics.",
    price: 26500,
    level: "ADVANCED",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80",
    featured: true,
    instructorId: trainerMitchell.id,
    categoryId: catAI.id,
    sections: [
      {
        title: "Module 1: Tensor Calculus & Neural Network Foundations",
        lessons: [
          {
            title: "Tensors, Autograd & Computational Graphs",
            duration: "26 mins",
            isFree: true,
            content: "Building automatic differentiation engines and understanding backpropagation flow.",
          },
          {
            title: "Training Deep Feedforward Networks",
            duration: "32 mins",
            isFree: false,
            content: "Loss functions (CrossEntropy, MSE), Adam optimizer, and learning rate schedulers.",
          },
        ],
      },
    ],
    quizTitle: "Neural Networks & Backpropagation Quiz",
    questions: [
      {
        text: "Which algorithm computes gradients of the loss function with respect to model weights?",
        options: ["Backpropagation", "K-Means", "Dijkstra's Algorithm", "A* Search"],
        correctIndex: 0,
        explanation: "Backpropagation applies the calculus chain rule recursively through the computational graph.",
      },
    ],
  });

  // --- COURSE 5: LLMs & Generative AI ---
  await seedCurriculum({
    title: "Large Language Models (LLMs) & Generative AI Engineering",
    slug: "llms-generative-ai-engineering",
    subtitle: "Build Retrieval-Augmented Generation (RAG) pipelines, embeddings, and autonomous AI agents.",
    description: "Master modern AI application development. Learn transformer self-attention mechanisms, tokenization, vector databases (Pinecone, ChromaDB), LangChain orchestration, and fine-tuning open-source models with LoRA/QLoRA.",
    price: 29000,
    level: "ADVANCED",
    thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80",
    featured: true,
    instructorId: trainerMitchell.id,
    categoryId: catAI.id,
    sections: [
      {
        title: "Module 1: Attention Mechanisms & Transformers",
        lessons: [
          {
            title: "Self-Attention Mathematics: Query, Key, Value",
            duration: "35 mins",
            isFree: true,
            content: "The math behind Vaswani et al. 'Attention Is All You Need' and scaled dot-product attention.",
          },
          {
            title: "Vector Embeddings & Semantic Search",
            duration: "28 mins",
            isFree: false,
            content: "Generating high-dimensional embeddings and calculating cosine similarity in vector stores.",
          },
        ],
      },
    ],
    quizTitle: "Transformer & RAG Architecture Quiz",
    questions: [
      {
        text: "What does RAG stand for in modern AI application architecture?",
        options: [
          "Retrieval-Augmented Generation",
          "Recursive Attention Graph",
          "Random Automated Generator",
          "Relational Attribute Grouping",
        ],
        correctIndex: 0,
        explanation: "Retrieval-Augmented Generation combines external document retrieval with generative language models.",
      },
    ],
  });

  // --- COURSE 6: Computer Vision ---
  await seedCurriculum({
    title: "Computer Vision & Image Processing with OpenCV & PyTorch",
    slug: "computer-vision-image-processing-opencv",
    subtitle: "Object detection, semantic segmentation, and real-time visual tracking.",
    description: "Explore the visual computing domain from matrix filtering and edge detection to state-of-the-art YOLO object detectors and convolutional neural networks (CNNs).",
    price: 21000,
    level: "INTERMEDIATE",
    thumbnail: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=800&auto=format&fit=crop&q=80",
    featured: false,
    instructorId: trainerMitchell.id,
    categoryId: catAI.id,
    sections: [
      {
        title: "Module 1: Convolutional Neural Networks",
        lessons: [
          {
            title: "Feature Maps, Pooling & Receptive Fields",
            duration: "22 mins",
            isFree: true,
            content: "Understanding 2D spatial convolutions, stride, padding, and max-pooling.",
          },
        ],
      },
    ],
    quizTitle: "Computer Vision & CNN Quiz",
    questions: [
      {
        text: "What is the primary function of a pooling layer in a CNN?",
        options: [
          "Downsample spatial dimensions while preserving dominant features",
          "Increase the image resolution",
          "Convert color images to grayscale",
          "Encrypt image bytes",
        ],
        correctIndex: 0,
        explanation: "Pooling reduces spatial dimensionality, controlling computational load and preventing overfitting.",
      },
    ],
  });

  // --- COURSE 7: Cloud & Kubernetes ---
  await seedCurriculum({
    title: "Cloud Infrastructure Engineering with Docker, Kubernetes & AWS",
    slug: "cloud-infrastructure-docker-kubernetes",
    subtitle: "Containerize applications, orchestrate microservices, and deploy multi-region clusters.",
    description: "Learn production DevOps practices: multi-stage Docker builds, Kubernetes Pod orchestration, Ingress controllers, Helm package management, and continuous delivery pipelines.",
    price: 17500,
    level: "INTERMEDIATE",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    featured: false,
    instructorId: trainer2.id,
    categoryId: catCloud.id,
    sections: [
      {
        title: "Module 1: Containerization with Docker",
        lessons: [
          {
            title: "Linux Namespaces, Cgroups & Docker Architecture",
            duration: "20 mins",
            isFree: true,
            content: "How the Linux kernel isolates processes through namespaces and control groups.",
          },
        ],
      },
    ],
    quizTitle: "Docker & Kubernetes Core Concepts Quiz",
    questions: [
      {
        text: "Which Kubernetes component schedules pods onto worker nodes?",
        options: ["kube-scheduler", "kubelet", "etcd", "kube-proxy"],
        correctIndex: 0,
        explanation: "kube-scheduler watches for newly created pods with no assigned node and selects an optimal node for them.",
      },
    ],
  });

  // --- COURSE 8: Infrastructure as Code & Terraform ---
  await seedCurriculum({
    title: "Enterprise Infrastructure as Code (IaC) with Terraform & AWS",
    slug: "enterprise-infrastructure-as-code-terraform",
    subtitle: "Automate multi-cloud provisioning, VPCs, IAM roles, and automated disaster recovery.",
    description: "Declarative infrastructure automation using HashiCorp Terraform. Manage remote state with S3 and DynamoDB locks, author reusable modules, and enforce compliance policies.",
    price: 19500,
    level: "ADVANCED",
    thumbnail: "https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=800&auto=format&fit=crop&q=80",
    featured: false,
    instructorId: trainer2.id,
    categoryId: catCloud.id,
    sections: [
      {
        title: "Module 1: Declarative Cloud Provisioning",
        lessons: [
          {
            title: "Terraform State Management & Resource Graphs",
            duration: "24 mins",
            isFree: true,
            content: "Graph resolution, state locking, drift detection, and terraform plan workflows.",
          },
        ],
      },
    ],
    quizTitle: "Terraform IaC Quiz",
    questions: [
      {
        text: "Where should production Terraform state files be stored?",
        options: [
          "In a remote object store with state locking (e.g. S3 + DynamoDB)",
          "On the developer's desktop",
          "Directly committed to public GitHub repositories",
          "In browser localStorage",
        ],
        correctIndex: 0,
        explanation: "Remote backends provide team state locking, encryption at rest, and audit logs.",
      },
    ],
  });

  // --- COURSE 9: Offensive Cybersecurity & Pen Testing ---
  await seedCurriculum({
    title: "Offensive Cybersecurity & Ethical Penetration Testing Mastery",
    slug: "offensive-cybersecurity-ethical-penetration-testing",
    subtitle: "Hands-on vulnerability scanning, reverse engineering, buffer overflows, and red team exploits.",
    description: "Understand the adversarial mindset to build unassailable digital fortifications. Master reconnaissance, web application exploits (SQL injection, XSS, SSRF), privilege escalation, and network packet analysis with Wireshark.",
    price: 27000,
    level: "ADVANCED",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    featured: true,
    instructorId: trainer3.id,
    categoryId: catCyber.id,
    sections: [
      {
        title: "Module 1: Reconnaissance & Web Application Exploitation",
        lessons: [
          {
            title: "Network Mapping with Nmap & Port Fingerprinting",
            duration: "28 mins",
            isFree: true,
            content: "SYN scans, OS detection, service versioning, and NSE vulnerability scripts.",
          },
          {
            title: "SQL Injection Vectors & Parameterized Defense",
            duration: "30 mins",
            isFree: false,
            content: "Blind SQLi, UNION-based data extraction, and ORM/Prepared statement mitigation.",
          },
        ],
      },
    ],
    quizTitle: "Penetration Testing & Exploit Mechanics Quiz",
    questions: [
      {
        text: "Which SQL injection type does not return data in HTTP responses, relying instead on timing or boolean inferences?",
        options: ["Blind SQL Injection", "Classic UNION Injection", "Stacked Query", "Direct Output"],
        correctIndex: 0,
        explanation: "Blind SQL injection extracts data by inferring database behavior through true/false response differences or database sleep delays.",
      },
    ],
  });

  // --- COURSE 10: Zero-Trust & Cloud Security ---
  await seedCurriculum({
    title: "Zero-Trust Security & Cloud Defenses on AWS and Azure",
    slug: "zero-trust-cloud-defenses-aws-azure",
    subtitle: "Implement identity federation, mutual TLS (mTLS), and automated threat detection.",
    description: "Never trust, always verify. Design zero-trust microservice meshes with Istio, manage secrets with HashiCorp Vault, enforce least privilege IAM, and monitor cloud logs with SIEM tools.",
    price: 22500,
    level: "INTERMEDIATE",
    thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
    featured: false,
    instructorId: trainer3.id,
    categoryId: catCyber.id,
    sections: [
      {
        title: "Module 1: Identity & Access Management (IAM)",
        lessons: [
          {
            title: "Principle of Least Privilege & Role-Based Access Control",
            duration: "21 mins",
            isFree: true,
            content: "Designing RBAC policy matrices, token validation, and OAuth2/OIDC flows.",
          },
        ],
      },
    ],
    quizTitle: "Zero-Trust Architecture Quiz",
    questions: [
      {
        text: "What is the core premise of the Zero-Trust security model?",
        options: [
          "Assume breach and verify every request explicitly, regardless of network location",
          "Trust any connection that originates from inside the office network",
          "Disable all firewall rules to speed up connections",
          "Rely solely on single-factor passwords",
        ],
        correctIndex: 0,
        explanation: "Zero-Trust assumes no user or device is trusted by default inside or outside the perimeter.",
      },
    ],
  });

  // --- COURSE 11: Data Structures & Algorithms ---
  await seedCurriculum({
    title: "Data Structures, Competitive Algorithms & LeetCode Mastery",
    slug: "data-structures-competitive-algorithms-mastery",
    subtitle: "Asymptotic notation, graphs, trees, dynamic programming, and technical interview excellence.",
    description: "The definitive algorithmic foundation for BS Computer Science graduates. Master Big-O complexity, balanced binary search trees (AVL/Red-Black), graph traversals (Dijkstra, Tarjan, topological sort), and 2D dynamic programming.",
    price: 14500,
    level: "BEGINNER",
    thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=80",
    featured: true,
    instructorId: trainer2.id,
    categoryId: catAlgo.id,
    sections: [
      {
        title: "Module 1: Asymptotic Analysis & Core Structures",
        lessons: [
          {
            title: "Big-O, Big-Omega & Amortized Complexity",
            duration: "25 mins",
            isFree: true,
            content: "Formal mathematical definitions of runtime bounds and space-time tradeoffs.",
          },
          {
            title: "Dynamic Arrays, Hash Tables & Collision Resolution",
            duration: "30 mins",
            isFree: false,
            content: "Separate chaining, open addressing (linear probing, double hashing), and amortized doubling.",
          },
        ],
      },
    ],
    quizTitle: "Algorithms & Asymptotic Complexity Quiz",
    questions: [
      {
        text: "What is the average time complexity of searching in a well-balanced Hash Table?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correctIndex: 0,
        explanation: "With a good hash function and low load factor, hash table lookups take constant amortized time O(1).",
      },
    ],
  });

  // --- COURSE 12: Database Engine Internals ---
  await seedCurriculum({
    title: "Database Engine Internals, Query Optimization & Storage Systems",
    slug: "database-engine-internals-query-optimization",
    subtitle: "B-Trees, LSM-Trees, Write-Ahead Logs (WAL), and distributed consensus protocols.",
    description: "Look under the hood of database engines like PostgreSQL, SQLite, and CockroachDB. Understand disk page layouts, B+ Tree indexing, cost-based query planners, MVCC (Multi-Version Concurrency Control), and Raft consensus.",
    price: 25000,
    level: "ADVANCED",
    thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80",
    featured: false,
    instructorId: trainer4.id,
    categoryId: catAlgo.id,
    sections: [
      {
        title: "Module 1: On-Disk Storage Structures",
        lessons: [
          {
            title: "Slotted Page Layouts, Tuples & Write-Ahead Logging",
            duration: "32 mins",
            isFree: true,
            content: "Buffer pool management, page eviction (LRU-K), and crash recovery with ARIES.",
          },
          {
            title: "B+ Tree Indexing & Node Splitting Mechanics",
            duration: "35 mins",
            isFree: false,
            content: "Fanout calculations, root-to-leaf searches, and range scans in clustered indices.",
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

  console.log("✓ Seeded 13 comprehensive computer science curricula");

  // 4. Seed Student Enrollments
  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: course1.id,
      progress: 68.0,
    },
  });

  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: course4.id,
      progress: 35.0,
    },
  });

  // 5. Seed Course Reviews
  await prisma.review.create({
    data: {
      userId: student.id,
      courseId: course1.id,
      rating: 5,
      comment: "Exceptional course! The architectural depth and hands-on examples helped me ace my final semester project.",
    },
  });

  // 6. Seed a sample certificate
  await prisma.certificate.create({
    data: {
      certificateCode: "SN-2026-X89J21",
      userId: student.id,
      courseId: course1.id,
      issuedAt: new Date(),
    },
  });

  console.log("✓ Seeded student enrollments, reviews, and verified certificates");
  console.log("🚀 SkillNova Academy database seed completed successfully with 13 courses!");
}

main()
  .catch((e) => {
    console.error("❌ Error during database seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
