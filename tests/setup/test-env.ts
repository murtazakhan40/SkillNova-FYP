// Enforce dedicated test database environment
process.env.DATABASE_URL = "postgresql://postgres:12345@localhost:5432/skillnova_test_db?schema=public";
process.env.NEXTAUTH_SECRET = "skillnova-test-secret-key-32-chars-long!";
process.env.NEXTAUTH_URL = "http://localhost:3000";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
