'use client';

import { useState } from 'react';
import { createPost, updatePost } from '@/app/dashboard/actions';
import type { Post, Profile } from '@/lib/types';
import { COLOR_PALETTE } from '@/lib/types';

export default function PostFormModal({
  profile,
  post,
  onClose,
}: {
  profile: Profile;
  post?: Post | null;
  onClose: () => void;
}) {
  const isEdit = !!post;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [categoryText, setCategoryText] = useState((post?.category || []).join(', '));
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>(profile.category_colors || {});
  const [catchphraseEnabled, setCatchphraseEnabled] = useState(post?.catchphrase_enabled ?? false);
  const [catchphraseStyle, setCatchphraseStyle] = useState(post?.catchphrase_style || 'normal');
  const [keepExtra, setKeepExtra] = useState<string[]>(post?.extra_images || []);
  const [newExtraPreviews, setNewExtraPreviews] = useState<{ file: File; url: string }[]>([]);

  const categoryList = categoryText.split(',').map(s => s.trim()).filter(Boolean);

  const handleSubmit = async (formData: FormData) => {
    setSaving(true);
    setError('');

    formData.set('category', categoryText);
    formData.set('catchphraseEnabled', catchphraseEnabled ? 'on' : '');
    formData.set('catchphraseStyle', catchphraseStyle);
    // 첫 카테고리의 색상을 대표 색상으로 저장 (하위호환)
    formData.set('categoryColor', categoryList.length ? (categoryColors[categoryList[0]] || 'purple') : 'purple');

    keepExtra.forEach(url => formData.append('keepExtraImages', url));
    newExtraPreviews.forEach(p => formData.append('extraImages', p.file));

    const res = isEdit ? await updatePost(post!.id, formData) : await createPost(formData);
    setSaving(false);
    if (res?.error) {
      setError(res.error);
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
      <form
        action={handleSubmit}
        className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{isEdit ? '이미지 수정' : '새 이미지 등록'}</h2>
          <button type="button" onClick={onClose} className="text-text-faint text-lg">✕</button>
        </div>

        <label className="block text-xs text-text-faint mb-1">대표 이미지 {!isEdit && '*'}</label>
        {isEdit && post?.image_url && (
          <img src={post.image_url} alt="" className="w-full h-32 object-cover rounded-lg border border-border mb-2" />
        )}
        <input type="file" name="image" accept="image/*" required={!isEdit} className="w-full mb-3 text-sm" />

        <label className="block text-xs text-text-faint mb-1">배너 이미지 (상세보기 상단, 선택)</label>
        {isEdit && post?.banner_image_url && (
          <img src={post.banner_image_url} alt="" className="w-full h-16 object-cover rounded-lg border border-border mb-2" />
        )}
        <input type="file" name="bannerImage" accept="image/*" className="w-full mb-3 text-sm" />

        <label className="block text-xs text-text-faint mb-1">연관 이미지 여러 장 (선택)</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {keepExtra.map((url, i) => (
            <div key={url} className="relative w-16 h-16">
              <img src={url} className="w-16 h-16 object-cover rounded-md border border-border" />
              <button
                type="button"
                onClick={() => setKeepExtra(keepExtra.filter((_, idx) => idx !== i))}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/70 text-white text-[10px]"
              >✕</button>
            </div>
          ))}
          {newExtraPreviews.map((p, i) => (
            <div key={p.url} className="relative w-16 h-16">
              <img src={p.url} className="w-16 h-16 object-cover rounded-md border border-border" />
              <button
                type="button"
                onClick={() => setNewExtraPreviews(newExtraPreviews.filter((_, idx) => idx !== i))}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/70 text-white text-[10px]"
              >✕</button>
            </div>
          ))}
        </div>
        <input
          type="file" accept="image/*" multiple
          className="w-full mb-3 text-sm"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            setNewExtraPreviews([...newExtraPreviews, ...files.map(f => ({ file: f, url: URL.createObjectURL(f) }))]);
          }}
        />

        <label className="block text-xs text-text-faint mb-1">제목</label>
        <input name="title" defaultValue={post?.title} className="w-full mb-3 px-3 py-2 rounded-lg bg-bg-soft border border-border text-sm" />

        <label className="block text-xs text-text-faint mb-1">서브타이틀 태그 (띄어쓰기로 구분)</label>
        <input name="subtitleTags" defaultValue={(post?.subtitle_tags || []).join(' ')} className="w-full mb-3 px-3 py-2 rounded-lg bg-bg-soft border border-border text-sm" />

        <label className="block text-xs text-text-faint mb-1">디데이 날짜</label>
        <input type="date" name="ddayDate" defaultValue={post?.dday_date || ''} className="w-full mb-3 px-3 py-2 rounded-lg bg-bg-soft border border-border text-sm" />

        <label className="block text-xs text-text-faint mb-1">이 게시물의 하트/디데이 색상 (선택, 비우면 프로필 기본값)</label>
        <input type="color" name="heartColor" defaultValue={post?.heart_color || profile.heart_color || '#c9184a'} className="w-full h-9 mb-3 rounded-lg border border-border" />

        <label className="block text-xs text-text-faint mb-1">캐치프레이즈</label>
        <div className="flex gap-2 mb-2">
          <button type="button" onClick={() => setCatchphraseEnabled(true)} className={`px-3 py-1 rounded-md text-xs border ${catchphraseEnabled ? 'bg-purpleBg text-purpleFg border-transparent' : 'border-border text-text-muted'}`}>표시</button>
          <button type="button" onClick={() => setCatchphraseEnabled(false)} className={`px-3 py-1 rounded-md text-xs border ${!catchphraseEnabled ? 'bg-purpleBg text-purpleFg border-transparent' : 'border-border text-text-muted'}`}>숨김</button>
        </div>
        <input name="catchphrase" defaultValue={post?.catchphrase} placeholder="예: 여름 바다를 닮은 아이" className="w-full mb-2 px-3 py-2 rounded-lg bg-bg-soft border border-border text-sm" />
        <div className="flex gap-2 mb-3">
          <button type="button" onClick={() => setCatchphraseStyle('normal')} className={`px-3 py-1 rounded-md text-xs border ${catchphraseStyle === 'normal' ? 'bg-purpleBg text-purpleFg border-transparent' : 'border-border text-text-muted'}`}>기본체</button>
          <button type="button" onClick={() => setCatchphraseStyle('italic')} className={`px-3 py-1 rounded-md text-xs border ${catchphraseStyle === 'italic' ? 'bg-purpleBg text-purpleFg border-transparent' : 'border-border text-text-muted'}`}>기울임체</button>
        </div>

        <label className="block text-xs text-text-faint mb-1">분류 (쉼표로 구분)</label>
        <input
          value={categoryText}
          onChange={e => setCategoryText(e.target.value)}
          placeholder="예: 내캐, 페어, 여름"
          className="w-full mb-2 px-3 py-2 rounded-lg bg-bg-soft border border-border text-sm"
        />
        {categoryList.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-3">
            {categoryList.map(cat => (
              <div key={cat} className="flex items-center gap-1.5">
                <span className="text-xs">{cat}</span>
                {Object.entries(COLOR_PALETTE).map(([key, c]) => (
                  <button
                    type="button"
                    key={key}
                    title={key}
                    onClick={() => setCategoryColors({ ...categoryColors, [cat]: key })}
                    style={{ background: c.bg, border: (categoryColors[cat] || 'purple') === key ? `2px solid ${c.fg}` : '2px solid transparent' }}
                    className="w-5 h-5 rounded-full"
                  />
                ))}
              </div>
            ))}
          </div>
        )}
        <input type="hidden" name="categoryColors" value={JSON.stringify(categoryColors)} />

        <label className="block text-xs text-text-faint mb-1">외형 태그 (쉼표로 구분)</label>
        <input name="tagsAppearance" defaultValue={(post?.tags_appearance || []).join(', ')} className="w-full mb-3 px-3 py-2 rounded-lg bg-bg-soft border border-border text-sm" />

        <label className="block text-xs text-text-faint mb-1">의상 태그 (쉼표로 구분)</label>
        <input name="tagsOutfit" defaultValue={(post?.tags_outfit || []).join(', ')} className="w-full mb-3 px-3 py-2 rounded-lg bg-bg-soft border border-border text-sm" />

        <label className="block text-xs text-text-faint mb-1">메모</label>
        <textarea name="memo" rows={3} defaultValue={post?.memo} className="w-full mb-4 px-3 py-2 rounded-lg bg-bg-soft border border-border text-sm" />

        {error && <p className="text-heart text-xs mb-3">{error}</p>}

        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border text-sm">취소</button>
          <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-50">
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}
