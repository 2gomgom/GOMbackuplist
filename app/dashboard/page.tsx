import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import UsernameSetup from './UsernameSetup';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) {
    return <UsernameSetup />;
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', user.id)
    .order('pinned', { ascending: false })
    .order('sort_order', { ascending: false })
    .order('created_at', { ascending: false });

  return <DashboardClient profile={profile} initialPosts={posts || []} />;
}
