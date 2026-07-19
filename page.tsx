import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LoginButton from './LoginButton';

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
      <div>
        <h1 className="text-2xl font-bold mb-2">곰곰 아카이브</h1>
        <p className="text-text-faint text-sm">
          구글 계정으로 로그인하면 나만의 아카이브를 만들 수 있어요.
        </p>
      </div>
      <LoginButton />
      <p className="text-xs text-text-faint mt-8">
       문의 사항은 {' '}
        <code className="bg-bg-soft px-1.5 py-0.5 rounded">@2han_bear</code>
      </p>
    </main>
  );
}
