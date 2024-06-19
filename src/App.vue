<script setup lang="ts">
import Loading from "@/components/utils/Loading.vue";
import TheHeader from "@/components/layout/TheHeader.vue";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const showHeader = computed(() => {
  return !["Error", "NotFound", "Login", "Register", "Home"].includes(
    route.name as string
  );
});
const headerKey = ref();

watch(
  () => route.name,
  () => {
    headerKey.value = route.name;
  }
);
</script>

<template>
  <Loading />
  <div class="h-screen flex flex-col">
    <TheHeader :key="headerKey" v-if="showHeader" />
    <router-view></router-view>
  </div>
</template>