<script setup lang="ts">
import Loading from '@/components/utils/Loading.vue'
import TheHeader from '@/components/layout/TheHeader.vue'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from './stores/user'

const route = useRoute()
const userStore = useUserStore()
const showHeader = computed(() => {
  return !['Error', 'NotFound', 'Login', 'Register', 'Home'].includes(route.name as string)
})
const headerKey = ref()

watch(
  () => route.name,
  () => {
    headerKey.value = route.name
  }
)
</script>

<template>
  <Loading />
  <div v-if="userStore.isLoginCheck" class="h-screen w-screen flex flex-col overflow-auto">
    <TheHeader :key="headerKey" v-if="showHeader" />
    <router-view></router-view>
  </div>
</template>
