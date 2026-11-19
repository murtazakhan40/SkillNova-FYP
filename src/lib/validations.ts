import { z } from "zod";

/**
 * Authentication Validation Schemas
 */
export const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(1, "Password is required."),
});

export const RegisterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long.")
    .max(80, "Name cannot exceed 80 characters."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid institutional or personal email."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(128, "Password cannot exceed 128 characters."),
  role: z
    .enum(["STUDENT", "TRAINER"])
    .default("STUDENT"),
});

/**
 * Learning & Assessment Schemas
 */
export const QuizSubmissionSchema = z.object({
  quizId: z.string().min(1, "Quiz identifier required."),
  answers: z.record(z.string(), z.number()),
});

export const ReviewSubmissionSchema = z.object({
  courseSlug: z.string().min(1, "Course identifier required."),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z
    .string()
    .trim()
    .min(5, "Review comment must be at least 5 characters.")
    .max(1000, "Review comment cannot exceed 1000 characters."),
});

export const LessonDiscussionSchema = z.object({
  lessonId: z.string().min(1, "Lesson identifier required."),
  content: z
    .string()
    .trim()
    .min(3, "Discussion inquiry must be at least 3 characters.")
    .max(1500, "Discussion message cannot exceed 1500 characters."),
  isAnswer: z.boolean().default(false),
  parentId: z.string().optional(),
});

/**
 * Checkout & Financial Schemas
 */
export const OrderInitiationSchema = z.object({
  courseId: z.string().min(1, "Course identifier required."),
});

export const SimulatedPaymentSchema = z.object({
  orderNumber: z.string().trim().min(1, "Order reference required."),
  paymentMethod: z.string().default("DEMO_CARD"),
  scenario: z.enum(["SUCCESS", "DECLINED_INSUFFICIENT_FUNDS", "DECLINED_CARD_EXPIRED", "CANCELLED"]).default("SUCCESS"),
});

/**
 * User Profile Update Schema
 */
export const UserProfileSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
    email: z.string().trim().toLowerCase().email("Please provide a valid email address."),
    headline: z.string().trim().max(120).optional().nullable(),
    bio: z.string().trim().max(800).optional().nullable(),
    phone: z.string().trim().max(30, "Phone number cannot exceed 30 characters.").optional().nullable(),
    avatar: z.string().optional().nullable(),
    age: z
      .preprocess((val) => (val === "" || val === null || val === undefined ? null : Number(val)), z.number().int().min(5, "Age must be at least 5 years.").max(120, "Please enter a valid age."))
      .optional()
      .nullable(),
    dateOfBirth: z.string().optional().nullable(),
    parentName: z.string().trim().max(80).optional().nullable(),
    parentEmail: z
      .string()
      .trim()
      .toLowerCase()
      .optional()
      .nullable()
      .refine(
        (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        "Please provide a valid parent email address."
      ),
    parentPhone: z.string().trim().max(30, "Parent phone cannot exceed 30 characters.").optional().nullable(),
    parentRelationship: z.string().trim().max(50).optional().nullable(),
    parentConsentGiven: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    // If student is under 18, guardian details are strictly mandatory
    if (data.age !== null && data.age !== undefined && data.age < 18) {
      if (!data.parentName || data.parentName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Parent or guardian full name is required for learners under 18 years of age.",
          path: ["parentName"],
        });
      }
      if (!data.parentEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.parentEmail.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Parent or guardian email address is required so we can send academic progress reports.",
          path: ["parentEmail"],
        });
      }
      if (!data.parentPhone || data.parentPhone.trim().length < 7) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Parent or guardian contact/WhatsApp number is required for students under 18.",
          path: ["parentPhone"],
        });
      }
    }
  });

/**
 * Minor Student Guardian Verification & Enrollment Schema
 */
export const MinorGuardianEnrollmentSchema = z
  .object({
    courseId: z.string().min(1, "Course identifier is required."),
    age: z.coerce.number().int().min(5, "Age must be at least 5 years.").max(120, "Please enter a realistic age."),
    parentName: z.string().trim().max(80).optional().nullable(),
    parentEmail: z
      .string()
      .trim()
      .toLowerCase()
      .optional()
      .nullable()
      .refine(
        (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        "Please provide a valid parent email address."
      ),
    parentPhone: z.string().trim().max(30).optional().nullable(),
    parentRelationship: z.string().trim().max(50).optional().nullable(),
    parentConsentGiven: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.age < 18) {
      if (!data.parentName || data.parentName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Parent/guardian full name is required for students under 18.",
          path: ["parentName"],
        });
      }
      if (!data.parentEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.parentEmail.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A valid parent/guardian email is required to receive course progress reports.",
          path: ["parentEmail"],
        });
      }
      if (!data.parentPhone || data.parentPhone.trim().length < 7) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A parent/guardian phone or WhatsApp number is required.",
          path: ["parentPhone"],
        });
      }
    }
  });

/**
 * Dispatch Parent Progress Report Schema
 */
export const SendParentReportSchema = z.object({
  studentId: z.string().min(1, "Student identifier required."),
  courseId: z.string().optional().nullable(),
  reportType: z
    .enum(["ENROLLMENT", "QUIZ_RESULT", "PROGRESS_UPDATE", "CERTIFICATE_ACHIEVED", "COMPREHENSIVE"])
    .default("PROGRESS_UPDATE"),
  customNote: z.string().trim().max(500).optional().nullable(),
});


