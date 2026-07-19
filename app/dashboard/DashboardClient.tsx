'use client';

import { useState } from 'react';
import { signOut } from './actions';
import BackgroundLayer from '@/components/BackgroundLayer';
import GalleryGrid from '@/components/GalleryGrid';
import PostFormModal from '@/components/PostFormModal';
import ProfileSettingsModal from '@/components/ProfileSettingsModal';
import type { Post, Profile } from '@/lib/types';

export default function DashboardClient({
  profile,
  initialPosts,
}: {
  profile: Profile;
  initialPosts: Post[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  return (
    <main className="max-w-4xl mx-auto pb-28 min-h-screen">
      <BackgroundLayer profile={profile} />

      {profile.header_image_url && (
        <div
          className="w-full h-[130px] bg-cover bg-center"
          style={{ backgroundImage: `url(${profile.header_image_url})` }}
        />
      )}

      <header className="sticky top-0 z-10 flex items-center justify-between px-5 py-3.5 border-b border-border bg-white/90 backdrop-blur">
        <button onClick={() => setShowProfileSettings(true)} className="flex items-center gap-2.5 text-left">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-md object-cover border border-border" />
          ) : (
            <div className="w-8 h-8 rounded-md bg-bg-soft border border-border" />
          )}
          <div>
            <b className="text-sm block">{profile.display_name}</b>
            <div className="text-xs text-text-faint">{profile.bio || `@${profile.username}`}</div>
          </div>
        </button>
        <div className="flex items-center gap-3">
          <a href={`/u/${profile.username}`} className="text-xs text-text-muted underline">
            내 갤러리 보기
          </a>
          <form action={signOut}>
            <button className="text-xs text-text-faint">로그아웃</button>
          </form>
        </div>
      </header>

      <GalleryGrid
        profile={profile}
        initialPosts={initialPosts}
        isOwner
        onEdit={(post) => setEditingPost(post)}
      />

      <button
        onClick={() => setShowForm(true)}
        className="fixed right-5 bottom-6 h-12 px-5 rounded-full bg-primary text-white text-sm font-semibold shadow-lg z-40"
      >
        + 새 이미지
      </button>

      {showForm && (
        <PostFormModal profile={profile} onClose={() => setShowForm(false)} />
      )}

      {editingPost && (
        <PostFormModal profile={profile} post={editingPost} onClose={() => setEditingPost(null)} />
      )}

      {showProfileSettings && (
        <ProfileSettingsModal profile={profile} onClose={() => setShowProfileSettings(false)} />
      )}
    </main>
  );
}
