import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { REPORT_STAR_COST } from '@/lib/monthly-saju/star-deduction';

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // 인증 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { readingId } = await req.json();

  if (!readingId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data: reading } = await supabase
    .from('saju_readings')
    .select('id')
    .eq('id', readingId)
    .eq('user_id', user.id)
    .single();

  if (!reading) {
    return NextResponse.json({ error: 'Reading not found' }, { status: 404 });
  }

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .rpc("deduct_stars_for_report", {
      p_user_id: user.id,
      p_reading_id: readingId,
    });

  if (error || !data) {
    const message = error?.message ?? '';
    if (message.includes('INSUFFICIENT_STARS')) {
      return NextResponse.json({ error: 'Insufficient stars' }, { status: 402 });
    }
    if (message.includes('REPORT_ALREADY_PAID')) {
      return NextResponse.json({ error: 'Report already paid' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Failed to deduct stars' }, { status: 500 });
  }

  const result = Array.isArray(data) ? data[0] : data;
  if (!result || typeof result.balance_after !== 'number') {
    return NextResponse.json({ error: 'Failed to deduct stars' }, { status: 500 });
  }

  return NextResponse.json({
    balance: result.balance_after,
    amount: -REPORT_STAR_COST,
  });
}
