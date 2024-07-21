<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  //
  properties: {
    type: Object,
    required: true
  }
})
const emit = defineEmits(['openPhoto'])

const properties = ref(props.properties)
</script>

<template>
  <div
    class="flex w-96 cursor-pointer flex-col rounded-sm border-2 border-b border-t-8 border-stone-600 bg-white shadow-md shadow-gray-800 transition-all duration-700 ease-in hover:scale-105 xl:flex-row"
  >
    <img
      :src="properties.url"
      alt="animal"
      class="w-full rounded-sm rounded-r-none  xl:w-72 xl:shadow-xl"
    />
    <div
      class="relative flex w-full flex-1 flex-col items-center justify-between rounded-r-sm border-l-0 p-4 xl:max-w-24"
    >
      <div class="my-2 flex size-full flex-col items-center justify-between overflow-hidden">
        <div class="flex size-full w-full flex-col items-center justify-around gap-2 xl:items-start xl:gap-0 ">
          <p
            class="line-clamp-2 max-h-20 overflow-hidden text-center text-3xl font-bold leading-6 xl:max-h-28 xl:text-xl xl:[writing-mode:vertical-lr]"
          >
            {{ properties.title }}
          </p>
          <p class="w-full overflow-hidden truncate text-center text-base text-gray-500 xl:text-xs">
            {{ properties.location }}
          </p>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="mt-2 w-12 text-stone-700 transition-all duration-500 hover:scale-105 hover:text-blue-700 xl:mt-0 xl:w-8"
          @click="emit('openPhoto', properties._id)"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </div>
    </div>
  </div>
</template>
