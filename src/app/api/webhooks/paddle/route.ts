import {
  verifyWebhookSignature,
  type PaddleWebhookPayload,
} from '@/lib/paddle/webhook';
import { resolvePaddleCreditGrant } from '@/lib/paddle/credit-grant';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('Paddle-Signature') || '';

  // 1. 시그니처 검증
  const isValid = await verifyWebhookSignature(rawBody, signature);
  if (!isValid) {
    console.error('[Paddle Webhook] 시그니처 검증 실패');
    return new Response('Invalid signature', { status: 401 });
  }

  // 2. 이벤트 파싱
  const event: PaddleWebhookPayload = JSON.parse(rawBody);

  // 3. transaction.completed만 처리
  if (event.event_type !== 'transaction.completed') {
    return new Response('ok', { status: 200 });
  }

  const supabase = createAdminClient();
  const grant = resolvePaddleCreditGrant(event);

  if ('error' in grant) {
    console.error('[Paddle Webhook] 지급 기준 검증 실패:', grant);
    return new Response('Missing required data', { status: 400 });
  }

  const {
    userId,
    productType,
    transactionId,
    credits,
  } = grant;

  const { data, error } = await supabase.rpc('credit_stars_for_paddle_purchase', {
    p_user_id: userId,
    p_credits: credits,
    p_transaction_id: transactionId,
    p_product_type: productType,
  });

  const result = Array.isArray(data) ? data[0] : data;

  if (error) {
    console.error('[Paddle Webhook] 별 충전 실패:', error);
    return new Response('DB update failed', { status: 500 });
  }

  if (result?.inserted === false) {
    console.log(`[Paddle Webhook] Duplicate transaction ignored: ${transactionId}`);
    return new Response('ok', { status: 200 });
  }

  console.log(`[Paddle Webhook] 별 ${credits}개 충전 완료: userId=${userId}, balance=${result?.balance_after}`);
  return new Response('ok', { status: 200 });
}
