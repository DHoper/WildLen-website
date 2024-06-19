import { defineStore } from "pinia";
import { ref } from "vue";

export const useErrorStore = defineStore("error", () => {
  const data = ref();
  const setData = (errorData: any) => {
    data.value = errorData;
  };

  return {
    data,
    setData,
  };
});
