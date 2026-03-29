import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"
import "dotenv/config"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const username = "kamthorn"
  const password = "kt20%ll."

  const exists = await prisma.teacher.findUnique({ where: { email: username } })
  if (exists) {
    console.log(`Teacher "${username}" มีอยู่แล้ว`)
    return
  }

  const password_hash = await bcrypt.hash(password, 12)

  const teacher = await prisma.teacher.create({
    data: {
      email: username,
      password_hash,
      full_name: "Kamthorn",
    },
  })

  console.log("สร้าง teacher สำเร็จ")
  console.log("  Username : " + teacher.email)
  console.log("  Password : " + password)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
