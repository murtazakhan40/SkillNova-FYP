import { db } from "../src/lib/db";

async function main() {
  console.log("Testing backend connection via src/lib/db.ts...");
  
  // Query PostgreSQL server safely using tagged template literal (No Unsafe string concatenation)
  const serverInfo = await db.$queryRaw<
    Array<{
      db_name: string;
      user_name: string;
      server_ip: string | null;
      server_port: number | null;
      pg_version: string;
    }>
  >`SELECT current_database() as db_name, current_user as user_name, inet_server_addr() as server_ip, inet_server_port() as server_port, version() as pg_version;`;
  
  console.log("Connected Successfully! Details from PostgreSQL:");
  console.log(`- Database Name: ${serverInfo[0].db_name}`);
  console.log(`- Database User: ${serverInfo[0].user_name}`);
  console.log(`- Port:          ${serverInfo[0].server_port}`);
  console.log(`- Version:       ${serverInfo[0].pg_version}`);

  const userCount = await db.user.count();
  const courseCount = await db.course.count();
  console.log(`- Live Users:    ${userCount}`);
  console.log(`- Live Courses:  ${courseCount}`);
  
  process.exit(0);
}

main().catch(err => {
  console.error("Backend connection failed:", err);
  process.exit(1);
});
