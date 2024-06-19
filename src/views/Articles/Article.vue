<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { EyeIcon, ChatBubbleBottomCenterIcon } from "@heroicons/vue/24/outline";
import Comment from "@/components/post/Comment.vue";
import { HeartIcon } from "@heroicons/vue/24/solid";
import { getTimeDifference } from "../../utils/formattingUtils";
import { CommentType } from "@/types";

const router = useRouter();

const article = {
  id: "1es3dar",
  img: "https://images.unsplash.com/photo-1503066211613-c17ebc9daef0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
  title: "東南亞的虎類保護工作",
  abstract:
    "虎是壯麗的生物，但由於棲息地喪失和盜獵等威脅，它們正面臨著危險。東南亞的保護組織一直在不懈努力保護這些宏偉的動物。這些努力包括建立保護區、反盜獵巡邏以及社區教育計劃，以提高人們對虎類保護重要性的認識。",
  contents: [
    `寮國博膠省——一隻老虎在籠子裡走來走去，痛苦地低吟著。另一隻在角落裡沉睡，還有一隻無神地盯著柵欄。
旁邊還有一個籠子，裡面也關著三隻老虎，後面還有三個籠子：一排小圍欄，每個都至少關著一隻老虎。它們多半都活不了多久。
這些老虎是金木棉集團(Kings Romans Group)的財產，該集團在此地經營著一家賭場、多家酒店、一個射擊場、一座鬥雞和鬥牛場、一個唐人街主題的購物中心，還有這個破舊的動物園。
十年前，這家總部位於香港的公司與泰國政府簽下租約，開始開發這片面積12平方英里（約合31平方公里）的土地。它位於博膠省西北部，與泰國隔湄公河相望，被稱為金三角經濟特區(Golden Triangle Special Economic Zone)。`,
    `
  這個免稅區的大多數生意都是由中國公民所有，員工大多來自中國，光顧這裡顧客絕大多數也是中國人。
  其中有許多來這裡，是為獲得在中國不容易找到的東西，包括用老虎等珍禽異獸製作的產品。
  
  環保人士堅稱，這座動物園實際上是一座飼養供屠殺的動物的農場，在許多方面扮演著重要的角色，比如延續非法野生動物貿易，與泰國其他類似機構交換老虎，以及非法屠殺動物以獲取它們的骨、肉等部位。
  老虎、熊、蛇和不計其數的其他動物被關在遍布東南亞的許多農場內，其中有不少屬於瀕危動物。經營者在野外非法捕捉動物，然後把它們偽裝成人工繁殖的動物，或就地養殖和非法出售。
  
  這些設施屬於一個走私行業的一環。有人估計，這個行業的利潤率只有全球毒品和軍火貿易，以及人口販賣可與之相比。
  
  記者最近訪問這座動物園時，發現這裡遊客寥寥。此外，被木板封上的商店、爛尾工程和很早以前留下的海報宣傳痕跡，也加重了這種鬼城一般的感覺。
  
  但金木棉的餐館依然提供著昂貴的熊掌、穿山甲（一種有鱗片的瀕危哺乳動物）菜品和煎虎肉，後者可以搭配虎酒，一種以穀物為基礎的調製飲品，其中有浸泡了數月的虎鞭、虎骨，或整副骨架。
`,
    `當一群外國人出現在金木棉最高檔的餐廳財神(God of Wealth)時，心存疑慮的餐廳老闆告訴他們的翻譯，「你們可以在這裡用餐，但不要點特製叢林菜單上的菜」，也就是提供野生動物菜品的菜單。
但這裡的員工給他們提供了20美元一小杯的虎酒，還給旁邊桌子上的顧客上了一隻熊掌。今年5月，《紐約時報》的攝影師到訪這家餐館時，曾點到45美元一盤的虎肉。`,
    `在附近，有六家珠寶店和藥店擺著標有天價的虎齒和虎爪，還有犀角雕、犀角鎊片、象皮和象牙。
「這個地方真的很亂，」來自倫敦的非營利機構環境調查署(Environmental Investigation Agency)的黛比·班克斯(Debbie Banks)說。「可以說什麼事都有可能發生。」
2015年，班克斯和她的同事以及非營利機構越南保護自然教育組織(Education for Nature-Vietnam)報告稱，金三角經濟特區在公開出售用大量受保護動物——包括老虎、豹、犀牛、熊和大象——製成的肉食、藥物和珠寶。
他們的報告促使寮國政府對這裡的一些企業進行了突擊檢查，在電視上播放了燒毀一些虎皮的畫面。但班克斯表示，自那次「裝樣子行動」之後，情況幾乎沒有任何改變。
除了這些關在籠子裡的動物，金木棉動物園看起來也跟特區其他地方一樣，像一個廢棄的地方。一名女子和她年幼的女兒走進來看熊。那些熊有不少顯示出囚禁導致的痛苦跡象，比如無法抑制地不停搖頭。園內找不到什麼工作人員。`,
  ],
  stats: { views: 1589, likes: 876 },
  comments: [
    {
      user: "DODO",
      content: "我很高興看到有人在拯救老虎！",
      postDate: "2023-09-02 14:30:00",
    },
    {
      user: "DODO",
      content: "8 8 8 8 阿！",
      postDate: "2023-09-02 14:30:00",
    },
    {
      user: "DODO",
      content: "吃葡萄不吃葡萄不吃葡萄敖土淘淘！",
      postDate: "2023-09-02 14:30:00",
    },
  ],
  postDate: "2023-09-02 14:30:00",
};

const commentsData = ref<CommentType[]>();
</script>

<template>
  <div class="bg-articles bg-no-repeat bg-cover bg-center w-full bg-fixed">
    <div class="absolute flex flex-col items-center top-52 left-1/2 -translate-x-1/2 font-Josefin tracking-widest">
      <h1 class="uppercase text-5xl font-bold">The beauty of nature</h1>
      <h3 class="italic text-xl mt-2">探索自然與保育之美</h3>
    </div>
    <div class="bg-white w-full mt-[90vh] py-12 px-4">
      <div class="mx-auto flex flex-col bg-white w-[62rem] translate-y-[-7rem] pt-28 px-5">
        <button @click="router.back()" class="self-start text-sm font-bold text-stone-800">
          上一頁
        </button>
        <div class="mt-12 border-2 border-stone-800 px-24 py-16 mb-20">
          <span class="font-bold text-sm text-stone-500">{{ article.postDate }}
            <span class="text-md">&nbsp;&nbsp;·&nbsp;&nbsp;</span>
            {{ getTimeDifference(article.postDate) }} 以前
          </span>
          <h1 class="my-8 text-4xl text-stone-600">{{ article.title }}</h1>
          <p class="font-bold italic text-sm text-stone-900">
            {{ article.abstract }}
          </p>
          <div class="mt-4 max-h-[32.5rem] overflow-hidden">
            <img :src="article.img" class="w-full filter grayscale-[10%]" />
          </div>
          <p v-for="content in article.contents" class="text-stone-800 mt-6">
            {{ content }}
          </p>
          <div class="border-b-[.0938rem] border-gray-300 my-4"></div>
          <div class="flex justify-between">
            <div class="flex gap-8">
              <span class="flex gap-1">
                <EyeIcon class="w-4" />{{ article.stats.views }}
              </span>
              <span class="flex gap-1">
                <ChatBubbleBottomCenterIcon class="w-4" />{{
                  article.comments.length
                }}
              </span>
            </div>
            <span class="group flex gap-1 hover:cursor-pointer focus:text-red-500 transition-all" tabindex="0">
              <HeartIcon class="w-4 group-focus:scale-[125%] transition-all duration-300" />{{ article.stats.likes }}
            </span>
          </div>
        </div>
        <Comment :post-id="'000000'" :comments-data="commentsData ? commentsData : []" />
      </div>
    </div>
  </div>
</template>
