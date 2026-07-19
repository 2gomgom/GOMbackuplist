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
        <h1 className="text-2xl font-bold mb-2">이미지 아카이브</h1>
        <p className="text-text-faint text-sm">
          구글 계정으로 로그인하면 나만의 갤러리를 만들 수 있어요.
        </p>
      </div>
      <LoginButton />
      <p className="text-xs text-text-faint mt-8">
        다른 사람의 갤러리를 구경하려면{' '}
        <code className="bg-bg-soft px-1.5 py-0.5 rounded">/u/아이디</code> 로 접속하세요.
      </p>
    </main>
  );
}
