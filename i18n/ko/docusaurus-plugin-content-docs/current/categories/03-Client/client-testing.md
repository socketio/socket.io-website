---
title: 클라이언트 테스트
sidebar_position: 6
slug: /client-testing/
---

통합 테스트를 쓰는 [서버 측 테스트](../02-Server/testing.md)와 달리 클라이언트 측 코드는 격리해서 테스트하기를 권장합니다.

실제 Socket.IO 서버에 연결하는 대신 Socket.IO 클라이언트를 작은 모듈로 감싸고, 테스트에서는 이 클라이언트를 가짜 구현으로 바꿀 수 있습니다.

이렇게 하면 테스트가 빠르고 결과도 항상 같습니다.

## 예시 {#example}

```js title="socket.js"
import { io } from "socket.io-client";

export function createSocket() {
  return io("https://example.com");
}
```

```js title="createOrderService.js"
export function createOrderService(socket) {
  return {
    createOrder(order) {
      socket.emit("order:create", order);
    },

    onOrderCreated(listener) {
      socket.on("order:created", listener);

      return () => {
        socket.off("order:created", listener);
      };
    },
  };
}
```

테스트용으로 Jest mock 함수를 활용해 작은 가짜 Socket.IO 클라이언트를 만듭니다. 이 클라이언트는 주문 서비스가 사용하는 메서드만 구현하고 보낸 이벤트를 기록합니다. 서버가 보내는 이벤트를 테스트에서 직접 발생시킬 수도 있습니다.

```js title="test-utils/createFakeSocket.js"
export function createFakeSocket() {
  const listeners = new Map();

  return {
    emit: jest.fn(),

    on(event, listener) {
      listeners.set(event, listener);
    },

    off(event, listener) {
      if (listeners.get(event) === listener) {
        listeners.delete(event);
      }
    },

    trigger(event, ...args) {
      const listener = listeners.get(event);

      if (listener) {
        listener(...args);
      }
    },
  };
}
```

참고: https://jestjs.io/docs/mock-functions

이 패턴은 React, Vue, Angular, Svelte 등 어떤 프런트엔드 프레임워크에서도 쓸 수 있습니다.

## React와 `@testing-library/react` 예시 {#example-with-react-and-testing-libraryreact}

다음 예시는 주문 서비스를 React 컴포넌트에 주입해서 실제 Socket.IO 연결을 열지 않고도 컴포넌트를 테스트할 수 있게 합니다.

```jsx title="OrderForm.jsx"
import React, { useEffect, useState } from "react";

export function OrderForm({ orderService }) {
  const [productName, setProductName] = useState("");
  const [createdOrder, setCreatedOrder] = useState(null);

  useEffect(() => {
    return orderService.onOrderCreated((order) => {
      setCreatedOrder(order);
    });
  }, [orderService]);

  function handleSubmit(event) {
    event.preventDefault();

    orderService.createOrder({
      productName,
    });

    setProductName("");
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="product-name">Product name</label>
        <input
          id="product-name"
          value={productName}
          onChange={(event) => setProductName(event.target.value)}
        />

        <button type="submit">Create order</button>
      </form>

      {createdOrder && (
        <p>
          Order created: <strong>{createdOrder.productName}</strong>
        </p>
      )}
    </div>
  );
}
```

```jsx title="OrderForm.test.jsx"
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { OrderForm } from "./OrderForm";
import { createOrderService } from "./createOrderService";
import { createFakeSocket } from "../test-utils/createFakeSocket";

test("creates an order", () => {
  const socket = createFakeSocket();
  const orderService = createOrderService(socket);

  render(<OrderForm orderService={orderService} />);

  fireEvent.change(screen.getByLabelText("Product name"), {
    target: { value: "Laptop" },
  });

  fireEvent.click(screen.getByRole("button", { name: "Create order" }));

  expect(socket.emit).toHaveBeenCalledWith("order:create", {
    productName: "Laptop",
  });

  expect(screen.getByLabelText("Product name")).toHaveValue("");
});

test("renders an order created by the server", async () => {
  const socket = createFakeSocket();
  const orderService = createOrderService(socket);

  render(<OrderForm orderService={orderService} />);

  await act(async () => {
    socket.trigger("order:created", {
      productName: "Laptop",
    });
  });

  expect(screen.getByText("Order created:")).toBeInTheDocument();
  expect(screen.getByText("Laptop")).toBeInTheDocument();
});
```

문서: https://testing-library.com/docs/react-testing-library/intro

## Vue와 `@vue/test-utils` 예시 {#example-with-vue-and-vuetest-utils}

```html title="OrderForm.vue"
<script setup>
  import { onMounted, onUnmounted, ref } from "vue";

  const { orderService } = defineProps({
    orderService: {
      type: Object,
      required: true,
    },
  });

  const productName = ref("");
  const createdOrder = ref(null);

  let unsubscribe;

  onMounted(() => {
    unsubscribe = orderService.onOrderCreated((order) => {
      createdOrder.value = order;
    });
  });

  onUnmounted(() => {
    unsubscribe?.();
  });

  function createOrder() {
    orderService.createOrder({
      productName: productName.value,
    });

    productName.value = "";
  }
</script>

<template>
  <form @submit.prevent="createOrder">
    <label for="product-name">Product name</label>
    <input id="product-name" v-model="productName" />

    <button type="submit">Create order</button>
  </form>

  <p v-if="createdOrder">
    Order created: <strong>{{ createdOrder.productName }}</strong>
  </p>
</template>
```

```js title="OrderForm.test.js"
import { mount } from "@vue/test-utils";
import OrderForm from "./OrderForm.vue";
import { createOrderService } from "./createOrderService";
import { createFakeSocket } from "../test-utils/createFakeSocket";

test("creates an order", async () => {
  const socket = createFakeSocket();
  const orderService = createOrderService(socket);

  const wrapper = mount(OrderForm, {
    props: {
      orderService,
    },
  });

  await wrapper.get("#product-name").setValue("Laptop");
  await wrapper.get("form").trigger("submit");

  expect(socket.emit).toHaveBeenCalledWith("order:create", {
    productName: "Laptop",
  });

  expect(wrapper.get("#product-name").element.value).toBe("");
});

test("renders an order created by the server", async () => {
  const socket = createFakeSocket();
  const orderService = createOrderService(socket);

  const wrapper = mount(OrderForm, {
    props: {
      orderService,
    },
  });

  socket.trigger("order:created", {
    productName: "Laptop",
  });

  await wrapper.vm.$nextTick();

  expect(wrapper.text()).toContain("Order created:");
  expect(wrapper.text()).toContain("Laptop");
});
```

참고: https://vuejs.org/guide/scaling-up/testing.html#component-testing
