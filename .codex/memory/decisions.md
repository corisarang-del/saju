# Architecture and Product Decisions

## DEC-001: Codex 역할을 PM으로 제한

**날짜**: 2026-06-30
**상태**: 승인됨

**결정**:
앞으로 Codex는 PM 역할로만 움직이고, 소스코드는 직접 수정하지 않는다.

**결과**:
- 구현 요청은 개발자용 문서로 정리한다.
- PM 산출물은 요구사항, 수용 기준, QA 체크리스트, 리스크 중심으로 작성한다.

---

## DEC-002: 랜딩에서 가입 전 신뢰 요소를 먼저 노출

**날짜**: 2026-06-30
**상태**: 승인됨

**결정**:
랜딩에서 무료 맛보기 결과 한 문단과 가격/별 사용 기준을 먼저 보여준다.

**근거**:
20대 여성고객 피드백에서 가입 전 결과 샘플과 가격 투명성이 중요하다고 확인됐다.

---

## DEC-003: 별 사용/가격 기준 공개

**날짜**: 2026-06-30
**상태**: 승인됨

**결정**:
- 1별 = 메시지 1회
- 가입 후 3회 무료
- 30별 9,900원
- 70별 19,900원
- 250별 39,900원

---

## DEC-004: 캐릭터 말투를 20대 여성 고객 기준으로 완화

**날짜**: 2026-06-30
**상태**: 승인됨

**결정**:
직설 캐릭터도 무례하거나 하대처럼 들리지 않게 조정한다.

**예시 방향**:
- `니`, `어이 동생`, `형이` 같은 표현은 줄인다.
- 경고는 하되 바로 실행 가능한 행동을 같이 제안한다.
- 개성은 유지하되 조롱, 비꼼, 압박감을 줄인다.

---

## DEC-005: 고민 선택지는 생활 언어 우선

**날짜**: 2026-06-30
**상태**: 승인됨

**결정**:
기존 사주식/일반 카테고리보다 고객이 바로 이해하는 생활 언어를 쓴다.

**라벨**:
- 썸/재회
- 이직/퇴사
- 돈 모으기
- 번아웃
- 친구/가족관계
- 그 외 고민

---

## DEC-006: 신뢰 UX는 필수 정보 사용 이유를 짧게 설명한다

**날짜**: 2026-06-30
**상태**: 승인됨

**결정**:
개인정보, 쿠키, 성별처럼 민감하게 느껴질 수 있는 정보는 입력/동의 지점 근처에서 짧고 명확하게 사용 이유를 설명한다.

**적용 예시**:
- 쿠키: `서비스 이용에 필요한 최소한의 쿠키만 사용해.`
- 성별: `성별은 사주 계산 기준에 필요해서만 사용해.`
- 개인정보: `입력한 정보는 사주 분석에만 사용돼. 원하면 언제든 삭제 요청할 수 있어.`

---

## DEC-007: 후킹보다 차분한 상담형 신뢰를 우선한다

**날짜**: 2026-06-30
**상태**: 승인됨

**결정**:
캐릭터와 후기 카피는 과한 후킹, 겁주기, 과장된 성공담보다 “내 고민을 차분히 정리해주는 상담형 앱” 톤을 우선한다.

**적용 대상**:
- 현우 캐릭터의 위험/경고 문구
- 후기의 과장된 투자/성공 표현
- 로그인 CTA의 강압적 가입 유도

---

## DEC-008: 가입 전 혜택은 별보다 회수로 설명한다

**날짜**: 2026-07-01
**상태**: 승인됨

**결정**:
가입 전 마케팅 문구에서는 `3별 무료`보다 `3회 무료`를 우선 사용한다.

**근거**:
유저는 별이라는 내부 재화보다 실제 상담 횟수인 `3회`를 더 직관적으로 이해한다.

---

## DEC-009: 선택 입력은 불안을 줄이는 보조문구를 붙인다

**날짜**: 2026-07-01
**상태**: 승인됨

**결정**:
태어난 시간처럼 사용자가 모를 가능성이 높은 선택 입력에는 `몰라도 분석 가능` 안내를 입력 지점에 붙인다.

**권장 문구**:
- `태어난 시간을 몰라도 분석 가능해. 알면 더 정밀하게 볼 수 있어.`
- `시간은 선택사항이야. 모르면 비워둬도 돼.`

---

## DEC-010: 오래 쓰는 상담형 앱은 컬러 피로도를 관리한다

**날짜**: 2026-07-01
**상태**: 승인됨

**결정**:
강한 보라 계열이나 높은 대비를 반복하기보다, 일부 보조 영역에 따뜻한 중립색을 섞어 장기 사용 피로도를 줄인다.

**적용 대상**:
- 가격표 보조 영역
- 입력폼 보조 안내
- 배지/구분선/보조 배경

---

## DEC-011: 신뢰 UI는 입력 플로우를 덮지 않는다

**날짜**: 2026-07-01
**상태**: 승인됨

**결정**:
쿠키 배너, 하단 탭, 모달 같은 신뢰/보조 UI는 핵심 입력 컨트롤과 CTA를 덮으면 안 된다.

**근거**:
모바일 `/ko/reading` 390x844에서 쿠키 배너가 양력/음력 선택을 막아 최초 입력 플로우가 깨지는 P0가 발견됐다.

**검증 기준**:
- 쿠키 동의 전 상태에서도 양력/음력 선택 가능
- 다음 버튼 클릭 가능
- 랜딩 캐릭터 카드 CTA 클릭 가능
- safe-area와 하단 탭을 포함한 실제 터치 가능 영역 기준으로 확인

---

## DEC-012: 법무/개인정보 링크는 locale을 유지한다

**날짜**: 2026-07-01
**상태**: 승인됨

**결정**:
쿠키 배너, 푸터, 약관, 개인정보 링크는 현재 locale 흐름을 유지해야 한다.

**예시**:
- `/ko/reading`에서 개인정보 링크 클릭 시 `/ko/privacy-policy`
- locale 없는 `/privacy-policy`로 이탈하지 않기

---

## DEC-013: 첫 viewport 캐릭터 이미지는 LCP 우선순위로 관리한다

**날짜**: 2026-07-01
**상태**: 승인됨

**결정**:
랜딩 첫 viewport의 첫 캐릭터 이미지는 감정적 첫인상과 LCP에 영향을 주므로 우선 로딩 대상으로 관리한다.

**주의사항**:
- 모든 캐릭터 이미지에 priority를 붙이지 않는다.
- 첫 카드 또는 실제 첫 viewport에 노출되는 카드에만 priority/eager 전략을 적용한다.

---

## DEC-014: P0 보안 이슈 해결 전 결제 포함 공개 출시는 보류한다

**날짜**: 2026-07-01
**상태**: 승인됨

**결정**:
개인정보 IDOR, 별 무단 충전, Paddle 결제 검증 우회가 해결되기 전에는 결제 포함 공개 출시를 진행하지 않는다.

**근거**:
핵심 사주 데이터에는 이름, 생년월일, 성별, 분석 결과가 포함될 수 있고, 별/결제 시스템은 직접적인 금전 피해로 이어질 수 있다.

---

## DEC-015: readingId 기반 조회는 항상 소유자 검증을 통과해야 한다

**날짜**: 2026-07-01
**상태**: 승인됨

**결정**:
API route, Server Action, 결과 페이지, PDF 생성 등 모든 `readingId`/`compatibilityId` 기반 접근은 `user_id = current user id` 조건 또는 동등한 소유자 검증을 필수로 한다.

**검증 기준**:
- 사용자 A가 사용자 B의 리딩/궁합/채팅/PDF를 조회하거나 수정할 수 없다.
- RLS가 켜진 상태에서도 정상 사용자의 자기 데이터 접근은 유지된다.

---

## DEC-016: 별 차감과 결제 지급은 서버 신뢰 경계 안에서만 결정한다

**날짜**: 2026-07-01
**상태**: 승인됨

**결정**:
별 차감량은 클라이언트 입력값이 아니라 서버 정책으로 결정하고, 결제 지급량은 Paddle 실제 결제 상품 정보로 결정한다.

**적용 원칙**:
- 클라이언트 `amount`는 별 차감의 신뢰 근거가 아니다.
- Paddle `customData.productType`은 상품/지급량의 신뢰 근거가 아니다.
- 별 차감은 원자적 RPC 또는 트랜잭션으로 처리한다.
- Paddle webhook은 transaction/event idempotency를 보장한다.

---

## DEC-017: AI 비용 발생 API는 인증과 quota를 릴리즈 게이트에 포함한다

**날짜**: 2026-07-01
**상태**: 승인됨

**결정**:
Gemini 등 비용 발생 API는 인증, rate limit, daily quota 없이는 공개 트래픽에 노출하지 않는다.

**근거**:
비인증 suggestions 호출과 무제한 AI 호출은 서비스 비용 폭탄과 abuse 경로가 될 수 있다.

---

## DEC-018: 다음 제품 검증 축은 로그인 후 첫 상담 답변 품질이다

**날짜**: 2026-07-01
**상태**: 승인됨

**결정**:
랜딩 화면 설득이 일정 수준에 도달했으므로, 다음 핵심 개선은 로그인 후 첫 상담 답변 품질로 둔다.

**근거**:
20대 여성 고객 피드백에서 화면은 “꽤 설득됐다”는 평가를 받았고, 이후 이탈/재사용을 좌우할 지점은 첫 상담 답변이 실제로 내 고민을 정리해주는지다.

**검증 기준**:
- 첫 답변이 사용자의 고민 카테고리를 반영한다.
- 첫 답변이 하대, 공포, 과장, 운명 단정으로 흐르지 않는다.
- 첫 답변 끝에 다음 대화로 이어질 질문이나 선택지가 있다.
- 대표 고민 5개에서 구조적 품질 평가를 통과한다.

---

## DEC-019: 랜딩 CTA 전에는 무료 혜택과 가격 기준을 숨기지 않는다

**날짜**: 2026-07-01
**상태**: 승인됨

**결정**:
캐릭터 카드 CTA나 로그인 모달이 무료 맛보기/가격 인지보다 먼저 강하게 작동하지 않게 한다.

**근거**:
가격 확인 전 로그인 모달을 먼저 보면 “가입부터 요구하는 앱”처럼 느껴질 수 있다. 20대 여성 고객에게는 무료 혜택과 가격 투명성이 가입 전 신뢰 요소다.

---

## DEC-020: 모바일 쿠키 안내는 핵심 제목과 입력을 덮지 않는다

**날짜**: 2026-07-01
**상태**: 승인됨

**결정**:
모바일 쿠키 안내는 fixed overlay보다 inline notice나 공간 예약형 배너를 우선 검토한다.

**근거**:
하단 fixed 배너의 입력/CTA 차단은 해결됐지만, 상단 fixed 배너가 `/ko` H1과 `/ko/reading` 제목을 덮으면서 첫 화면 정보 위계를 깨는 P1이 남았다.

**검증 기준**:
- `/ko` 모바일 첫 화면에서 H1이 가리지 않는다.
- `/ko/reading` 모바일 첫 화면에서 제목 영역이 가리지 않는다.
- 달력 선택, 다음 버튼, 캐릭터 CTA는 계속 터치 가능하다.
- 개인정보 링크 locale 유지와 첫 이미지 LCP 최적화는 회귀하지 않는다.

---

## DEC-021: AI provider 실패는 빈 성공 응답으로 처리하지 않는다

**날짜**: 2026-07-01
**상태**: 승인됨

**결정**:
Gemini quota exceeded, provider failure, network failure 같은 AI 호출 실패는 `200 OK + empty body`로 처리하지 않는다.

**근거**:
실사용 QA에서 `/api/saju/chat`이 Gemini 쿼터 초과 상태에서도 `200 OK`와 빈 body를 반환했고, DB 메시지도 저장되지 않아 사용자가 성공으로 오해할 수 있는 상태가 발견됐다.

**검증 기준**:
- 실패 시 사용자는 명확한 실패 UI와 재시도 안내를 본다.
- 서버 로그에는 에러 name/message/status/cause 등 원인 추적 정보가 남는다.
- 실패 상태에서는 별이 차감되지 않는다.
- 클라이언트는 빈 응답을 성공한 assistant 답변으로 취급하지 않는다.

---

## DEC-022: 로그인 모달은 접근 가능한 dialog 기준을 충족한다

**날짜**: 2026-07-01
**상태**: 승인됨

**결정**:
로그인 모달은 시각적 팝업이 아니라 접근 가능한 modal dialog로 구현해야 한다.

**근거**:
20대 여성 고객 재리뷰에서 남은 이슈가 작아졌지만, 로그인 모달에 `role="dialog"`, `aria-modal`, 포커스 트랩이 없어 접근성 완성도가 아쉽다고 확인됐다.

**검증 기준**:
- `role="dialog"`와 `aria-modal="true"`가 있다.
- 제목/설명이 `aria-labelledby`와 `aria-describedby`로 연결된다.
- 모달 오픈 시 포커스가 모달 내부로 이동한다.
- `Tab`/`Shift+Tab` 포커스가 모달 내부에서 순환한다.
- 닫기 후 포커스가 원래 트리거로 돌아간다.

---

## DEC-023: 첫 상담 품질은 실제 Gemini 캡처로 최종 확인한다

**날짜**: 2026-07-01
**상태**: 승인됨

**결정**:
첫 상담 품질은 mock만으로 닫지 않고 실제 Gemini 연결 상태에서 대표 고민 5개를 캡처해 톤을 확인한다.

**검증 대상**:
- `썸/재회`
- `이직/퇴사`
- `돈 모으기`
- `번아웃`
- `친구/가족관계`

---

## DEC-024: 결제/크레딧 RPC는 service role 전용으로 둔다

**날짜**: 2026-07-01
**상태**: 승인됨

**결정**:
Paddle 웹훅 지급, 별 충전, 서버 정책 기반 별 차감 같은 민감 RPC는 기본적으로 `service_role` 전용으로 둔다. 클라이언트에서 직접 호출해야 하는 RPC는 함수 내부에서 `auth.uid()`와 리소스 소유권을 강제한다.

**근거**:
보안 핫픽스 재리뷰에서 `security definer` 함수인 `credit_stars_for_paddle_purchase`가 `authenticated`에 grant되어 결제 없이 별을 충전할 수 있는 P0 경로가 발견됐다. 이후 서버개발자/보안담당자 피드백에서 기존 `decrement_star`와 새 `deduct_stars_for_report`도 `authenticated`에 열려 있어 직접 호출 위험이 남았다고 확인됐다.

**검증 기준**:
- `credit_stars_for_paddle_purchase`는 `authenticated` execute 권한이 없다.
- `deduct_stars_for_report`를 authenticated에 남길 경우 함수 내부에서 `auth.uid() = p_user_id`와 reading 소유권을 확인한다.
- 기존 `decrement_star`도 직접 호출 권한과 내부 소유권 검증을 재검토한다.
- 회귀 테스트는 SQL에 `grant execute ... to authenticated`가 없는지 또는 내부 `auth.uid()` 검증이 있는지 확인한다.

---

## DEC-026: suggestions는 공개 비용 API로 보고 quota를 강제한다

**날짜**: 2026-07-01
**상태**: 승인됨

**결정**:
`/api/saju/suggestions`는 Gemini를 호출하는 비용 발생 API이므로 인증, IP/user rate limit, daily quota 중 최소 하나 이상의 강한 제한을 반드시 적용한다.

**근거**:
서버개발자/보안담당자 피드백에서 `suggestions` route가 인증/rate limit/daily quota 없이 Gemini를 호출해 공개 API 비용 폭탄 경로가 남았다고 확인됐다.

**검증 기준**:
- 비인증 사용자가 무제한 호출할 수 없다.
- quota 초과 시 Gemini 호출 전에 `429` 또는 정책상 `401`로 차단한다.
- 정상 사용자는 제한 안에서 suggestions를 받을 수 있다.
- rate limit 로그에 IP/user id, route, quota key, request id가 남는다.

---

## DEC-025: 결제 상태 전이는 클라이언트 임의 status API로 처리하지 않는다

**날짜**: 2026-07-01
**상태**: 승인 필요

**결정**:
`paid`, `completed`, `generating` 같은 결제/분석 상태 전이는 클라이언트가 임의 문자열로 호출하는 API에서 처리하지 않는다. 서버 내부 결제 성공, 별 차감 성공, 분석 생성 성공 같은 검증된 이벤트에서만 제한된 전이를 허용한다.

**근거**:
`/api/saju/update-status`가 본인 reading의 `status`를 그대로 저장해 사용자가 `paid`로 바꾼 뒤 `/api/saju/analyze`를 호출할 수 있는 결제 우회 경로가 남아 있다.

**검증 기준**:
- 일반 클라이언트는 reading status를 `paid`로 직접 바꿀 수 없다.
- `pending/preview -> paid` 전이는 결제 웹훅 또는 별 차감 성공 함수 안에서만 가능하다.
- 분석 API는 단순 `status === "paid"`만 보지 않고 결제/차감 증거 또는 서버 전이 이력을 신뢰한다.

---

## DEC-027: 채팅 성공 판정은 빈/부분 응답을 성공으로 보지 않는다

**날짜**: 2026-07-02
**상태**: 승인됨

**결정**:
사주 채팅 응답은 assistant 텍스트가 실제로 존재하고, stream error가 아니며, 초기 분석이 비정상적으로 짧지 않을 때만 성공으로 본다.

**적용 기준**:
- 빈 assistant 응답은 초기/후속 관계없이 실패다.
- `finishReason === "error"` 또는 AI SDK `isError`는 실패다.
- 초기 분석 응답이 너무 짧으면 partial 응답으로 보고 실패다.
- 실패 응답은 DB 저장, 별 차감, `chat_used` 증가, 제목 생성을 하지 않는다.
- 클라이언트도 같은 기준으로 별 UI 차감을 막고 재시도 안내를 띄운다.

---

## DEC-028: AI SDK 완료 텍스트는 최종 messages fallback까지 확인한다

**날짜**: 2026-07-02
**상태**: 승인됨

**결정**:
`useChat`의 `onFinish`에서는 `message` 단독의 `parts`만 읽지 않고, 비어 있으면 `messages` 배열의 마지막 assistant 메시지를 fallback으로 읽는다.

**근거**:
AI SDK 내부 구현상 `onFinish`는 `activeResponse.state.message`와 `state.messages`를 함께 넘긴다. 완료 콜백 시점에 `message.parts`가 비어 있더라도 최종 메시지 배열에 assistant 텍스트가 들어 있을 수 있어, `message` 단독 판정은 정상 응답을 빈 응답으로 오판할 수 있다.

**검증 기준**:
- `message.parts`가 비어 있고 `messages` 마지막 assistant에 text가 있으면 성공 텍스트로 인정한다.
- legacy `content` 문자열도 읽을 수 있어야 한다.
- 빈 assistant fallback은 별 차감 없이 재시도 안내로 처리한다.

---

## DEC-029: chat_used는 성공한 assistant 저장 뒤 증가한다

**날짜**: 2026-07-02
**상태**: 승인됨

**결정**:
`saju_readings.chat_used`는 성공한 assistant 응답 저장 뒤 증가시킨다.

**근거**:
첫 상담 전용 지시문은 첫 답변 품질에는 필요하지만, 후속 질문까지 계속 적용되면 `응 알려줘` 같은 짧은 대화형 응답의 맥락을 방해한다.

**검증 기준**:
- 성공한 assistant 응답 뒤 `chat_used`가 `reading.chat_used + 1`로 업데이트된다.
- 실패/빈/부분 응답에서는 `chat_used`가 증가하지 않는다.
- 후속 요청은 첫 상담 규칙보다 질문에 바로 답하는 규칙을 우선한다.

---

## DEC-030: 유료 전환 전 가격 정책과 코칭 루프를 분리해서 확정한다

**날짜**: 2026-07-03
**상태**: 승인 필요

**결정**:
테스터 재검증이 끝난 뒤, 별 가격 조절 정책과 코칭형 사주풀이 루프를 별도 제품 과제로 확정한다.

**근거**:
현재 가격은 공개되어 있지만 운영 가능한 가격 정책과 상품별 별 사용량은 덜 닫혔다. 첫 상담 답변 품질은 개선됐지만, PRD의 오늘피드/행동카드/타임라인/월간 전략 리포트/대화 요약으로 이어지는 코칭 경험은 아직 전체 루프로 완성되지 않았다.

**검증 기준**:
- 채팅, 리포트, 종합 백서별 별 사용량이 명확하다.
- 가격 패키지, 약관, Paddle, 랜딩, JSON-LD가 같은 가격 기준을 사용한다.
- 첫 상담 결과가 오늘 할 일, 피할 것, 확인 질문, 이번 주 코칭 포인트로 구조화된다.
- 오늘피드와 월간 리포트가 채팅 답변과 같은 코칭 맥락을 공유한다.

---

## DEC-031: 결제 포함 배포는 서버 신뢰 경계 통과 후 진행한다

**날짜**: 2026-07-03
**상태**: 승인됨

**결정**:
결제 포함 공개 배포는 `pnpm build` 통과만으로 진행하지 않고, 결제 상태 전이, 별 차감 원자성, 운영 DB 마이그레이션, Paddle production env, AI runtime 검증을 모두 통과한 뒤 진행한다.

**근거**:
`/api/saju/update-status`처럼 클라이언트가 결제 상태를 바꿀 수 있거나, `/api/saju/chat`처럼 AI 비용 발생 후 별 차감이 실패할 수 있으면 금전/비용 피해가 생긴다.

**릴리즈 게이트**:
- 클라이언트가 `paid` 상태를 직접 만들 수 없다.
- 별 1개로 동시 AI 응답 2개를 받을 수 없다.
- 운영 Supabase에 민감 RPC 권한 회수 마이그레이션이 적용돼 있다.
- `REQUIRE_PADDLE_ENV=true pnpm test:env`가 운영 환경 기준으로 통과한다.
- `pnpm audit --prod`에서 production 취약점을 검토/해소한다.

---

## DEC-032: 가격/코칭 MVP 구현은 개발자 전달 문서 기준으로 진행한다

**날짜**: 2026-07-07
**상태**: 승인됨

**결정**:
Codex는 가격/코칭 MVP를 직접 코딩하지 않고, 개발자가 구현할 수 있는 결정 완료 문서만 작성한다.

**확정 가격**:
- 스타터: `10별 3,900원`
- 기본: `30별 9,900원`
- 인기: `70별 19,900원`
- 최고 가성비: `250별 39,900원`
- 멤버십: `월 9,900원`, 매월 `40별`
- 채팅: `1별`
- 월간 전략 리포트 상세판: `3별`
- 종합 사주 백서: `5별`

**확정 코칭 구조**:
첫 상담 성공 후 `CoachingSnapshot`을 만들고 오늘피드, 후속 질문, 월간 전략 리포트, 기억 요약에 재사용한다.

---

## DEC-033: 가격/코칭 MVP는 source of truth와 서버 차감 RPC를 기준으로 구현한다

**날짜**: 2026-07-07
**상태**: 승인됨

**결정**:
가격 정책은 `src/lib/monthly-saju/pricing.ts`를 기준으로 하고, 결제/차감은 클라이언트 값이 아니라 Paddle price id와 서버 RPC 고정 비용을 신뢰한다.

**확정 구현**:
- Paddle 상품 타입은 `stars10`, `stars30`, `stars70`, `starsPremium`, `monthlyMembership`.
- 채팅은 1별, 월간 전략 리포트 상세판은 3별, 종합 사주 백서는 5별.
- 첫 상담 코칭 데이터는 assistant 메시지 저장 성공 후 `coaching_snapshots`에 생성한다.
- 오늘피드는 `coaching_snapshots` 최신 row를 우선 사용하고 없으면 기존 reading/memory fallback을 쓴다.

**운영 조건**:
새 Supabase 마이그레이션과 Paddle env가 운영에 적용되지 않으면 코드 빌드가 통과해도 실사용 결제/코칭 루프는 완성되지 않는다.

---

## DEC-034: 가격/코칭 MVP 완료 판정은 월간 리포트 개인화까지 포함한다

**날짜**: 2026-07-07
**상태**: 승인 필요

**결정**:
가격/코칭 MVP는 가격 상수와 차감 RPC만으로 완료 처리하지 않는다. 월간 전략 리포트가 `CoachingSnapshot`, 최근 대화 기억, 사주 요약을 묶어 개인화되고, 멤버십 상태와 가격 source of truth가 운영 화면까지 닫혀야 완료로 본다.

**근거**:
현재 구현은 3별 차감 상세판을 열 수 있지만, 리포트 본문은 정적 문구 중심이다. 유저가 돈을 내는 지점이 개인화 코칭 가치와 연결되지 않으면 “유료 전환 가능한 코칭형 사주앱 MVP”라고 보기 어렵다.

**검증 기준**:
- 월간 리포트가 최신 snapshot, 최근 user 메시지 8개 기반 memory, 사주 요약을 사용한다.
- 약관, FAQ, 코인샵, JSON-LD, Paddle mapping이 같은 pricing source of truth에서 나온다.
- 멤버십 활성/해지/갱신 상태가 저장되고 관리자 화면에서 보인다.
- 관리자 화면에서 별 잔액, 최근 차감 타입, 최근 snapshot 생성 여부를 확인할 수 있다.

---

## DEC-035: 첫 상담은 서버 선검수와 안전 fallback을 운영 기본값으로 둔다

**날짜**: 2026-07-10
**상태**: 승인됨

**결정**:
첫 상담은 사용자에게 바로 스트리밍하지 않고, 서버에서 모델 응답을 생성한 뒤 저장 전 품질 게이트를 통과한 답변만 저장/전송한다. 모델 응답이 3회 연속 품질 게이트를 통과하지 못하면 503 반복 대신 캐릭터별 안전 fallback을 같은 게이트로 검수해 저장/전송한다.

**근거**:
실사용 QA에서 모델 응답이 3회 연속 게이트 실패로 503을 만들거나, 내부 게이트 통과 후 외부 QA에서 `오늘 할 구체 행동 없음`으로 실패하는 문제가 반복됐다. 첫 상담은 유저 신뢰와 과금 시작점이라 빈 응답, 끊긴 응답, 품질 미달 저장, 별 차감 불일치를 허용하면 안 된다.

**품질 기준**:
- 정확히 2문단.
- 마지막 문장은 실제 질문이고 물음표로 끝난다.
- `사주` 근거가 포함된다.
- 두 번째 문단에 오늘 바로 할 수 있는 구체 행동이 있다.
- 이모지, 영문자, 가벼운 외래어, 금지 표현을 포함하지 않는다.

**검증 기준**:
- `pnpm test`, `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`가 통과한다.
- `scripts/qa-gemini-first-consultation.mjs` 6케이스가 통과한다.
- `scripts/qa-live-api-check.mjs`가 실제 `/api/saju/chat` 무료/유료 첫 상담, 동시성 200/409, 별 차감, `chat_message` 거래 로그까지 확인한다.
- 원격 Supabase에서 `decrement_star`는 잔액 차감과 `star_transactions` 기록을 같은 RPC 안에서 처리한다.

---

## DEC-036: production 배포는 보안/결제 릴리즈게이트 통과 전 금지한다

**날짜**: 2026-07-21
**상태**: 승인됨

**결정**:
Vercel `monthlysaju` production 배포는 환경변수, 결제, Supabase RLS/RPC, AI 비용 제어, rate limit, 의존성 취약점 게이트를 모두 통과하기 전까지 진행하지 않는다.

**필수 게이트**:
- Vercel production env에 Supabase, service role, AI provider, Paddle, origin, admin env가 모두 등록돼 있다.
- `REQUIRE_PADDLE_ENV=true` 상태에서 env check와 production build가 Paddle 누락을 막는다.
- `user_stars`, `star_transactions`는 authenticated 직접 조작이 불가능하고 service role/RPC 전용이다.
- 채팅 별 차감은 AI 호출 전 예약/차감 또는 DB 트랜잭션형 원자 처리로 설계한다.
- rate limit은 Upstash Redis, Vercel KV, Supabase RPC 같은 공유 저장소 기반이다.
- Paddle subscription webhook은 one-time credit과 동일하게 price/product id allowlist를 검증한다.
- `pnpm audit --prod` high/critical 취약점은 업데이트하거나 완화 사유를 기록한다.

**검증 기준**:
- `REQUIRE_PADDLE_ENV=true pnpm test:env`
- `pnpm test`
- `pnpm exec tsc --noEmit`
- `pnpm lint`
- `pnpm build`
- `pnpm audit --prod`

---

## DEC-037: 수정후에도 배포 승인은 release gate와 운영 env 확인 기준으로만 한다

**날짜**: 2026-07-23
**상태**: 승인됨

**결정**:
개발자가 보안사항을 수정했더라도 production 배포 승인은 코드 테스트 통과만으로 판단하지 않는다. Vercel production 환경변수, Paddle env gate, Supabase 운영 migration 적용, production dependency audit high gate까지 모두 통과해야 승인한다.

**근거**:
2026-07-23 재검증에서 핵심 보안 회귀 테스트와 전체 테스트, build는 통과했지만 Vercel `todocori/monthlysaju` 환경변수가 하나도 없었고, `REQUIRE_PADDLE_ENV=true pnpm test:env`는 Paddle 필수값 누락으로 실패했으며, `pnpm audit --prod --audit-level high`는 `next@16.2.9` high 취약점 4개로 실패했다.

**검증 기준**:
- Vercel production env에 Supabase, service role, AI provider, Paddle, canonical origin, rate limit backend가 등록돼 있다.
- `env REQUIRE_PADDLE_ENV=true pnpm test:env`가 통과한다.
- `pnpm test`, `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`가 통과한다.
- `pnpm audit --prod --audit-level high`가 통과한다.
- Supabase production DB에 `202607210010_release_gate_star_reservation_rate_limit.sql`이 적용돼 있고, 별 직접 insert/update 정책이 남아 있지 않다.

---

## DEC-038: production OAuth origin은 canonical env 없으면 fail-closed 한다

**날짜**: 2026-07-23
**상태**: 승인됨

**결정**:
production에서는 `APP_ORIGIN` 또는 `NEXT_PUBLIC_APP_URL` 중 하나가 반드시 설정돼야 한다. 둘 다 없으면 OAuth callback/redirect URL 계산에서 `origin`, `x-forwarded-host`, `host` 같은 요청 헤더를 신뢰하지 않고 `PRODUCTION_APP_ORIGIN_REQUIRED`로 실패한다.

**근거**:
배포보안 재검증에서 production env가 비어 있을 때 header fallback 경로가 남아 있으면 untrusted forwarded header 기반 redirect/origin 혼선이 생길 수 있다고 확인했다. 운영 배포는 canonical origin env를 명시하는 방식으로만 허용한다.

**검증 기준**:
- production + canonical origin 없음 + 악성 forwarded header 입력 시 `getSiteUrlFromRequestHeaders`가 `PRODUCTION_APP_ORIGIN_REQUIRED`를 던진다.
- production + `APP_ORIGIN` 설정 시 forwarded header보다 configured origin을 우선한다.
- `pnpm exec vitest run src/lib/auth/oauth.test.ts`가 통과한다.
---

## DEC-039: 결제 재오픈 전까지 결제 진입점은 feature flag로 닫는다

**날짜**: 2026-07-23
**상태**: 승인됨

**결정**:
Paddle 코드는 삭제하지 않고 보존하되, production 초기 배포에서는 `PAYMENTS_ENABLED=false`, `NEXT_PUBLIC_PAYMENTS_ENABLED=false`로 결제 진입점을 닫는다.

**근거**:
Paddle production env와 실제 결제 QA가 아직 준비되지 않았고, 결제 버튼이 보이는데 실패하는 경험은 신뢰를 크게 해친다.

**구현 기준**:
- 서버는 `PAYMENTS_ENABLED`를 본다.
- 브라우저 checkout/UI는 `NEXT_PUBLIC_PAYMENTS_ENABLED`를 본다.
- `release:gate:code`는 비결제 베타의 코드/빌드/audit 게이트로 Paddle env를 요구하지 않는다.
- `release:gate`는 production 승인용으로 실제 Supabase API QA까지 요구한다.
- `release:gate:payments`는 결제 재오픈용으로 `REQUIRE_PADDLE_ENV=true`를 요구한다.

**재오픈 조건**:
- Paddle product/price/webhook env 등록
- `PAYMENTS_ENABLED=true`
- `NEXT_PUBLIC_PAYMENTS_ENABLED=true`
- `pnpm release:gate:payments` 통과
- 실제 결제 QA 통과

---

## DEC-040: 실제 Supabase API QA 미완료는 production blocker다

**날짜**: 2026-07-23
**상태**: 승인됨

**결정**:
무료 상담형 베타라도 실제 Supabase DB 기반 API QA가 통과하지 않으면 production 배포 승인으로 보지 않는다.

**근거**:
Gemini QA, Playwright 렌더링, 코드 게이트가 통과해도 실제 DB에서 무료 첫 상담, 별 예약/차감/환불, 거래 로그, 메시지 저장이 동작하는지는 별도 검증이 필요하다.

**구현 기준**:
- `release:gate:code`는 코드 게이트다.
- `qa:live-api:free`는 무료 첫 상담 실제 API QA다.
- `qa:live-api`는 전체 실제 API QA다.
- `release:gate`는 위 세 단계를 모두 통과해야 한다.
- Supabase DNS `ENOTFOUND`는 앱 로직 실패는 아니지만 production blocker로 유지한다.

---

## DEC-041: release gate는 코드/무료 API/결제 게이트를 분리해서 해석한다

**날짜**: 2026-07-23
**상태**: 승인됨

**결정**:
`release:gate:code`, `release:gate`, `release:gate:payments`는 각각 다른 승인 의미를 가진다. `release:gate:code`만 통과한 상태를 production 배포 승인으로 보지 않는다.

**근거**:
배포 및 서버보안 재피드백에서 `release:gate:code`는 통과했지만 기본 `release:gate`는 Supabase DNS `ENOTFOUND`로 실패했고, `release:gate:payments`는 Paddle 필수 env 누락으로 실패했다. Vercel production env도 `No Environment Variables found` 상태였다.

**해석 기준**:
- `release:gate:code`: 코드/타입/lint/build/high audit 중심 게이트
- `release:gate`: 무료 베타 production 승인 게이트. 실제 무료 상담 API QA까지 포함해야 한다.
- `release:gate:payments`: 결제 포함 production 배포 또는 결제 재오픈 게이트. Paddle 필수 env와 결제 검증을 포함해야 한다.

**배포 기준**:
- 결제 제외 무료 베타: `release:gate` 통과 필요
- 결제 포함 배포: `release:gate`와 `release:gate:payments` 모두 통과 필요
- Vercel production env가 비어 있으면 배포 승인은 보류한다.

---

## DEC-042: production release gate는 origin, shared rate limit, payment-off 상태를 먼저 확인한다

**날짜**: 2026-07-23
**상태**: 승인됨

**결정**:
무료 베타 production 승인용 `release:gate`는 코드 게이트 이후 실제 live API QA 전에 `REQUIRE_PRODUCTION_ENV=true pnpm test:env`를 실행한다.

**근거**:
Supabase live QA가 중요하더라도, production env가 안전하지 않은 상태에서 live QA만 기다리면 `release:gate:code` 통과를 배포 가능으로 오해할 수 있다. 특히 canonical origin, 공유 rate limit backend, 결제 비활성화 flag는 무료 베타 production에도 필수다.

**검증 기준**:
- `REQUIRE_PRODUCTION_ENV=true`에서 `APP_ORIGIN` 또는 `NEXT_PUBLIC_APP_URL`이 없으면 실패한다.
- `REQUIRE_PRODUCTION_ENV=true`에서 `RATE_LIMIT_BACKEND=supabase`가 아니면 실패한다.
- `REQUIRE_PRODUCTION_ENV=true`이면서 `REQUIRE_PADDLE_ENV=true`가 아닐 때 `PAYMENTS_ENABLED` 또는 `NEXT_PUBLIC_PAYMENTS_ENABLED`가 true면 실패한다.
- `release:gate:payments`는 `REQUIRE_PRODUCTION_ENV=true REQUIRE_PADDLE_ENV=true pnpm test:env`로 시작한다.

---

## DEC-043: 무료 베타 production env는 Paddle 없이 먼저 닫는다

**날짜**: 2026-07-24
**상태**: 승인됨

**결정**:
Vercel `todocori/monthlysaju` production env에는 무료 베타 운영에 필요한 Supabase, AI, origin, admin, rate limit, payment-off env만 등록하고 Paddle 결제 env는 등록하지 않는다.

**근거**:
현재 배포 목표는 결제 보존형 비활성화 무료 베타다. Paddle env를 어설프게 섞으면 결제 재오픈 기준과 무료 베타 기준이 흐려지고, 사용자에게 실패하는 결제 경험을 줄 수 있다.

**검증 기준**:
- `PAYMENTS_ENABLED=false`
- `NEXT_PUBLIC_PAYMENTS_ENABLED=false`
- `REQUIRE_PADDLE_ENV=false`
- `RATE_LIMIT_BACKEND=supabase`
- `pnpm release:gate` 통과
- 결제 재오픈 전에는 `release:gate:payments`를 별도로 통과한다.

---

## DEC-044: 운영 보안 승인에는 authenticated QA가 필요하다

**날짜**: 2026-07-24
**상태**: 승인됨

**결정**:
`monthlysaju.vercel.app` production 사이트의 비인증 외부 점검이 통과에 가까워도 운영 보안 승인은 로그인 후 계정 데이터 IDOR, Supabase RLS/RPC 운영 적용, Paddle webhook 정합성 authenticated QA까지 통과해야 한다.

**근거**:
비파괴 외부 점검으로 HTTPS/HSTS, 기본 보안 헤더, 공개 시크릿 노출, 비인증 API 차단, OAuth redirect origin spoofing 방어는 확인할 수 있었다. 하지만 사용자 A가 사용자 B의 리딩/채팅/PDF/리포트에 접근할 수 없는지, 운영 DB에 RLS와 RPC 권한이 실제 적용됐는지, Paddle 성공/실패/중복/환불 webhook이 정합성을 지키는지는 로그인 세션과 운영 DB 권한 테스트 없이는 확인할 수 없다.

**검증 기준**:
- A 세션으로 B의 reading/chat/report/pdf/my-readings 리소스 접근 또는 변경이 403/404로 실패한다.
- anon/authenticated 키로 민감 테이블 직접 조작과 민감 RPC 직접 호출이 실패한다.
- service role 서버 경로는 정상 동작한다.
- Paddle webhook은 서명 검증, price/product allowlist, idempotency, 성공/실패/환불/구독 상태 전이를 모두 검증한다.
- OAuth PKCE code verifier cookie는 `Secure`, 가능한 경우 `HttpOnly`, 짧은 TTL을 가진다.
- CSP는 `unsafe-eval`, `unsafe-inline`, 넓은 `frame-ancestors`를 최소화한다.

---

## DEC-045: 결제 포함 운영 재오픈은 Paddle signed webhook 성공 QA 이후로 제한한다

**날짜**: 2026-07-24
**상태**: 승인됨

**결정**:
Paddle 결제 포함 운영 재오픈은 정상 서명 webhook 성공/실패/중복 QA가 운영 또는 운영에 준하는 환경에서 통과하기 전까지 보류한다.

**근거**:
- 운영 endpoint는 무서명/오서명을 401로 막지만, 로컬 QA secret으로 서명한 정상 payload도 401로 거부됐다.
- 이 상태에서는 실제 결제 완료 후 별 지급 또는 멤버십 반영 실패 가능성이 있다.

**수용 기준**:
- 정상 서명 `transaction.completed`는 200이고 실제 price id 기준으로 1회만 별이 적립된다.
- `transaction.payment_failed`는 200이지만 별/멤버십 데이터가 변하지 않는다.
- 같은 transaction id 재전송은 200이지만 중복 지급되지 않는다.
- 구독 활성/취소 signed payload가 `user_memberships`에 정확히 반영된다.

---

## DEC-046: 운영 배포 승인은 production env release gate 전체 통과 기준으로 본다

**날짜**: 2026-07-24
**상태**: 승인됨

**결정**:
운영 배포 승인은 `QA_BASE_URL=https://monthlysaju.vercel.app pnpm run release:gate` 전체 통과를 기준으로 한다. 무료/비결제 운영 QA가 통과해도 production env 검사 실패가 있으면 배포 승인 상태로 보지 않는다.

**근거**:
- 운영 API QA는 통과했지만 release gate는 `GOOGLE_VERTEX_RUNTIME_AUTH` production env 검사에서 실패했다.
- 실제 운영 장애는 코드보다 env 스코프와 provider 인증 불일치에서 발생할 수 있다.

**수용 기준**:
- `pnpm test`, `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`, high 이상 `pnpm audit`, `REQUIRE_PRODUCTION_ENV=true pnpm test:env`, 운영 URL live QA가 모두 통과한다.
- 결제 재오픈은 별도 `pnpm run release:gate:payments`까지 통과한다.

---

## DEC-047: 하은은 인영으로 바꾸되 내부 id는 haeun으로 유지한다

**날짜**: 2026-07-24
**상태**: 승인됨

**결정**:
운세/시기 상담사 `하은`의 유저 노출명은 `인영`으로 변경한다. 다만 내부 character id는 `haeun`으로 유지한다.

**근거**:
`인영`은 시간의 흐름, 월운, 길일 상담사에 더 성숙하고 차분한 인상을 준다. 반면 내부 id까지 바꾸면 기존 채팅, 리딩, analytics, URL, 저장 데이터 호환 범위가 커진다.

**구현 기준**:
- `CHARACTERS.haeun.name`은 `인영`이다.
- `haeun` 캐릭터의 free/paid prompt 자기소개는 `넌 '인영'이야`로 시작한다.
- analytics나 화면 표시명은 `인영`을 사용한다.
- `id: "haeun"`, `CharacterType`의 `"haeun"`, 기존 저장 데이터는 유지한다.
- asset path의 `haeun-premium.png`는 당장 변경하지 않아도 된다.

**검증 기준**:
- 유저 화면과 AI 답변에서 `하은`이 노출되지 않는다.
- 기존 `haeun` 경로와 저장 대화가 깨지지 않는다.
- 캐릭터명 오호칭 QA가 `인영` 기준으로 통과한다.

---

## DEC-048: 결제 재오픈 게이트에 Paddle signed webhook live QA를 포함한다

**날짜**: 2026-07-24
**상태**: 승인됨

**결정**:
결제 포함 운영 재오픈은 코드/빌드/env/audit 검사만으로 승인하지 않고 `qa:paddle-webhook:signed`까지 통과해야 한다. 이를 위해 `release:gate:payments:live`를 별도 스크립트로 둔다.

**근거**:
production webhook endpoint는 무서명/오서명 401 방어는 통과했지만, QA 정상 서명 payload도 401을 받아 Paddle Dashboard Notification Destination secret과 Vercel `PADDLE_WEBHOOK_SECRET` 불일치 가능성이 남았다. 이 상태에서 실제 결제가 들어오면 별 지급 또는 멤버십 반영이 실패할 수 있다.

**검증 기준**:
- 무서명 `transaction.completed`는 401이다.
- 정상 서명 `transaction.payment_failed`는 200이고 별/멤버십 데이터가 변하지 않는다.
- 정상 서명 `transaction.completed`는 허용된 price/product에 대해서만 별을 1회 지급한다.
- 같은 transaction id 재전송은 200이지만 중복 지급하지 않는다.
- `subscription.activated`와 `subscription.canceled`는 `user_memberships` 상태를 정확히 반영한다.
- 정상 서명 completed가 401이면 운영 Secret 불일치로 보고 결제 재오픈을 보류한다.

---

## DEC-049: 캐릭터성은 toneProfile로 관리하고 최종 prompt에 주입한다

**날짜**: 2026-07-24
**상태**: 승인됨

**결정**:
상담사별 말투 차별화는 긴 prompt 내부 문장만으로 관리하지 않고 `CharacterToneProfile` 데이터로 관리한다. 최종 prompt 생성 시 캐릭터별 답변 구조, 선호 표현, 피할 표현, 마지막 질문 방식을 자동으로 주입한다.

**근거**:
공통 안전장치가 강해질수록 모든 상담사가 “차분한 상담사”로 평준화될 수 있다. 구조화된 tone profile은 캐릭터 선택의 재미와 상담 경험의 차이를 테스트 가능한 데이터로 남긴다.

**구현 기준**:
- `haeun` id는 계속 유지한다.
- `haeun`의 유저 노출명과 prompt 자기소개는 `인영`이다.
- 현우는 핵심 판단과 오늘 행동, 하나는 감정/표현 속도, 민준은 돈 구조와 이번 달 기준, 인영은 좋은 시기/피할 시기/준비 행동, 지안은 재회 조건과 연락 기준, 서준은 버틸 조건과 움직일 조건, 도윤은 사람/돈/시기 리스크를 중심으로 답한다.
- 최종 prompt에는 정확한 압박 금지어를 반복하지 않고 범주형으로 피할 표현을 안내한다.

---

## DEC-050: 스타터는 2,900원, 월간 멤버십은 50별로 조정한다

**날짜**: 2026-07-24
**상태**: 승인됨

**결정**:
스타터 상품은 `10별 2,900원`으로 낮추고, 월간 멤버십은 `월 9,900원 / 매월 50별 지급`으로 조정한다.

**유지**:
- 가입 후 3회 무료
- 1별 = 메시지 1회
- 30별 9,900원
- 70별 19,900원
- 250별 39,900원
- 월간 리포트 상세 3별
- 종합 사주 백서 5별

**근거**:
20대 여성 소비자 관점 재리뷰에서 무료 사용 의향은 높고, 첫 결제는 월구독보다 가벼운 스타터가 더 적합하다고 판단됐다. 스타터 2,900원은 첫 결제 장벽을 낮추고, 월 50별은 매일 한 번 상담하고도 월간 리포트와 후속 질문을 이어갈 수 있는 양이라 월 9,900원 구독 가치를 더 명확히 만든다.

**주의**:
스타터는 30별 패키지보다 별 단가가 낮으므로 반복 구매가 열리면 30별 상품을 잠식할 수 있다. 가능하면 첫 결제 1회 한정으로 두거나, 최소한 첫 결제용 상품으로 포지셔닝한다.

**검증 기준**:
- 가격 source of truth에서 `stars10.price === 2900`이다.
- `MONTHLY_MEMBERSHIP.stars === 50`이다.
- 랜딩, 코인샵, FAQ, JSON-LD, 약관/환불정책, Paddle mapping이 같은 값을 말한다.
- Paddle webhook은 실제 price id 기준으로 10별 또는 월 50별을 지급한다.

**구현 메모**:
- 2026-07-24 코드 상수와 테스트는 `stars10.price === 2900`, `MONTHLY_MEMBERSHIP.stars === 50` 기준으로 변경 완료했다.
- 코인샵 기본 선택은 `stars10`으로 둔다.
- 첫 결제 1회 제한은 아직 서버 정책으로 강제하지 않고, 스타터 포지셔닝과 운영 price id 검증을 우선한다.
