'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAuthServerClient } from '@/lib/supabase/auth-server';
import { prisma } from '@/lib/prisma/client';
import { seedDemoData } from '@/lib/seed/seedDemoData';

export async function signIn(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { success: false, message: 'Email and password are required.' };
  }

  const supabase = await createAuthServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, message: error.message };
  }

  if (data.user) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.user.email! } });
    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.full_name || undefined,
        },
      });
      await seedDemoData(data.user.id);
    }
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signUp(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '').trim();
  const confirmPassword = String(formData.get('confirmPassword') ?? '').trim();
  const fullName = String(formData.get('fullName') ?? '').trim();

  if (!email || !password) {
    return { success: false, message: 'Email and password are required.' };
  }

  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters.' };
  }

  if (password !== confirmPassword) {
    return { success: false, message: 'Passwords do not match.' };
  }

  const supabase = await createAuthServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  if (data.user) {
    try {
      await prisma.user.upsert({
        where: { email },
        update: { name: fullName || undefined },
        create: { id: data.user.id, email, name: fullName || undefined },
      });
      await seedDemoData(data.user.id);
    } catch (err) {
      console.error('Failed to create local user after signup:', err);
      try { await supabase.auth.admin.deleteUser(data.user.id); } catch {}
      return { success: false, message: 'Account creation failed. Please try again.' };
    }
  }

  if (data.session) {
    revalidatePath('/', 'layout');
    redirect('/');
  }

  return { success: true, message: 'Account created. Check your email for confirmation.' };
}

export async function signOut() {
  const supabase = await createAuthServerClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
