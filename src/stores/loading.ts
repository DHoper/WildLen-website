import { defineStore } from "pinia";
import { ref } from "vue";

export const useLoadingStore = defineStore("loading", () => {
  const isLoading = ref<boolean>(false);
  const isInRequest = ref<boolean>(false);
  const isCountingSeconds = ref<boolean>(false);

  const getLoadingStatus = () => isLoading.value;

  function setInRequest(status: boolean) {
    isInRequest.value = status;
  }

  function setLoadingStatus(status: boolean) {
    if (status) {
      isLoading.value = status;
    } else {
      if (!isInRequest.value && !isCountingSeconds.value) {
        isLoading.value = status;
      }
    }
  }
  function setIsCountingSeconds(status: boolean) {
    if (status) {
      isCountingSeconds.value = status;
    } else {
      setTimeout(() => {
        isCountingSeconds.value = status;
        setLoadingStatus(false);
      }, 1000);
    }
  }

  return {
    getLoadingStatus,
    setLoadingStatus,
    setInRequest,
    setIsCountingSeconds,
  };
});
