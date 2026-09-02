import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const prerender = false;

const MAX_NAME_LENGTH = 80;
const MAX_COMMENT_LENGTH = 2000;

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  if (!slug) {
    return new Response(JSON.stringify({ error: 'Missing post slug.' }), { status: 400 });
  }

  const { data, error } = await supabase
    .from('comments')
    .select('id, name, comment_text, created_at')
    .eq('post_slug', slug)
    .order('created_at', { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: 'Could not load comments.' }), { status: 500 });
  }

  return new Response(JSON.stringify({ comments: data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ params, request }) => {
  const slug = params.slug;
  if (!slug) {
    return new Response(JSON.stringify({ error: 'Missing post slug.' }), { status: 400 });
  }

  let body: { name?: string; comment?: string; website?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body.' }), { status: 400 });
  }

  // Honeypot: real visitors never fill this hidden field, bots usually do.
  if (body.website) {
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  const name = (body.name || '').trim();
  const comment = (body.comment || '').trim();

  if (!name || !comment) {
    return new Response(JSON.stringify({ error: 'Name and comment are required.' }), { status: 400 });
  }
  if (name.length > MAX_NAME_LENGTH || comment.length > MAX_COMMENT_LENGTH) {
    return new Response(JSON.stringify({ error: 'Name or comment is too long.' }), { status: 400 });
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({ post_slug: slug, name, comment_text: comment })
    .select('id, name, comment_text, created_at')
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: 'Could not save comment.' }), { status: 500 });
  }

  return new Response(JSON.stringify({ comment: data }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
};
