'use client';

import { useState } from 'react';
import type { Post, Profile } from '@/lib/types';
import { COLOR_PALETTE, ddayText } from '@/lib/types';

export default function PostDetailModal({
  post,
  profile,
  isOwner,
  onClose,
  onEdit,
  onDelete,
  onTogglePin,
}: {
  post: Post;
  profile: Profile;
  isOwner: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onTogglePin?: () => void;
}) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const heartColor = post.heart_color || profile.heart_color || '#c9184a';
  const allImages = [post.image_url, ...(post.extra_images || [])];

  return (
    <div className="fixed inset-0 bg-black/45 flex items-end sm:items-center justify-center z-[100]">
      <div className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl p-5">
        <button onClick={onClose} className="absolute top-3.5 right-4 text-text-faint text-lg">✕</button>

        {post.banner_image_url && (
          <img src={post.banner_image_url} alt="" className="w-full h-24 object-cover rounded-lg mb-3 -mt-1" />
        )}

        <div className="flex gap-3 mb-3">
          {allImages.map((url, i) => (
            <img
              key={i}
              src={url}
              alt=""
              onClick={() => setLightbox(url)}
              className="w-20 h-20 object-cover rounded-lg border border-border flex-shrink-0 cursor-pointer"
            />
          ))}
        </div>

        {post.catchphrase_enabled && post.catchphrase && (
          <p className={`text-sm text-text-muted mb-2 ${post.catchphrase_style === 'italic' ? 'italic' : ''}`}>
            “{post.catchphrase}”
          </p>
        )}

        <div className="flex items-baseline gap-2 mb-1">
          <h2 className="text-lg font-bold">{post.title || '(제목 없음)'}</h2>
          {post.dday_date && (
            <span className="text-xs font-bold" style={{ color: heartColor }}>{ddayText(post.dday_date)}</span>
          )}
        </div>

        {post.subtitle_tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.subtitle_tags.map(t => (
              <span key={t} className="text-[11px] bg-grayBg text-grayFg px-1.5 py-0.5 rounded">{t}</span>
            ))}
          </div>
        )}

        {post.category?.length > 0 && (
          <div className="mb-2">
            <div className="text-[11px] text-text-faint mb-1">분류</div>
            <div className="flex flex-wrap gap-1">
              {post.category.map(c => {
                const key = profile.category_colors?.[c] || post.category_color || 'purple';
                const palette = COLOR_PALETTE[key] || COLOR_PALETTE.purple;
                return (
                  <span key={c} className="text-[11px] font-medium px-2 py-0.5 rounded" style={{ background: palette.bg, color: palette.fg }}>
                    {c}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {post.tags_appearance?.length > 0 && (
          <div className="mb-2">
            <div className="text-[11px] text-text-faint mb-1">외형</div>
            <div className="flex flex-wrap gap-1">
              {post.tags_appearance.map(t => (
                <span key={t} className="text-[11px] bg-blueBg text-blueFg px-2 py-0.5 rounded">{t}</span>
              ))}
            </div>
          </div>
        )}

        {post.tags_outfit?.length > 0 && (
          <div className="mb-2">
            <div className="text-[11px] text-text-faint mb-1">의상</div>
            <div className="flex flex-wrap gap-1">
              {post.tags_outfit.map(t => (
                <span key={t} className="text-[11px] bg-greenBg text-greenFg px-2 py-0.5 rounded">{t}</span>
              ))}
            </div>
          </div>
        )}

        {post.memo && (
          <div className="mb-3">
            <div className="text-[11px] text-text-faint mb-1">메모</div>
            <p className="text-sm whitespace-pre-wrap">{post.memo}</p>
          </div>
        )}

        {isOwner && (
          <div className="flex gap-2 mt-4 pt-3 border-t border-border">
            <button onClick={onTogglePin} className="flex-1 py-2 rounded-lg border border-border text-sm">
              {post.pinned ? '📌 고정 해제' : '📌 고정하기'}
            </button>
            <button onClick={onEdit} className="flex-1 py-2 rounded-lg border border-border text-sm">✏️ 수정</button>
            <button onClick={onDelete} className="flex-1 py-2 rounded-lg border border-border text-sm text-heart">🗑 삭제</button>
          </div>
        )}
      </div>

      {lightbox && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[110]" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-w-[92vw] max-h-[92vh] object-contain" />
        </div>
      )}
    </div>
  );
}
