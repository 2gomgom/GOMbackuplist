'use client';

import type { Profile } from '@/lib/types';

export default function BackgroundLayer({ profile }: { profile: Profile }) {
  const type = profile.bg_type || 'color';

  if (type === 'pattern') {
    return (
      <div
        className={`fixed inset-0 -z-10 bg-pattern-${profile.bg_pattern || 'dots'}`}
      />
    );
  }

  if (type === 'image' && profile.bg_image_url) {
    const brightness = (profile.bg_image_brightness ?? 100) / 100;
    const size = (profile.bg_image_size ?? 100) / 100;
    const vignette = (profile.bg_image_vignette ?? 0) / 100;
    return (
      <>
        <div
          className="fixed inset-0 -z-10 bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url(${profile.bg_image_url})`,
            backgroundPosition: `${profile.bg_image_pos_x ?? 50}% ${profile.bg_image_pos_y ?? 50}%`,
            backgroundSize: `${size * 100}%`,
            filter: `brightness(${brightness})`,
          }}
        />
        {vignette > 0 && (
          <div
            className="fixed inset-0 -z-10 pointer-events-none"
            style={{
              boxShadow: `inset 0 0 ${vignette * 260}px rgba(0,0,0,${vignette * 0.7})`,
            }}
          />
        )}
      </>
    );
  }

  // color: solid or gradient
  if (profile.bg_color_mode === 'gradient') {
    const angle = profile.bg_gradient_angle ?? 135;
    return (
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `linear-gradient(${angle}deg, ${profile.bg_color || '#ffffff'}, ${profile.bg_color2 || '#f0e9ff'})`,
        }}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 -z-10"
      style={{ background: profile.bg_color || '#ffffff' }}
    />
  );
}
