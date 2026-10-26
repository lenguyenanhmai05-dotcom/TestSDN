import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

async function seedUser() {
  const prisma = new PrismaClient();
  const email = "lenguyenanhmai05@gmail.com";
  const password = "12345678";

  console.log(`Checking user account: ${email}...`);
  let user = await prisma.user.findUnique({ where: { email } });

  const passwordHash = await bcrypt.hash(password, 10);

  if (user) {
    console.log(`User already exists with ID: ${user.id}. Updating password...`);
    user = await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });
    console.log("Password updated successfully.");
  } else {
    console.log(`Creating new user account for ${email}...`);
    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });
    console.log("Created user with ID:", user.id);
  }

  // Sample realistic expenses for all 5 categories
  const sampleExpenses = [
    {
      title: "Buffet nướng lẩu cùng bạn bè",
      amount: 350000,
      category: "Food",
      note: "Họp mặt cuối tuần",
      starred: true,
      spentAt: "2026-10-25",
    },
    {
      title: "Cà phê Highland & ăn sáng",
      amount: 65000,
      category: "Food",
      note: "Sáng thứ 6",
      starred: false,
      spentAt: "2026-10-24",
    },
    {
      title: "GrabBike đi làm",
      amount: 32000,
      category: "Transport",
      note: "Cuốc xe buổi sáng",
      starred: false,
      spentAt: "2026-10-25",
    },
    {
      title: "Đổ xăng xe máy",
      amount: 90000,
      category: "Transport",
      note: "Xăng A95 đầy bình",
      starred: true,
      spentAt: "2026-10-23",
    },
    {
      title: "Tiền điện nước tháng 10",
      amount: 450000,
      category: "Bills",
      note: "Hóa đơn sinh hoạt gia đình",
      starred: true,
      spentAt: "2026-10-22",
    },
    {
      title: "Gói cước mạng 4G Viettel",
      amount: 120000,
      category: "Bills",
      note: "Gói ST120K 30 ngày",
      starred: false,
      spentAt: "2026-10-20",
    },
    {
      title: "Mua áo thun Uniqlo",
      amount: 299000,
      category: "Shopping",
      note: "Đồ đi chơi cuối tuần",
      starred: true,
      spentAt: "2026-10-21",
    },
    {
      title: "Văn phòng phẩm và sổ tay",
      amount: 85000,
      category: "Shopping",
      note: "Dụng cụ học tập",
      starred: false,
      spentAt: "2026-10-19",
    },
    {
      title: "Xem phim CGV",
      amount: 140000,
      category: "Other",
      note: "Vé xem phim và bắp nước",
      starred: false,
      spentAt: "2026-10-18",
    },
    {
      title: "Mua quà sinh nhật bạn thân",
      amount: 250000,
      category: "Other",
      note: "Quà kỷ niệm sinh nhật",
      starred: true,
      spentAt: "2026-10-17",
    },
  ];

  console.log(`Checking existing expenses for ${email}...`);
  const existingExpenses = await prisma.expense.findMany({
    where: { userId: user.id },
  });

  console.log(`User currently has ${existingExpenses.length} expenses.`);

  // Create expenses
  for (const exp of sampleExpenses) {
    const isDup = existingExpenses.some(
      (e) => e.title === exp.title && e.amount === exp.amount && e.spentAt === exp.spentAt
    );
    if (!isDup) {
      await prisma.expense.create({
        data: {
          userId: user.id,
          title: exp.title,
          amount: exp.amount,
          category: exp.category,
          note: exp.note,
          starred: exp.starred,
          spentAt: exp.spentAt,
        },
      });
      console.log(`+ Added: [${exp.category}] ${exp.title} - ${exp.amount.toLocaleString()} VND (Starred: ${exp.starred})`);
    } else {
      console.log(`= Already exists: ${exp.title}`);
    }
  }

  const finalCount = await prisma.expense.count({ where: { userId: user.id } });
  console.log(`Done! Total expenses for ${email}: ${finalCount}`);

  await prisma.$disconnect();
}

seedUser().catch((err) => {
  console.error("Error seeding user:", err);
  process.exit(1);
});
