import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import BackgroundLayer from '@/components/BackgroundLayer';
import GalleryGrid from '@/components/GalleryGrid';
import type { Post, Profile } from '@/lib/types';

export default async function PublicGalleryPage({ params }: { params: { username: string } }) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .maybeSingle();

  if (!profile) notFound();

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', profile.id)
    .order('pinned', { ascending: false })
    .order('sort_order', { ascending: false })
    .order('created_at', { ascending: false });

  return (
    <main className="max-w-4xl mx-auto pb-16 min-h-screen">
      <BackgroundLayer profile={profile as Profile} />

      {profile.header_image_url && (
        <div
          className="w-full h-[130px] bg-cover bg-center"
          style={{ backgroundImage: `url(${profile.header_image_url})` }}
        />
      )}

      <header className="px-5 py-6 border-b border-border flex items-center gap-3 bg-white/80 backdrop-blur">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-11 h-11 rounded-lg object-cover" />
        ) : (
          <div className="w-11 h-11 rounded-lg bg-bg-soft" />
        )}
        <div>
          <b className="text-sm">{profile.display_name || profile.username}</b>
          <div className="text-xs text-text-faint">{profile.bio || `@${profile.username}`}</div>
        </div>
      </header>

      <GalleryGrid
        profile={profile as Profile}
        initialPosts={(posts || []) as Post[]}
        isOwner={false}
      />
    </main>
  );
}
