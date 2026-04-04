import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Route based on user role
  if (session.user?.role === 'ADMIN') {
    redirect('/dashboard')
  }

  if (session.user?.role === 'PARTNER') {
    redirect('/portal')
  }

  // Default redirect
  redirect('/login')
}
