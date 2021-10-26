import { createRouter, createWebHistory } from "vue-router";
import Auctioneer from "../views/Auctioneer.vue";
import Bidder from "../views/Bidder.vue";

const routes = [
  {
    path: "/",
    name: "Auctioneer",
    component: Auctioneer,
  },
  {
    path: "/bidder",
    name: "Bidder",
    component: Bidder,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
