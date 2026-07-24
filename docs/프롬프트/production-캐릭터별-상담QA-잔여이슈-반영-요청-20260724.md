# production 캐릭터별 상담 QA 잔여이슈 반영 요청

## 사용자 요청

```text
[production-캐릭터별-상담QA-잔여이슈-개발자전달-20260724.md](/Users/apple/Desktop/test_githup/saju/docs/pm/production-캐릭터별-상담QA-잔여이슈-개발자전달-20260724.md) 그리고 끝나면 커밋후 푸시, 지금까지 내용 문서화한후 메모리에 저장
```

## 처리 방향
- PM 문서의 production QA 잔여이슈를 읽고 코드 수정이 필요한 항목을 선별한다.
- 인영 첫 상담 난이도와 한자/전문용어 과다 문제를 TDD로 먼저 고정한다.
- 도윤 간헐 503/50초 대기 문제는 첫 상담 생성 timeout, fallback, 로그 보강으로 방어한다.
- 전체 테스트와 빌드 검증 후 문서화, 메모리 저장, 커밋/푸시를 수행한다.
