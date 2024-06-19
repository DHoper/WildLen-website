<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { DialogType } from '../../types';

const props = defineProps({
    dialogData: {
        type: Object as () => DialogType,
        required: true,
    }
});

const emit = defineEmits(["closePopup"]);

onMounted(() => {
    document.body.style.overflow = 'hidden';
});

onUnmounted(() => {
    document.body.style.overflow = 'auto';
});
</script>

<template>
    <div class="bg-stone-700 bg-opacity-80 fixed top-0 left-0 w-full h-full z-50 flex justify-center items-center">
        <div class="p-1 w-80 2xl:w-96 -mt-20" :class="props.dialogData.warringStyle ? 'bg-red-500' : 'bg-white'">
            <div class="text-white flex flex-col justify-around items-center py-10 2xl:py-16 gap-6"
                :class="props.dialogData.warringStyle ? 'bg-red-500' : 'bg-stone-600'">
                <h3 class="text-2xl tracking-widest">{{
                    props.dialogData.title }}</h3>
                <p>{{ props.dialogData.content }}</p>
                <div class="flex gap-4 w-full px-8">
                    <button @click="emit('closePopup', true)"
                        class="flex-1 text-lg border-2 border-white p-2 hover:bg-white transition-all duration-300"
                        :class="props.dialogData.warringStyle ? 'bg-red-500 hover:text-red-500' : 'hover:text-stone-600'">確認</button>
                    <button v-if="props.dialogData.cancelButton" @click="emit('closePopup', false)"
                        class="flex-1 text-lg  border-2 border-white p-2 hover:bg-white bg-white text-stone-600 transition-all duration-300"
                        :class="props.dialogData.warringStyle ? 'hover:text-red-500' : 'hover:font-bold'">取消</button>
                </div>
            </div>
        </div>
    </div>
</template>