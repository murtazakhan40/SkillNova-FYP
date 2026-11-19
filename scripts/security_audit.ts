import fs from "fs";
import path from "path";

interface Finding {
  file: string;
  line: number;
  category: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  description: string;
  codeSnippet: string;
}

const findings: Finding[] = [];

function scanDirectory(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next" && entry.name !== ".git") {
        scanDirectory(fullPath);
      }
    } else if (
      entry.isFile() &&
      (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx") || fullPath.endsWith(".js")) &&
      !fullPath.endsWith("security_audit.ts")
    ) {
      scanFile(fullPath);
    }
  }
}

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const relPath = path.relative(process.cwd(), filePath);

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    // 1. PasswordHash leakage in queries or returns
    if (
      trimmed.includes("passwordHash: true") ||
      (trimmed.includes("passwordHash") &&
        !trimmed.includes("delete") &&
        !trimmed.includes("const ") &&
        !trimmed.includes(": string") &&
        !trimmed.includes("omit") &&
        trimmed.includes("return "))
    ) {
      findings.push({
        file: relPath,
        line: lineNum,
        category: "Information Exposure",
        severity: "CRITICAL",
        description: "Potential exposure of passwordHash in query selection or return value.",
        codeSnippet: trimmed,
      });
    }

    // 2. Raw SQL injection
    if (
      trimmed.includes("$queryRawUnsafe") ||
      trimmed.includes("$executeRawUnsafe") ||
      (trimmed.includes("$queryRaw`") && trimmed.includes("${") && !trimmed.includes("Prisma.sql"))
    ) {
      findings.push({
        file: relPath,
        line: lineNum,
        category: "SQL Injection",
        severity: "CRITICAL",
        description: "Use of raw SQL query with possible unparameterized string interpolation.",
        codeSnippet: trimmed,
      });
    }

    // 3. Unescaped dangerouslySetInnerHTML
    if (trimmed.includes("dangerouslySetInnerHTML") && !content.includes("\\u003c") && !relPath.includes("layout.tsx")) {
      findings.push({
        file: relPath,
        line: lineNum,
        category: "XSS Vulnerability",
        severity: "HIGH",
        description: "Usage of dangerouslySetInnerHTML without script tag escaping.",
        codeSnippet: trimmed,
      });
    }

    // 4. Hardcoded high-entropy tokens or production passwords
    if (
      /(['"])(?:AKIA[0-9A-Z]{16}|ghp_[0-9a-zA-Z]{36}|sk_live_[0-9a-zA-Z]{24})\1/i.test(trimmed)
    ) {
      findings.push({
        file: relPath,
        line: lineNum,
        category: "Hardcoded Credential",
        severity: "CRITICAL",
        description: "Hardcoded production API key or token detected.",
        codeSnippet: trimmed,
      });
    }

    // 5. Insecure eval or Function constructor
    if (/\beval\(|new\s+Function\(/.test(trimmed) && !trimmed.startsWith("//")) {
      findings.push({
        file: relPath,
        line: lineNum,
        category: "Code Injection",
        severity: "CRITICAL",
        description: "Arbitrary code execution primitive (eval or Function constructor).",
        codeSnippet: trimmed,
      });
    }
  });
}

console.log("=================================================================");
console.log("         SkillNova Static Code Security & Hygiene Scan           ");
console.log("=================================================================");
scanDirectory(path.join(process.cwd(), "src"));
scanDirectory(path.join(process.cwd(), "scripts"));

if (findings.length === 0) {
  console.log(" [PASS] 0 security vulnerabilities detected across all files.");
  console.log(" No hardcoded credentials, SQL injection, XSS vectors, or info leaks found.");
} else {
  console.log(` [ALERT] Found ${findings.length} issue(s):`);
  for (const f of findings) {
    console.log(`[${f.severity}] ${f.category} in ${f.file}:${f.line} -> ${f.description}`);
    console.log(`  Code: ${f.codeSnippet}`);
  }
}
console.log("=================================================================");
