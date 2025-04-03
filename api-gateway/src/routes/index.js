import express from "express";
import authRoutes from "./auth.routes";
import conversationRoutes from "./conversation.routes";

const router = express.Router();

const defaultRoutes = [
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/conversations",
    route: conversationRoutes,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
