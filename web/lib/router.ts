import * as VueRouter from "vue-router";
import Home from "../components/Home.vue";
import Level from "../components/Level.vue";
import NotFound from "../components/NotFound.vue";

// TODO(albrow): Set up routes.
export const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(),
  routes: [
    { path: "/", component: Home },
    { path: "/level/:levelNumber", component: Level },
    { path: "/:pathMatch(.*)*", component: NotFound },
  ],
});
