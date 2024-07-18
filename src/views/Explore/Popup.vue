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
    class="transition-all bg-white duration-700 ease-in rounded-sm shadow-md shadow-gray-800 cursor-pointer hover:scale-105 border-t-8 border-2 border-b border-stone-600 flex w-72 xl:w-96"
  >
    <img
      :src="properties.url"
      alt="animal"
      class="w-52 xl:w-72 rounded-sm rounded-r-none shadow-xl"
    />
    <div
      class="relative rounded-r-sm border-l-0 flex flex-col justify-between items-center flex-1 p-4 max-w-[6rem]"
    >
      <div class="my-2 w-full h-full overflow-hidden flex flex-col justify-between items-center">
        <div class="h-full flex flex-col justify-around items-center">
          <p
            class="text-xl font-bold [writing-mode:vertical-lr] text-center leading-6 line-clamp-2 xl:max-h-28 max-h-20 overflow-hidden"
          >
            {{ properties.title }}
          </p>
          <p class="text-gray-500 text-center text-xs truncate">
            {{ properties.location }}
          </p>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-8 text-stone-700 hover:text-blue-700 hover:scale-105 transition-all duration-500"
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
