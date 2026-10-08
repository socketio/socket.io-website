---
title: Client testing
sidebar_position: 6
slug: /client-testing/
---

Unlike [server-side testing](../02-Server/testing.md) which uses integration tests, we recommend testing client-side code in isolation.

Instead of connecting to a real Socket.IO server, you can wrap the Socket.IO client in a small module and replace it with a fake implementation in your tests.

This keeps your tests fast and deterministic.

## Example

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

For testing, we create a small fake Socket.IO client based on Jest mocks. It implements only the methods used by the order service, records emitted events, and lets us manually trigger server-sent events:

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

Reference: https://jestjs.io/docs/mock-functions

This pattern works with any front-end framework, including React, Vue, Angular, Svelte, and others.

## Example with React and `@testing-library/react`

The following example injects the order service into a React component, so the component can be tested without opening a real Socket.IO connection.

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

Documentation: https://testing-library.com/docs/react-testing-library/intro

## Example with Vue and `@vue/test-utils`

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

Reference: https://vuejs.org/guide/scaling-up/testing.html#component-testing
