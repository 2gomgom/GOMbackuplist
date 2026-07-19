'use client';

import { useState } from 'react';
import { setUsername } from './actions';

export default function UsernameSetup() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError('');
    const res = await setUsername(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      window.location.reload();
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form action={handleSubmit} className="w-full max-w-sm">
        <h1 className="text-xl font-bold mb-1">갤러리 아이디를 정해주세요</h1>
        <p className="text-text-faint text-sm mb-5">
          <code className="bg-bg-soft px-1 py-0.5 rounded">사이트주소/u/아이디</code> 로 내 갤러리에 접속할 수 있어요. 나중에 바꿀 수 없어요.
        </p>
        <input
          name="username"
          placeholder="영문 소문자, 숫자, _ (3~20자)"
          pattern="[a-z0-9_]{3,20}"
          required
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-soft text-sm outline-none mb-3"
        />
        {error && <p className="text-heart text-xs mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-50"
        >
          {loading ? '생성 중...' : '시작하기'}
        </button>
      </form>
    </main>
  );
}
