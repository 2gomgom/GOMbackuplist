export type Profile = {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  header_image_url: string;
  heart_color: string;
  bg_type: 'color' | 'image' | 'pattern';
  bg_color_mode: 'solid' | 'gradient';
  bg_color: string;
  bg_color2: string;
  bg_gradient_angle: number;
  bg_pattern: string;
  bg_image_url: string;
  bg_image_brightness: number;
  bg_image_vignette: number;
  bg_image_size: number;
  bg_image_pos_x: number;
  bg_image_pos_y: number;
  category_colors: Record<string, string>;
};

export type Post = {
  id: string;
  user_id: string;
  title: string;
  subtitle_tags: string[];
  category: string[];
  category_color: string;
  tags_appearance: string[];
  tags_outfit: string[];
  memo: string;
  profile_text: string;
  dday_date: string | null;
  catchphrase: string;
  catchphrase_enabled: boolean;
  catchphrase_style: 'normal' | 'italic';
  catchphrases: { text: string; enabled: boolean }[];
  hashtags: { text: string; enabled: boolean }[];
  heart_color: string;
  image_url: string;
  banner_image_url: string;
  banner_images: string[];
  extra_images: string[];
  pinned: boolean;
  sort_order: number;
  created_at: string;
};

// 카테고리별 색상 팔레트 (Notion 스타일)
export const COLOR_PALETTE: Record<string, { bg: string; fg: string }> = {
  purple: { bg: '#e8deee', fg: '#6b46c1' },
  blue: { bg: '#d3e5ef', fg: '#0b6e99' },
  green: { bg: '#dbeddb', fg: '#2b7a4b' },
  gray: { bg: '#ebeced', fg: '#5f5e5b' },
  red: { bg: '#fbe4e4', fg: '#c4554d' },
  yellow: { bg: '#fbf3db', fg: '#946f00' },
  pink: { bg: '#fbe4f0', fg: '#c14c88' },
};

export const BG_PATTERNS = [
  { val: 'dots', label: '도트' },
  { val: 'grid', label: '그리드' },
  { val: 'diagonal', label: '대각선' },
  { val: 'blob', label: '파스텔 블롭' },
  { val: 'sky', label: '하늘 그라데이션' },
  { val: 'feather', label: '깃털' },
  { val: 'wing', label: '날개' },
  { val: 'checker', label: '체커보드' },
  { val: 'gingham', label: '깅엄 체크' },
  { val: 'leopard', label: '레오파드' },
  { val: 'zigzag', label: '지그재그' },
  { val: 'confetti', label: '컨페티' },
  { val: 'mesh', label: '메쉬 그라데이션' },
];

export function ddayText(dateStr: string | null) {
  if (!dateStr) return '';
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return 'D-DAY';
  return diff > 0 ? `D-${diff}` : `D+${-diff}`;
}
