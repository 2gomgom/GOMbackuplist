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
  const [catchphrases, setCatchphrases] = useState<{ text: string; enabled: boolean }[]>(
    post?.catchphrases?.length ? post.catchphrases : (post?.catchphrase ? [{ text: post.catchphrase, enabled: post.catchphrase_enabled ?? true }] : [])
  );
  const [hashtags, setHashtags] = useState<{ text: string; enabled: boolean }[]>(post?.hashtags || []);
  const [keepExtra, setKeepExtra] = useState<string[]>(post?.extra_images || []);
  const [newExtraPreviews, setNewExtraPreviews] = useState<{ file: File; url: string }[]>([]);
  const [keepBanners, setKeepBanners] = useState<string[]>(post?.banner_images || []);
  const [newBannerPreviews, setNewBannerPreviews] = useState<{ file: File; url: string }[]>([]);

  const categoryList = categoryText.split(',').map(s => s.trim()).filter(Boolean);

  const handleSubmit = async (formData: FormData) => {
    setSaving(true);
    setError('');

    formData.set('category', categoryText);
    formData.set('catchphraseEnabled', catchphraseEnabled ? 'on' : '');
    formData.set('catchphraseStyle', catchphraseStyle);
    formData.set('catchphrases', JSON.stringify(catchphrases));
    formData.set('hashtags', JSON.stringify(hashtags));
    // 첫 카테고리의 색상을 대표 색상으로 저장 (하위호환)
    formData.set('categoryColor', categoryList.length ? (categoryColors[categoryList[0]] || 'purple') : 'purple');

    keepExtra.forEach(url => formData.append('keepExtraImages', url));
    newExtraPreviews.forEach(p => formData.append('extraImages', p.file));
    keepBanners.forEach(url => formData.append('keepBannerImages', url));
    newBannerPreviews.forEach(p => formData.append('bannerImages', p.file));

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

        <label className="block text-xs text-text-faint mb-1">배너 이미지 (상세보기 상단, 여러 장 추가 가능)</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {keepBanners.map((url, i) => (
            <div key={url} className="relative w-16 h-16">
              <img src={url} className="w-16 h-16 object-cover rounded-md border border-border" />
              <button
                type="button"
                onClick={() => setKeepBanners(keepBanners.filter((_, idx) => idx !== i))}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/70 text-white text-[10px]"
              >✕</button>
            </div>
          ))}
          {newBannerPreviews.map((p, i) => (
            <div key={p.url} className="relative w-16 h-16">
              <img src={p.url} className="w-16 h-16 object-cover rounded-md border border-border" />
              <button
                type="button"
                onClick={() => setNewBannerPreviews(newBannerPreviews.filter((_, idx) => idx !== i))}
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
            setNewBannerPreviews([...newBannerPreviews, ...files.map(f => ({ file: f, url: URL.createObjectURL(f) }))]);
          }}
        />

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

        <label className="block text-xs text-text-faint mb-1">캐치프레이즈 (여러 개 추가 가능, 각각 켜고 끄기)</label>
        <div className="space-y-2 mb-2">
          {catchphrases.map((cp, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCatchphrases(catchphrases.map((c, idx) => idx === i ? { ...c, enabled: !c.enabled } : c))}
                className={`flex-shrink-0 w-8 h-6 rounded-full relative transition-colors ${cp.enabled ? 'bg-purpleFg' : 'bg-border'}`}
                title={cp.enabled ? '켜짐' : '꺼짐'}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${cp.enabled ? 'left-3' : 'left-0.5'}`} />
              </button>
              <input
                value={cp.text}
                onChange={e => setCatchphrases(catchphrases.map((c, idx) => idx === i ? { ...c, text: e.target.value } : c))}
                placeholder="예: 여름 바다를 닮은 아이"
                className="flex-1 px-3 py-2 rounded-lg bg-bg-soft border border-border text-sm"
              />
              <button type="button" onClick={() => setCatchphrases(catchphrases.filter((_, idx) => idx !== i))} className="flex-shrink-0 text-text-faint text-sm">✕</button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setCatchphrases([...catchphrases, { text: '', enabled: true }])}
          className="text-xs text-purpleFg mb-2"
        >+ 캐치프레이즈 추가</button>
        <div className="flex gap-2 mb-4">
          <button type="button" onClick={() => setCatchphraseStyle('normal')} className={`px-3 py-1 rounded-md text-xs border ${catchphraseStyle === 'normal' ? 'bg-purpleBg text-purpleFg border-transparent' : 'border-border text-text-muted'}`}>기본체</button>
          <button type="button" onClick={() => setCatchphraseStyle('italic')} className={`px-3 py-1 rounded-md text-xs border ${catchphraseStyle === 'italic' ? 'bg-purpleBg text-purpleFg border-transparent' : 'border-border text-text-muted'}`}>기울임체</button>
        </div>

        <label className="block text-xs text-text-faint mb-1">해시태그 (여러 개 추가 가능, 각각 켜고 끄기)</label>
        <div className="space-y-2 mb-2">
          {hashtags.map((tag, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHashtags(hashtags.map((t, idx) => idx === i ? { ...t, enabled: !t.enabled } : t))}
                className={`flex-shrink-0 w-8 h-6 rounded-full relative transition-colors ${tag.enabled ? 'bg-text' : 'bg-border'}`}
                title={tag.enabled ? '켜짐' : '꺼짐'}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${tag.enabled ? 'left-3' : 'left-0.5'}`} />
              </button>
              <input
                value={tag.text}
                onChange={e => setHashtags(hashtags.map((t, idx) => idx === i ? { ...t, text: e.target.value } : t))}
                placeholder="예: 여름한정"
                className="flex-1 px-3 py-2 rounded-lg bg-bg-soft border border-border text-sm"
              />
              <button type="button" onClick={() => setHashtags(hashtags.filter((_, idx) => idx !== i))} className="flex-shrink-0 text-text-faint text-sm">✕</button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setHashtags([...hashtags, { text: '', enabled: true }])}
          className="text-xs text-text mb-4 font-medium"
        >+ 해시태그 추가</button>

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
