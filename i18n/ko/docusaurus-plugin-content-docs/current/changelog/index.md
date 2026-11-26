---
title: 변경 내역
sidebar_position: 1
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

## 버전 관리 정책 {#versioning-policy}

Socket.IO 릴리스는 [유의적 버전](https://semver.org/)(Semantic Versioning)을 충실히 따릅니다.

즉 버전 번호가 `x.y.z`일 때 다음과 같습니다.

- 치명적인 버그 수정을 배포할 때는 `z` 숫자를 올려 패치 릴리스를 냅니다(예: `1.2.3` → `1.2.4`).
- 새 기능이나 치명적이지 않은 수정을 배포할 때는 `y` 숫자를 올려 마이너 릴리스를 냅니다(예: `1.2.3` → `1.3.0`).
- 호환성을 깨는 변경을 배포할 때는 `x` 숫자를 올려 메이저 릴리스를 냅니다(예: `1.2.3` → `2.0.0`).

## 호환성을 깨는 변경 {#breaking-changes}

호환성을 깨는 변경은 모두에게 불편하므로 Socket.IO 팀은 메이저 릴리스를 가능한 한 줄이려고 합니다.

그동안 Socket.IO 프로토콜에 영향을 준 호환성을 깨는 큰 변경은 두 번 있었습니다.

- Socket.IO v2는 **2017년 5월**에 출시되었습니다
- Socket.IO v3는 **2020년 11월**에 출시되었습니다

:::info

Socket.IO v4(2021년 3월 출시)는 Socket.IO 프로토콜을 변경하지 않았으므로 위 목록에 포함하지 않았습니다. Node.js 서버 API에서 호환성을 깨는 변경이 몇 가지 있었을 뿐입니다.

참고: [3.x에서 4.0으로 마이그레이션하기](../categories/07-Migrations/migrating-from-3-to-4.md)

:::

## 주요 이정표 {#important-milestones}

위에 나열한 호환성을 깨는 변경 외에 최근 Socket.IO의 주요 변경 사항은 다음과 같습니다.

| 버전                | 날짜          | 설명                                                                                                     |
|---------------------|---------------|----------------------------------------------------------------------------------------------------------|
| [`4.7.0`](4.7.0.md) | 2023년 6월    | WebTransport 지원                                                                                        |
| [`4.6.0`](4.6.0.md) | 2023년 2월    | [연결 상태 복구](../categories/01-Documentation/connection-state-recovery.md) 도입                       |
| `4.4.0`             | 2021년 11월   | [uWebSockets.js](../categories/02-Server/server-installation.md#usage-with-uwebsockets) 지원             |
| `4.1.0`             | 2021년 5월    | [`serverSideEmit()`](../categories/02-Server/server-instance.md#serversideemit) 도입                     |
| `4.0.0`             | 2021년 3월    | [TypeScript](https://www.typescriptlang.org/)로 재작성                                                   |

## 버전별 사용 현황 {#version-usage}

2026년 10월 기준:

`socket.io` 패키지

<ThemedImage
  alt="버전별 서버 다운로드 수"
  sources={{
    light: useBaseUrl('/images/server-downloads-per-version-20261001.png'),
    dark: useBaseUrl('/images/server-downloads-per-version-dark-20261001.png'),
  }}
/>


`socket.io-client` 패키지

<ThemedImage
  alt="버전별 클라이언트 다운로드 수"
  sources={{
    light: useBaseUrl('/images/client-downloads-per-version-20261001.png'),
    dark: useBaseUrl('/images/client-downloads-per-version-dark-20261001.png'),
  }}
/>
