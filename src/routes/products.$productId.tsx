import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy URL: /products/:productId — permanently redirect to /pneu/:productId
export const Route = createFileRoute("/products/$productId")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/pneu/$productId",
      params: { productId: params.productId },
      replace: true,
    });
  },
  component: () => null,
});
