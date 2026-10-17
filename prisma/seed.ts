// Rainbow-box Database Seed - v1.3.1
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.file.deleteMany();
  await prisma.note.deleteMany();
  await prisma.musicTrack.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("123456", 12);
  const user = await prisma.user.create({
    data: {
      name: "Demo 用户",
      email: "demo@rainbow-box.com",
      password,
      bio: "把记录，放在安静的地方。",
    },
  });

  await prisma.note.createMany({
    data: [
      { userId: user.id, text: "# 欢迎来到后现代咖啡馆\n\n这里是你的私人数字空间。\n\n- 写下今天的片段\n- 收好重要的文件\n- 给自己留一点安静的时间" },
      { userId: user.id, text: "# 阅读清单\n\n- [ ] 一本反复想读的书\n- [ ] 一部一直没看的电影\n- [ ] 一次不带目的的散步" },
    ],
  });

  console.log("Seed complete: demo@rainbow-box.com / 123456");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
