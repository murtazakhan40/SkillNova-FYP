import { describe, it, expect } from "vitest";
import {
  StudentRegistrationSchema,
  TrainerRegistrationSchema,
} from "@/lib/validations";

describe("Unit: Student and Trainer Registration Schemas", () => {
  describe("StudentRegistrationSchema", () => {
    it("should accept valid adult student registration without guardian details", () => {
      const validAdultData = {
        name: "Ali Khan",
        email: "ali.khan@example.com",
        password: "SecurePassword123!",
        phone: "+92 300 1234567",
        age: 22,
        educationLevel: "Undergraduate Student",
        fieldOfInterest: "Full-Stack Web Development",
      };

      const result = StudentRegistrationSchema.safeParse(validAdultData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Ali Khan");
        expect(result.data.email).toBe("ali.khan@example.com");
        expect(result.data.age).toBe(22);
      }
    });

    it("should accept valid minor student registration when complete guardian details are provided", () => {
      const validMinorData = {
        name: "Hamza Ahmed",
        email: "hamza@example.com",
        password: "StrongPassword123",
        phone: "+92 321 9876543",
        age: 15,
        educationLevel: "High School / College",
        fieldOfInterest: "Artificial Intelligence & ML",
        parentName: "Ahmed Farooq",
        parentEmail: "ahmed.farooq@example.com",
        parentPhone: "+92 300 5554321",
        parentRelationship: "Father",
        parentConsentGiven: true,
      };

      const result = StudentRegistrationSchema.safeParse(validMinorData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.age).toBe(15);
        expect(result.data.parentName).toBe("Ahmed Farooq");
        expect(result.data.parentEmail).toBe("ahmed.farooq@example.com");
      }
    });

    it("should reject minor student registration if parent guardian details are omitted", () => {
      const invalidMinorData = {
        name: "Young Learner",
        email: "young@example.com",
        password: "StrongPassword123",
        age: 14,
        parentName: "",
        parentEmail: "",
        parentPhone: "",
      };

      const result = StudentRegistrationSchema.safeParse(invalidMinorData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.issues.map((i) => i.message);
        expect(
          errorMessages.some((msg) =>
            msg.includes("Learners under 18 must provide parent/guardian")
          )
        ).toBe(true);
      }
    });

    it("should reject student registration with password shorter than 8 characters", () => {
      const shortPassData = {
        name: "Test Student",
        email: "test@example.com",
        password: "short",
      };

      const result = StudentRegistrationSchema.safeParse(shortPassData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("at least 8 characters");
      }
    });

    it("should reject invalid email formatting", () => {
      const invalidEmailData = {
        name: "Test Student",
        email: "invalid-email-address",
        password: "ValidPassword123",
      };

      const result = StudentRegistrationSchema.safeParse(invalidEmailData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("valid email address");
      }
    });
  });

  describe("TrainerRegistrationSchema", () => {
    it("should accept valid faculty trainer registration", () => {
      const validTrainer = {
        name: "Dr. Ayesha Malik",
        email: "ayesha.malik@university.edu",
        password: "FacultySecret123!",
        phone: "+92 333 1122334",
        headline: "Principal Machine Learning Engineer & Research Faculty",
        teachingDomain: "AI & Machine Learning",
        experienceYears: "5-10 Years",
        portfolioUrl: "https://linkedin.com/in/ayesha-malik",
        bio: "Specializing in deep learning, transformer architectures, and technical mentorship with over 8 years in academic and industry settings.",
      };

      const result = TrainerRegistrationSchema.safeParse(validTrainer);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Dr. Ayesha Malik");
        expect(result.data.teachingDomain).toBe("AI & Machine Learning");
        expect(result.data.experienceYears).toBe("5-10 Years");
      }
    });

    it("should reject trainer registration if contact phone is missing", () => {
      const missingPhone = {
        name: "Dr. Ayesha Malik",
        email: "ayesha@university.edu",
        password: "FacultySecret123!",
        phone: "",
        headline: "Principal ML Engineer",
        teachingDomain: "AI & Machine Learning",
        experienceYears: "5-10 Years",
        bio: "Experienced instructor with solid academic credentials and hands-on production engineering experience.",
      };

      const result = TrainerRegistrationSchema.safeParse(missingPhone);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((i) => i.message.includes("phone / WhatsApp number is required"))
        ).toBe(true);
      }
    });

    it("should reject trainer registration if bio is shorter than 20 characters", () => {
      const shortBio = {
        name: "Trainer John",
        email: "john@trainer.org",
        password: "FacultySecret123!",
        phone: "+1 555 1234567",
        headline: "Frontend Dev",
        teachingDomain: "Full-Stack Web Development",
        experienceYears: "1-3 Years",
        bio: "Too short bio",
      };

      const result = TrainerRegistrationSchema.safeParse(shortBio);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((i) => i.message.includes("at least 20 characters"))
        ).toBe(true);
      }
    });

    it("should reject trainer registration if professional headline is omitted", () => {
      const missingHeadline = {
        name: "Trainer John",
        email: "john@trainer.org",
        password: "FacultySecret123!",
        phone: "+1 555 1234567",
        headline: "",
        teachingDomain: "Full-Stack Web Development",
        experienceYears: "1-3 Years",
        bio: "Experienced web developer passionate about teaching React, Node.js, and TypeScript.",
      };

      const result = TrainerRegistrationSchema.safeParse(missingHeadline);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((i) => i.message.includes("Professional title is required"))
        ).toBe(true);
      }
    });
  });
});

