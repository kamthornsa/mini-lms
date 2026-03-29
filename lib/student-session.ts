import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const getSecret = () => new TextEncoder().encode(process.env.NEXTAUTH_SECRET!)

export type StudentSession = {
  studentId: string   // student_id field (e.g. "64XXXXX")
  studentUUID: string // prisma id (UUID)
  studentName: string
  courseSlug: string
}

export async function setStudentSession(session: StudentSession) {
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(getSecret())

  const cookieStore = await cookies()
  cookieStore.set(`student_${session.courseSlug}`, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    sameSite: "lax",
    path: "/",
  })
}

export async function getStudentSession(courseSlug: string): Promise<StudentSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(`student_${courseSlug}`)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as StudentSession
  } catch {
    return null
  }
}

export async function clearStudentSession(courseSlug: string) {
  const cookieStore = await cookies()
  cookieStore.delete(`student_${courseSlug}`)
}
