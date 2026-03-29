import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Teacher",
      credentials: {
        email: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const teacher = await prisma.teacher.findUnique({
          where: { email: credentials.email },
        })

        if (!teacher) return null

        const isValid = await bcrypt.compare(
          credentials.password,
          teacher.password_hash
        )

        if (!isValid) return null

        return {
          id: teacher.id,
          email: teacher.email,
          name: teacher.full_name,
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        ;(session.user as { id?: string }).id = token.id as string
      }
      return session
    },
  },
}
