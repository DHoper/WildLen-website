<script setup lang="ts">
import PhotoPost from './Gallery/PhotoPost.vue';
import {
    PlusCircleIcon,
} from '@heroicons/vue/24/solid';
import { ref, onMounted } from 'vue';
import { getPostsData } from '@/api/photoPost/photoPost.js';
import { useLoadingStore } from '../stores/loading';
import { PhotoPostType } from '../types';
import { formatDateTime } from '../utils/formattingUtils';

const galleryDataset = ref<PhotoPostType[]>();
const fetchData = async () => {

    const response = await getPostsData();
    galleryDataset.value = response.value;
};

onMounted(async () => {
    const loadingStore = useLoadingStore();  //設置loading動畫頁
    loadingStore.setLoadingStatus(true);
    loadingStore.setInRequest(true);

    await fetchData();
    rightBlock.value?.addEventListener('scroll', handleScroll);

    loadingStore.setInRequest(false);
    loadingStore.setLoadingStatus(false);
});

enum AddBlock {
    Block = 'block',
    Icon = 'icon'
}

const addBlock = ref<AddBlock>(AddBlock.Icon);
const rightBlock = ref<HTMLElement | null>(null);

//處理發布按鈕 當頁面置底時隱藏
function handleScroll() {
    if (rightBlock.value) {
        const scrollY = rightBlock.value.scrollTop;
        const clientHeight = rightBlock.value.clientHeight;
        const scrollHeight = rightBlock.value.scrollHeight;

        if (scrollY + clientHeight + 200 >= scrollHeight) {
            addBlock.value = AddBlock.Block;
        } else {
            addBlock.value = AddBlock.Icon;
        }
    }
}

//photoPost組件邏輯
const photoPostShow = ref(false);
const photoPostID = ref<string>('');

function openPhoto(id: string) {
    photoPostID.value = id;
    photoPostShow.value = true;
}
function closePhoto() {
    photoPostShow.value = false;
    photoPostID.value = '';
}
</script>

<template>
    <div class="overflow-hidden flex flex-col relative">
        <div v-if="galleryDataset" class="flex relative overflow-hidden bg-stone-600">
            <div
                class="flex flex-col items-center justify-center bg-gallery bg-no-repeat bg-cover bg-center basis-[30%] text-white h-full">
                <span
                    class="text-5xl 2xl:text-6xl [writing-mode:vertical-lr] mt-auto tracking-[1rem] font-bold">偉大的世界</span>
                <div
                    class="my-auto text-lg 2xl:text-xl text-[#f9f9f9c8] flex flex-col items-center gap-4 tracking-[.8rem]">
                    <span>還有許多</span>
                    <span>你未曾探尋之地</span>
                </div>
            </div>
            <div class="basis-[70%] h-full">
                <div ref="rightBlock" class="h-full flex flex-wrap overflow-y-auto overflow-x-hidden">
                    <div v-for="galleryData in galleryDataset"
                        class="relative basis-1/4 2xl:basis-1/5 group cursor-pointer hover:z-10 border-4 border-stone-100">
                        <img class="scale-[101%] group-hover:scale-105 transition-all ease-in duration-700"
                            :src="galleryData.images[0].url" />
                        <div
                            class="absolute top-0 left-0 w-full h-full scale-[101%] bg-black bg-opacity-0 group-hover:bg-opacity-30 group-hover:scale-105 transition-all ease-in duration-700">
                        </div>
                        <div @click="openPhoto(galleryData._id!)"
                            class="flex flex-col justify-between absolute top-0 left-0 w-full h-full scale-[101%] text-white px-4 pt-3 pb-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:scale-105 group-hover:translate-x-0 transition-all duration-700 ease-in"
                            tabindex="-1">
                            <div v-if="galleryData.createdAt">
                                <p class="text-xs 2xl:text-base text-[#fdfdfdda]">
                                    {{ formatDateTime(galleryData.createdAt) }}
                                </p>
                                <h3 class="text-xl 2xl:text-3xl  my-2 text-[#fdfdfdda]">
                                    {{ galleryData.title }}
                                </h3>
                                <p class="text-xs 2xl:text-base text-[#fdfdfdda]">
                                    {{ galleryData.location }}
                                </p>
                            </div>
                            <div>
                                <div class="border 2xl:mb-2 border-[#fdfdfdb7]"></div>
                                <div class="flex items-center justify-between h-7">
                                    <span class="button text-sm 2xl:text-base tracking-widest">查看更多</span>
                                    <img src="/assets/svg/long-arrow.svg" alt="long-arrow"
                                        class="w-14 h-10 0 -translate-x-1/2 group-hover:translate-x-0 transition-all duration-1000 ease-linear">
                                </div>
                            </div>
                        </div>
                    </div>
                    <router-link class="flex-grow" v-if="addBlock === 'block'" :to="{ name: 'CreatePost' }">
                        <a
                            class="w-full h-full py-8 2xl:py-10 flex justify-center items-center text-xl 2xl:text-3xl font-bold bg-gray-100 text-stone-700 cursor-pointer hover:text-stone-800 hover:scale-105 hover:bg-white hover:z-10 transition-all duration-[1150ms]">
                            添加更多發現
                        </a>
                    </router-link>
                    <router-link v-else :to="{ name: 'CreatePost' }">
                        <PlusCircleIcon
                            class="fixed bottom-12 right-12 w-16 h-16 2xl:w-20 2xl:h-20 z-10 text-white cursor-pointer hover:scale-110 hover:text-green-400 transition-all ease-in" />
                    </router-link>
                </div>
            </div>
            <PhotoPost v-if="photoPostShow" :id="photoPostID" @close="closePhoto" />
        </div>
    </div>
</template>