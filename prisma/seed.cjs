const { PrismaClient } = require("../lib/generated/prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  const username = "kamthorn"
  const password = "@1234"

  const exists = await prisma.teacher.findUnique({ where: { email: username } })
  if (exists) {
    console.log("Teacher '" + username + "' มีอยู่แล้ว")
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
  .catch(console.error)
  .finally(() => prisma.$disconnect())
