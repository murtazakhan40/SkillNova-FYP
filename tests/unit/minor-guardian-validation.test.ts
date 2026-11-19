import { describe, it, expect } from "vitest";
import { 
  UserProfileSchema, 
  MinorGuardianEnrollmentSchema,
  SendParentReportSchema 
} from "@/lib/validations";

describe("Unit: Under-18 Minor Student Guardian & Reporting Validation Engine", () => {
  describe("MinorGuardianEnrollmentSchema", () => {
    it("should reject enrollment for under-18 student when parent details are missing", () => {
      const result = MinorGuardianEnrollmentSchema.safeParse({
        courseId: "course-uuid-123",
        age: 15,
        parentName: "",
        parentEmail: "",
        parentPhone: "",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.issues.map((i) => i.message);
        expect(errorMessages.some((m) => m.includes("Parent/guardian full name"))).toBe(true);
        expect(errorMessages.some((m) => m.includes("valid parent/guardian email"))).toBe(true);
        expect(errorMessages.some((m) => m.includes("phone or WhatsApp"))).toBe(true);
      }
    });

    it("should accept enrollment for under-18 student when complete guardian details are provided", () => {
      const result = MinorGuardianEnrollmentSchema.safeParse({
        courseId: "course-uuid-123",
        age: 16,
        parentName: "Sarah Wazir",
        parentEmail: "sarah.wazir@example.com",
        parentPhone: "+92 300 1234567",
        parentRelationship: "Mother",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.age).toBe(16);
        expect(result.data.parentName).toBe("Sarah Wazir");
        expect(result.data.parentEmail).toBe("sarah.wazir@example.com");
      }
    });

    it("should accept enrollment for adult student (age >= 18) without requiring parent details", () => {
      const result = MinorGuardianEnrollmentSchema.safeParse({
        courseId: "course-uuid-456",
        age: 21,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.age).toBe(21);
        expect(result.data.parentEmail).toBeFalsy();
      }
    });
  });

  describe("UserProfileSchema Minor Validation", () => {
    it("should fail profile update if age is under 18 and parent email is invalid", () => {
      const result = UserProfileSchema.safeParse({
        name: "Young Student",
        email: "young@skillnova.edu",
        age: 14,
        parentName: "Guardian Name",
        parentEmail: "invalid-email-format",
        parentPhone: "+92 300 0000000",
      });

      expect(result.success).toBe(false);
    });

    it("should pass profile update for minor student with valid parent details", () => {
      const result = UserProfileSchema.safeParse({
        name: "Young Scholar",
        email: "young@skillnova.edu",
        age: 14,
        parentName: "Father Name",
        parentEmail: "father@example.com",
        parentPhone: "+92 301 9876543",
        parentRelationship: "Father",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.age).toBe(14);
        expect(result.data.parentEmail).toBe("father@example.com");
      }
    });

    it("should pass profile update for adult student without parent details", () => {
      const result = UserProfileSchema.safeParse({
        name: "Adult Scholar",
        email: "adult@skillnova.edu",
        age: 24,
      });

      expect(result.success).toBe(true);
    });
  });

  describe("SendParentReportSchema", () => {
    it("should validate report dispatch payload", () => {
      const result = SendParentReportSchema.safeParse({
        studentId: "student-uuid-999",
        courseId: "course-uuid-888",
        reportType: "PROGRESS_UPDATE",
        customNote: "Keep up the great work!",
      });

      expect(result.success).toBe(true);
    });
  });
});
