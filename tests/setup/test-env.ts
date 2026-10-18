// Enforce dedicated test database environment
process.env.DATABASE_URL = "file:./test.db";
process.env.NEXTAUTH_SECRET = "skillnova-test-secret-key-32-chars-long!";
process.env.NEXTAUTH_URL = "http://localhost:3000";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
