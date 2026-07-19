'use client';

import { useState } from 'react';
import { updateProfile } from '@/app/dashboard/actions';
import type { Profile } from '@/lib/types';
import { BG_PATTERNS } from '@/lib/types';

export default function ProfileSettingsModal({
  profile,
  onClose,
}: {
  profile: Profile;
  onClose: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [bgType, setBgType] = useState(profile.bg_type || 'color');
  const [bgColorMode, setBgColorMode] = useState(profile.bg_color_mode || 'solid');
  const [bgPattern, setBgPattern] = useState(profile.bg_pattern || 'dots');
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url);
  const [headerPreview, setHeaderPreview] = useState(profile.header_image_url);
  const [removeHeader, setRemoveHeader] = useState(false);
  const [angle, setAngle] = useState(profile.bg_gradient_angle ?? 135);
  const [brightness, setBrightness] = useState(profile.bg_image_brightness ?? 100);
  const [vignette, setVignette] = useState(profile.bg_image_vignette ?? 0);
  const [size, setSize] = useState(profile.bg_image_size ?? 100);

  const handleSubmit = async (formData: FormData) => {
    setSaving(true);
    setError('');
    formData.set('bgType', bgType);
    formData.set('bgColorMode', bgColorMode);
    formData.set('bgPattern', bgPattern);
    formData.set('bgGradientAngle', String(angle));
    formData.set('bgImageBrightness', String(brightness));
    formData.set('bgImageVignette', String(vignette));
    formData.set('bgImageSize', String(size));
    if (removeHeader) formData.set('removeHeaderImage', 'on');
    const res = await updateProfile(formData);
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
          <h2 className="text-lg font-bold">프로필 설정</h2>
          <button type="button" onClick={onClose} className="text-text-faint text-lg">✕</button>
        </div>

        {/* 아바타 */}
        <label className="block text-xs text-text-faint mb-1">프로필 이미지</label>
        <div className="flex items-center gap-3 mb-4">
          {avatarPreview ? (
            <img src={avatarPreview} alt="" className="w-14 h-14 rounded-lg object-cover border border-border" />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-bg-soft border border-border" />
          )}
          <input
            type="file"
            name="avatar"
            accept="image/*"
            className="text-xs"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setAvatarPreview(URL.createObjectURL(f));
            }}
          />
        </div>

        <label className="block text-xs text-text-faint mb-1">이름</label>
        <input
          name="displayName"
          defaultValue={profile.display_name}
          className="w-full mb-3 px-3 py-2 rounded-lg bg-bg-soft border border-border text-sm"
        />

        <label className="block text-xs text-text-faint mb-1">소개</label>
        <textarea
          name="bio"
          rows={2}
          defaultValue={profile.bio}
          placeholder="예: NovelAI 그림 백업 창고"
          className="w-full mb-4 px-3 py-2 rounded-lg bg-bg-soft border border-border text-sm"
        />

        <label className="block text-xs text-text-faint mb-1">하트 / 디데이 색상</label>
        <input
          type="color"
          name="heartColor"
          defaultValue={profile.heart_color || '#c9184a'}
          className="w-full h-9 mb-4 rounded-lg border border-border"
        />

        <div className="text-xs font-semibold text-text-faint mb-2 mt-2">배경</div>
        <div className="flex gap-2 mb-3">
          {(['color', 'image', 'pattern'] as const).map(t => (
            <button
              type="button"
              key={t}
              onClick={() => setBgType(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border ${bgType === t ? 'bg-purpleBg text-purpleFg border-transparent' : 'border-border text-text-muted'}`}
            >
              {t === 'color' ? '색상' : t === 'image' ? '이미지' : '패턴'}
            </button>
          ))}
        </div>

        {bgType === 'color' && (
          <div className="mb-4">
            <div className="flex gap-2 mb-2">
              {(['solid', 'gradient'] as const).map(m => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setBgColorMode(m)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border ${bgColorMode === m ? 'bg-purpleBg text-purpleFg border-transparent' : 'border-border text-text-muted'}`}
                >
                  {m === 'solid' ? '단색' : '그라데이션'}
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-center mb-2">
              <input type="color" name="bgColor" defaultValue={profile.bg_color || '#ffffff'} className="w-11 h-9 rounded-lg border border-border" />
              <span className="text-xs text-text-faint">배경색 1</span>
            </div>
            {bgColorMode === 'gradient' && (
              <>
                <div className="flex gap-2 items-center mb-2">
                  <input type="color" name="bgColor2" defaultValue={profile.bg_color2 || '#f0e9ff'} className="w-11 h-9 rounded-lg border border-border" />
                  <span className="text-xs text-text-faint">배경색 2</span>
                </div>
                <label className="block text-xs text-text-faint mb-1">그라데이션 각도: {angle}°</label>
                <input
                  type="range" min={0} max={360} value={angle}
                  onChange={(e) => setAngle(parseInt(e.target.value, 10))}
                  className="w-full"
                />
              </>
            )}
          </div>
        )}

        {bgType === 'pattern' && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {BG_PATTERNS.map(p => (
                <button
                  type="button"
                  key={p.val}
                  title={p.label}
                  onClick={() => setBgPattern(p.val)}
                  className={`w-11 h-11 rounded-lg border-2 bg-pattern-${p.val} ${bgPattern === p.val ? 'border-primary' : 'border-border'}`}
                />
              ))}
            </div>
          </div>
        )}

        {bgType === 'image' && (
          <div className="mb-4">
            <input
              type="file" name="bgImage" accept="image/*"
              className="w-full mb-3 text-sm"
            />
            <label className="block text-xs text-text-faint mb-1">밝기: {brightness}%</label>
            <input type="range" min={30} max={150} value={brightness} onChange={e => setBrightness(parseInt(e.target.value, 10))} className="w-full mb-2" />
            <label className="block text-xs text-text-faint mb-1">비네팅: {vignette}%</label>
            <input type="range" min={0} max={100} value={vignette} onChange={e => setVignette(parseInt(e.target.value, 10))} className="w-full mb-2" />
            <label className="block text-xs text-text-faint mb-1">이미지 크기: {size}%</label>
            <input type="range" min={50} max={250} value={size} onChange={e => setSize(parseInt(e.target.value, 10))} className="w-full mb-2" />
          </div>
        )}

        <div className="text-xs font-semibold text-text-faint mb-2 mt-2">헤더(커버) 이미지</div>
        <div className="mb-4">
          {headerPreview && !removeHeader ? (
            <img src={headerPreview} alt="" className="w-full h-20 object-cover rounded-lg border border-border mb-2" />
          ) : null}
          <input
            type="file" name="headerImage" accept="image/*"
            className="w-full mb-2 text-sm"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) { setHeaderPreview(URL.createObjectURL(f)); setRemoveHeader(false); }
            }}
          />
          {(profile.header_image_url || headerPreview) && !removeHeader && (
            <button type="button" onClick={() => setRemoveHeader(true)} className="text-xs text-heart">✕ 헤더 이미지 삭제</button>
          )}
        </div>

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
