import { withAuth } from 'next-auth'

export const config = {
  callbacks: ['jwt'],
}

export const {
  auth: middleware,
} = withAuth({ callbacks: ['jtw'] })
