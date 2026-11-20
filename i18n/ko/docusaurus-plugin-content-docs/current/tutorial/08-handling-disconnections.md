---
title: 튜토리얼 - 연결 끊김 처리하기
sidebar_label: 연결 끊김 처리하기
slug: handling-disconnections
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 연결 끊김 처리하기

이제 Socket.IO의 중요한 특성 두 가지를 짚고 넘어가겠습니다.

1. Socket.IO 클라이언트가 항상 연결되어 있는 것은 아닙니다
2. Socket.IO 서버는 이벤트를 저장하지 않습니다

:::caution

네트워크가 안정적이더라도 연결을 영원히 유지할 수는 없습니다.

:::

따라서 애플리케이션은 연결이 잠시 끊긴 뒤에 클라이언트의 로컬 상태를 서버의 전역 상태와 동기화할 수 있어야 합니다.

:::note

Socket.IO 클라이언트는 잠시 뒤 자동으로 재연결을 시도합니다. 하지만 연결이 끊겨 있는 동안 놓친 이벤트는 그 클라이언트 입장에서는 사실상 사라집니다.

:::

이 튜토리얼의 채팅 앱에서는 연결이 끊긴 클라이언트가 일부 메시지를 놓칠 수 있습니다.

<ThemedImage
  alt="연결이 끊긴 클라이언트는 'chat message' 이벤트를 받지 못합니다"
  sources={{
    light: useBaseUrl('/images/tutorial/disconnected.png'),
    dark: useBaseUrl('/images/tutorial/disconnected-dark.png'),
  }}
/>

다음 단계에서 이 문제를 개선하는 방법을 살펴보겠습니다.
