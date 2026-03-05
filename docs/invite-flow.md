# 초대 플로우 경우의 수

A = 초대하는 사람 (inviter), B = 초대받는 사람 (invitee)

---

## 케이스 1: B가 비회원 (계정 없음)

```
A가 초대 링크 공유 (/invite/[A의 profile id])
  -> B가 링크 클릭
  -> proxy: invited_by 쿠키 설정
  -> invite page: 비로그인 -> 카카오 로그인 버튼 표시
  -> B가 카카오 로그인
  -> auth/callback: invited_by 쿠키 있음 -> /invite/[id]로 redirect
  -> invite page: 로그인됨 + 프로필 없음 -> /profile/create로 redirect
  -> B가 프로필 생성
  -> createProfile: invited_by 쿠키로 couple 생성 (점수 없음), 쿠키 삭제
  -> /test/intro로 redirect
  -> B가 테스트 완료
  -> completeTest -> tryPopulateCoupleScores: couple 존재 + A 테스트 완료 시 점수 populate
```

**결과**: couple 생성 + (A 테스트 완료면) 점수 populate

---

## 케이스 2: B가 회원이지만 프로필 없음 (가입만 하고 프로필 미생성)

```
B가 링크 클릭
  -> proxy: invited_by 쿠키 설정
  -> invite page: 로그인됨 + 프로필 없음 -> /profile/create로 redirect
  -> 이후 케이스 1과 동일
```

---

## 케이스 3: B가 프로필 있음 + 테스트 미완료 + couple 없음

```
B가 링크 클릭
  -> proxy: invited_by 쿠키 설정
  -> invite page: 로그인됨 + 프로필 있음 + couple 없음 -> 수락 UI 표시
  -> B가 수락 클릭
  -> acceptInvite: couple 생성 (점수 없음, B 테스트 미완료)
  -> /test/intro로 redirect
  -> B가 테스트 완료
  -> completeTest -> tryPopulateCoupleScores: couple 존재 + A 테스트 완료 시 점수 populate
```

**결과**: couple 생성 + (A 테스트 완료면) 점수 populate

---

## 케이스 4: B가 프로필 있음 + 테스트 완료 + couple 없음

```
B가 링크 클릭
  -> proxy: invited_by 쿠키 설정
  -> invite page: 로그인됨 + 프로필 있음 + couple 없음 -> 수락 UI 표시
  -> B가 수락 클릭
  -> acceptInvite: couple 생성 + 양쪽 테스트 완료 -> 점수 즉시 populate
  -> /home으로 redirect
```

**결과**: couple 생성 + 점수 즉시 populate

---

## 케이스 5: B가 이미 다른 couple이 있음

```
B가 링크 클릭
  -> invite page: 로그인됨 + 프로필 있음 + couple 이미 존재 -> /home으로 redirect
```

**결과**: 무시 (기존 couple 유지)

---

## 케이스 6: A가 자기 자신의 초대 링크를 클릭

```
A가 링크 클릭
  -> invite page: profile.id === inviter.id -> /home으로 redirect
```

**결과**: 무시

---

## 케이스 7: B가 링크 클릭 후 수락하지 않음

```
B가 링크 클릭
  -> proxy: invited_by 쿠키 설정
  -> invite page: 수락 UI 표시
  -> B가 수락하지 않고 이탈
```

**결과**: 아무 일도 안 일어남. 쿠키만 남음 (7일 후 만료)

---

## 쿠키 생명주기

| 시점 | 동작 |
|------|------|
| `/invite/[id]` 방문 | proxy에서 `invited_by` 쿠키 설정 (7일 TTL) |
| 카카오 로그인 후 | auth/callback에서 쿠키 확인 -> `/invite/[id]`로 redirect |
| 프로필 생성 시 | createProfile에서 쿠키로 couple 생성 후 쿠키 삭제 |
| 수락 시 | acceptInvite에서 couple 생성 (쿠키와 무관, inviterProfileId를 직접 전달) |
| 만료 | 7일 후 자동 만료 |

---

## couple 생성 시점 (2곳)

1. **createProfile** (프로필 생성) - `invited_by` 쿠키가 있을 때 -> couple 생성 (점수 없음)
2. **acceptInvite** (초대 수락) - 이미 프로필이 있는 사람이 수락할 때 -> couple 생성

## 점수 populate 시점 (2곳)

1. **acceptInvite** - couple 생성 직후, 양쪽 테스트 완료면 즉시
2. **completeTest -> tryPopulateCoupleScores** - 테스트 완료 시, couple이 있고 양쪽 완료면

---

## 주의: 쿠키가 남아있는 상태에서 로그아웃 후 재로그인

```
B가 초대 링크 방문 -> 쿠키 설정 -> 로그아웃 -> 재로그인
  -> auth/callback: invited_by 쿠키 남아있음 -> /invite/[id]로 redirect
  -> invite page: couple 이미 있으면 -> /home으로 redirect
  -> invite page: couple 없으면 -> 수락 UI 표시
```

쿠키가 남아있어도 invite page가 couple 존재 여부로 분기하므로 문제없음.

---

## befe_invitations 테이블

초대 링크 방문 외에도, 홈 화면에서 초대를 확인하고 수락할 수 있게 하기 위한 테이블.

### invitation 생성 시점

- B가 `/invite/[A의 profile id]` 페이지에 로그인 + 프로필 있음 + couple 없음 상태로 도달했을 때
- `onConflictDoNothing`으로 중복 방지

### invitation 수락 시점 (2곳)

1. **acceptInvite** (invite 페이지에서 수락) - couple 생성 + invitation status → accepted
2. **acceptInvitationFromHome** (홈에서 수락) - couple 생성 + invitation status → accepted

### 홈 화면 초대 배너

- couple이 없을 때만 pending invitation 조회
- 있으면 초대 배너 표시 → 수락 버튼 → `acceptInvitationFromHome` 호출
