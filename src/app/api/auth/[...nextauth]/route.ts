/**
 * NextAuth API route
 * Handles authentication for the GP Report Dashboard
 */

import { authOptions } from '@/lib/auth';
import NextAuth from 'next-auth';

const handler = NextAuth(authOptions);

export const GET = handler;
export const POST = handler;
