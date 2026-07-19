'use client';

import { useMemo, useState } from 'react';
import type { Post, Profile } from '@/lib/types';
import { COLOR_PALETTE, ddayText } from '@/lib/types';
import PostDetailModal from './PostDetailModal';
import { reorderPosts, deletePost, togglePin } from '@/app/dashboard/actions';

export default function GalleryGrid({
  profile,
  initialPosts,
  isOwner,
  onEdit,
}: {
  profile: Profile;
  initialPosts: Post[];
  isOwner: boolean;
  onEdit?: (post: Post) => void;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [reorderMode, setReorderMode] = useState(false);
  const [detail, setDetail] = useState<Post | null>(null);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    posts.forEach(p => {
      (p.category || []).forEach(c => s.add(c));
    });
    return Array.from(s);
  }, [posts]);

  const filtered = useMemo(() => {
    return posts.filter(p => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (activeTag && !(p.category || []).includes(activeTag)) return false;
      return true;
    });
  }, [posts, search, activeTag]);

  const handleMove = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= posts.length) return;
    const next = [...posts];
    [next[index], next[target]] = [next[target], next[index]];
    setPosts(next);
  };

  const handleSaveOrder = async () => {
    const order = posts.map((p, i) => ({ id: p.id, sort_order: posts.length - i }));
    await reorderPosts(order);
    setReorderMode(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 이미지를 삭제할까요?')) return;
    setPosts(posts.filter(p => p.id !== id));
    setDetail(null);
    await deletePost(id);
  };

  const handlePin = async (post: Post) => {
    const nextPinned = !post.pinned;
    setPosts(posts.map(p => (p.id === post.id ? { ...p, pinned: nextPinned } : p)));
    setDetail(d => (d && d.id === post.id ? { ...d, pinned: nextPinned } : d));
    await togglePin(post.id, nextPinned);
  };

  return (
    <div>
      <div className="px-4 pt-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-full bg-bg-soft border border-border">
            <span className="text-text-faint text-sm">⌕</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="제목 검색"
              className="flex-1 bg-transparent text-sm outline-none border-none p-0"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-text-faint text-xs">✕</button>
            )}
          </div>
          {isOwner && (
            <button
              onClick={() => setReorderMode(!reorderMode)}
              className={`w-9 h-9 rounded-full flex items-center justify-center border ${reorderMode ? 'bg-purpleBg text-purpleFg border-transparent' : 'border-border text-text-muted'}`}
              title="순서 변경"
            >⇅</button>
          )}
        </div>

        {allTags.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-1" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setActiveTag(null)}
              className={`flex-shrink-0 px-3 py-1 rounded-md text-xs font-medium border whitespace-nowrap ${!activeTag ? 'bg-purpleBg text-purpleFg border-transparent' : 'border-border text-text-muted'}`}
            >전체</button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`flex-shrink-0 px-3 py-1 rounded-md text-xs font-medium border whitespace-nowrap ${activeTag === tag ? 'bg-purpleBg text-purpleFg border-transparent' : 'border-border text-text-muted'}`}
              >{tag}</button>
            ))}
          </div>
        )}

        {reorderMode && (
          <div className="text-xs text-purpleFg bg-purpleBg rounded-lg px-3 py-2 mb-2 text-center font-medium">
            화살표로 순서를 바꾸고 오른쪽 아래 버튼으로 저장하세요.
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 pt-1">
        {filtered.map((post, i) => {
          const heartColor = post.heart_color || profile.heart_color || '#c9184a';
          return (
            <div
              key={post.id}
              onClick={() => !reorderMode && setDetail(post)}
              className="rounded-card border border-border overflow-hidden bg-white relative cursor-pointer"
            >
              {post.pinned && <span className="absolute top-1.5 left-1.5 z-10 text-base">📌</span>}
              <div className="aspect-square bg-bg-soft relative">
                <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
              </div>
              {reorderMode && (
                <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 z-10">
                  <button onClick={(e) => { e.stopPropagation(); handleMove(i, -1); }} disabled={i === 0} className="w-6 h-6 rounded-full bg-black/60 text-white text-[10px] disabled:opacity-30">▲</button>
                  <button onClick={(e) => { e.stopPropagation(); handleMove(i, 1); }} disabled={i === filtered.length - 1} className="w-6 h-6 rounded-full bg-black/60 text-white text-[10px] disabled:opacity-30">▼</button>
                </div>
              )}
              <div className="p-2">
                <div className="flex items-baseline justify-between gap-1">
                  <div className="text-xs font-semibold truncate">{post.title || '(제목 없음)'}</div>
                  {post.dday_date && (
                    <span className="text-[11px] font-bold flex-shrink-0" style={{ color: heartColor }}>{ddayText(post.dday_date)}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(post.category || []).slice(0, 2).map(c => {
                    const key = profile.category_colors?.[c] || post.category_color || 'purple';
                    const palette = COLOR_PALETTE[key] || COLOR_PALETTE.purple;
                    return (
                      <span key={c} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: palette.bg, color: palette.fg }}>{c}</span>
                    );
                  })}
                  {[...(post.tags_appearance || []), ...(post.tags_outfit || [])].slice(0, 2).map(t => (
                    <span key={t} className="text-[10px] bg-grayBg text-grayFg px-1.5 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-text-faint text-sm py-16">
            {posts.length === 0 ? '아직 등록된 이미지가 없어요.' : '조건에 맞는 이미지가 없어요.'}
          </p>
        )}
      </div>

      {reorderMode && (
        <button
          onClick={handleSaveOrder}
          className="fixed right-5 bottom-6 h-12 px-5 rounded-full bg-purpleFg text-white text-sm font-semibold shadow-lg z-40"
        >
          ✓ 순서 저장
        </button>
      )}

      {detail && (
        <PostDetailModal
          post={detail}
          profile={profile}
          isOwner={isOwner}
          onClose={() => setDetail(null)}
          onEdit={() => { onEdit?.(detail); setDetail(null); }}
          onDelete={() => handleDelete(detail.id)}
          onTogglePin={() => handlePin(detail)}
        />
      )}
    </div>
  );
}
