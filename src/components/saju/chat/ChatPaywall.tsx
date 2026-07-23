'use client';

import { motion } from 'framer-motion';
import { getCharacter, type CharacterType } from '@/lib/saju/characters';
import { Link } from '@/i18n/routing';
import CharacterAvatar from './CharacterAvatar';
import { areClientPaymentsEnabled } from '@/lib/payments/feature-flag';

interface ChatPaywallProps {
  characterId: CharacterType;
  readingId: string;
  onPaymentComplete?: () => void;
}

export default function ChatPaywall({
  characterId,
}: ChatPaywallProps) {
  const character = getCharacter(characterId);
  const paymentsEnabled = areClientPaymentsEnabled();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex gap-2 justify-start"
    >
      <div className="flex flex-col items-center gap-1 pt-1">
        <CharacterAvatar characterId={characterId} size="sm" />
      </div>

      <div className="max-w-[85%]">
        <p className="text-xs text-gray-500 mb-1 ml-1">{character.name}</p>
        <div className="rounded-2xl rounded-bl-md bg-[#13131a] border border-[#2a2a3a] p-5">
          <p className="text-sm text-gray-200 leading-relaxed mb-1">
            별이 모두 소진되었어요.
          </p>
          <p className="text-xs text-gray-500 mb-4">
            {paymentsEnabled
              ? '코인샵에서 별을 받아 계속 대화할 수 있어요.'
              : '지금은 무료 상담 베타라 추가 충전은 잠시 닫아뒀어.'}
          </p>

          {paymentsEnabled && (
            <Link
              href="/coin-shop"
              className="block w-full py-3 rounded-xl bg-purple-600 text-white text-sm font-semibold text-center
                hover:bg-purple-500 transition-colors active:scale-[0.98]"
            >
              별 받으러 가기
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
