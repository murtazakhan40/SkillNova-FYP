import { db } from "../src/lib/db";

async function scan() {
  console.log("================================================================================");
  console.log("                       SKILLNOVA DATABASE COMPREHENSIVE SCAN                    ");
  console.log("================================================================================");

  const models: [string, any][] = [
    ["Users", db.user],
    ["Categories", db.category],
    ["Courses", db.course],
    ["Sections", db.section],
    ["Lessons", db.lesson],
    ["Lesson Progress", db.lessonProgress],
    ["Quizzes", db.quiz],
    ["Questions", db.question],
    ["Quiz Submissions", db.quizSubmission],
    ["Reviews", db.review],
    ["Certificates", db.certificate],
    ["Assignments", db.assignment],
    ["Assignment Submissions", db.assignmentSubmission],
    ["Lesson Resources", db.lessonResource],
    ["Lesson Discussions", db.lessonDiscussion],
    ["Orders", db.order],
    ["Payments", db.payment],
    ["Notifications", db.notification],
    ["Audit Logs", db.auditLog],
  ];

  for (const [name, model] of models) {
    try {
      const count = await model.count();
      console.log(`📊 ${name.padEnd(25)} : ${count.toString().padStart(5)} records`);
    } catch (e: any) {
      console.log(`❌ ${name.padEnd(25)} : ERROR (${e.message})`);
    }
  }

  console.log("================================================================================");
  
  // Check users by role
  const users = await db.user.groupBy({
    by: ["role"],
    _count: true,
  });
  console.log("👥 Users by Role:", users.map(u => `${u.role}: ${u._count}`).join(" | "));

  // Check instructors
  const instructors = await db.user.findMany({
    where: { role: "TRAINER" },
    select: { name: true, email: true, _count: { select: { coursesTaught: true } } },
  });
  console.log(`👨‍🏫 Trainers (${instructors.length}):`);
  instructors.forEach(inst => {
    console.log(`   - ${inst.name} (${inst.email}) -> ${inst._count.coursesTaught} courses`);
  });

  // Check assignments
  const assignments = await db.assignment.findMany({
    select: { title: true, course: { select: { title: true } }, _count: { select: { submissions: true } } }
  });
  console.log(`📝 Assignments (${assignments.length}):`);
  assignments.forEach(a => {
    console.log(`   - "${a.title}" in [${a.course.title}] -> ${a._count.submissions} submissions`);
  });

  // Check orders
  const orders = await db.order.findMany({
    select: { orderNumber: true, amount: true, status: true, payment: { select: { status: true } } }
  });
  console.log(`💳 Orders (${orders.length}):`);
  orders.forEach(o => {
    console.log(`   - ${o.orderNumber}: PKR ${o.amount} (${o.status}) -> Payment: ${o.payment?.status || 'None'}`);
  });

  // Check lesson resources
  const resources = await db.lessonResource.count();
  console.log(`📁 Downloadable Lesson Resources: ${resources}`);

  // Check discussions
  const discussions = await db.lessonDiscussion.count();
  console.log(`💬 Classroom Discussions / Q&A: ${discussions}`);

  // Check notifications
  const notifications = await db.notification.count();
  console.log(`🔔 Notifications: ${notifications}`);
}

scan()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
