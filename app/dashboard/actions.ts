'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function setUsername(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const username = String(formData.get('username') || '').trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return { error: '아이디는 영문 소문자/숫자/밑줄로 3~20자여야 해요.' };
  }

  const { error } = await supabase.from('profiles').insert({
    id: user.id,
    username,
    display_name: user.user_metadata?.full_name || username,
    avatar_url: user.user_metadata?.avatar_url || '',
  });

  if (error) {
    if (error.code === '23505') return { error: '이미 사용 중인 아이디예요.' };
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

async function uploadImage(userId: string, file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${userId}/${uuidv4()}.${ext}`;
  const { error } = await supabase.storage.from('images').upload(path, file);
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from('images').getPublicUrl(path);
  return data.publicUrl;
}

function toArraySplitByComma(v: FormDataEntryValue | null) {
  return String(v || '').split(',').map(s => s.trim()).filter(Boolean);
}

function toArraySplitBySpace(v: FormDataEntryValue | null) {
  return String(v || '').split(/\s+/).map(s => s.trim()).filter(Boolean);
}

async function mergeCategoryColors(supabase: any, userId: string, formData: FormData) {
  const raw = String(formData.get('categoryColors') || '');
  if (!raw) return;
  let incoming: Record<string, string> = {};
  try { incoming = JSON.parse(raw); } catch { return; }
  if (!Object.keys(incoming).length) return;

  const { data: profile } = await supabase.from('profiles').select('category_colors').eq('id', userId).maybeSingle();
  const merged = { ...(profile?.category_colors || {}), ...incoming };
  await supabase.from('profiles').update({ category_colors: merged }).eq('id', userId);
}

async function uploadManyImages(userId: string, files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const f of files) {
    if (f && f.size > 0) urls.push(await uploadImage(userId, f));
  }
  return urls;
}

function postFieldsFromForm(formData: FormData) {
  return {
    title: String(formData.get('title') || ''),
    subtitle_tags: toArraySplitBySpace(formData.get('subtitleTags')),
    category: toArraySplitByComma(formData.get('category')),
    category_color: String(formData.get('categoryColor') || 'purple'),
    tags_appearance: toArraySplitByComma(formData.get('tagsAppearance')),
    tags_outfit: toArraySplitByComma(formData.get('tagsOutfit')),
    memo: String(formData.get('memo') || ''),
    profile_text: String(formData.get('profileText') || ''),
    dday_date: formData.get('ddayDate') || null,
    catchphrase: String(formData.get('catchphrase') || ''),
    catchphrase_enabled: formData.get('catchphraseEnabled') === 'on',
    catchphrase_style: String(formData.get('catchphraseStyle') || 'normal'),
    heart_color: String(formData.get('heartColor') || ''),
  };
}

export async function createPost(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const imageFile = formData.get('image') as File;
  if (!imageFile || imageFile.size === 0) {
    return { error: '이미지를 선택해주세요.' };
  }

  try {
    const imageUrl = await uploadImage(user.id, imageFile);

    let bannerUrl = '';
    const bannerFile = formData.get('bannerImage') as File | null;
    if (bannerFile && bannerFile.size > 0) {
      bannerUrl = await uploadImage(user.id, bannerFile);
    }

    const extraFiles = formData.getAll('extraImages') as File[];
    const extraUrls = await uploadManyImages(user.id, extraFiles);

    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      ...postFieldsFromForm(formData),
      image_url: imageUrl,
      banner_image_url: bannerUrl,
      extra_images: extraUrls,
    });

    if (error) return { error: error.message };
    await mergeCategoryColors(supabase, user.id, formData);
  } catch (e: any) {
    return { error: e.message || '업로드 중 오류가 발생했어요.' };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function updatePost(postId: string, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  try {
    const update: Record<string, any> = postFieldsFromForm(formData);

    const imageFile = formData.get('image') as File | null;
    if (imageFile && imageFile.size > 0) {
      update.image_url = await uploadImage(user.id, imageFile);
    }

    const bannerFile = formData.get('bannerImage') as File | null;
    if (bannerFile && bannerFile.size > 0) {
      update.banner_image_url = await uploadImage(user.id, bannerFile);
    }

    // 기존 연관 이미지 중 남길 것들 (URL 목록) + 새로 추가한 파일들
    const keepExtra = formData.getAll('keepExtraImages') as string[];
    const newExtraFiles = formData.getAll('extraImages') as File[];
    const newExtraUrls = await uploadManyImages(user.id, newExtraFiles);
    update.extra_images = [...keepExtra, ...newExtraUrls];

    const { error } = await supabase
      .from('posts')
      .update(update)
      .eq('id', postId)
      .eq('user_id', user.id);

    if (error) return { error: error.message };
    await mergeCategoryColors(supabase, user.id, formData);
  } catch (e: any) {
    return { error: e.message || '수정 중 오류가 발생했어요.' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/u/[username]', 'page');
  return { success: true };
}

export async function deletePost(postId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { error } = await supabase.from('posts').delete().eq('id', postId).eq('user_id', user.id);
  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  return { success: true };
}

export async function togglePin(postId: string, pinned: boolean) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { error } = await supabase.from('posts').update({ pinned }).eq('id', postId).eq('user_id', user.id);
  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  return { success: true };
}

// 순서 저장: [{id, sort_order}, ...] 배열을 한 번에 반영
export async function reorderPosts(order: { id: string; sort_order: number }[]) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  for (const item of order) {
    const { error } = await supabase
      .from('posts')
      .update({ sort_order: item.sort_order })
      .eq('id', item.id)
      .eq('user_id', user.id);
    if (error) return { error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/u/[username]', 'page');
  return { success: true };
}

export async function updateProfile(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  try {
    const update: Record<string, any> = {
      display_name: String(formData.get('displayName') || ''),
      bio: String(formData.get('bio') || ''),
      heart_color: String(formData.get('heartColor') || '#c9184a'),
      bg_type: String(formData.get('bgType') || 'color'),
      bg_color_mode: String(formData.get('bgColorMode') || 'solid'),
      bg_color: String(formData.get('bgColor') || '#ffffff'),
      bg_color2: String(formData.get('bgColor2') || '#f0e9ff'),
      bg_gradient_angle: parseInt(String(formData.get('bgGradientAngle') || '135'), 10),
      bg_pattern: String(formData.get('bgPattern') || 'dots'),
      bg_image_brightness: parseInt(String(formData.get('bgImageBrightness') || '100'), 10),
      bg_image_vignette: parseInt(String(formData.get('bgImageVignette') || '0'), 10),
      bg_image_size: parseInt(String(formData.get('bgImageSize') || '100'), 10),
      bg_image_pos_x: parseInt(String(formData.get('bgImagePosX') || '50'), 10),
      bg_image_pos_y: parseInt(String(formData.get('bgImagePosY') || '50'), 10),
    };

    const categoryColorsRaw = String(formData.get('categoryColors') || '{}');
    try { update.category_colors = JSON.parse(categoryColorsRaw); } catch { update.category_colors = {}; }

    const avatarFile = formData.get('avatar') as File | null;
    if (avatarFile && avatarFile.size > 0) {
      update.avatar_url = await uploadImage(user.id, avatarFile);
    }

    const headerFile = formData.get('headerImage') as File | null;
    if (headerFile && headerFile.size > 0) {
      update.header_image_url = await uploadImage(user.id, headerFile);
    }
    if (formData.get('removeHeaderImage') === 'on') {
      update.header_image_url = '';
    }

    const bgImageFile = formData.get('bgImage') as File | null;
    if (bgImageFile && bgImageFile.size > 0) {
      update.bg_image_url = await uploadImage(user.id, bgImageFile);
    }

    const { error } = await supabase.from('profiles').update(update).eq('id', user.id);
    if (error) return { error: error.message };
  } catch (e: any) {
    return { error: e.message || '프로필 저장 중 오류가 발생했어요.' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/u/[username]', 'page');
  return { success: true };
}
