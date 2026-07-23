import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
  isClientAllowedReadingStatus,
  isPrivilegedReadingStatus,
} from '@/lib/saju/reading-status-policy';

export async function POST(req: NextRequest) {
  const { readingId, status } = await req.json();

  if (!readingId || !status) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (isPrivilegedReadingStatus(status)) {
    return NextResponse.json({ error: 'Forbidden status transition' }, { status: 403 });
  }

  if (!isClientAllowedReadingStatus(status)) {
    return NextResponse.json({ error: 'Invalid status transition' }, { status: 400 });
  }

  const supabase = await createClient();

  // 인증 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('saju_readings')
    .update({ status: status, updated_at: new Date().toISOString() })
    .eq('id', readingId)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
