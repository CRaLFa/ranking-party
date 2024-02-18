<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

type Data = {
  [key: string]: string | {
    [key: string]: string | number
  }
}[]

const data = ref<Data>([])
const editing = ref(false)
const member = ref('A')
const showConfirm = ref(false)
const succeeded = ref(false)
const showResult = ref(false)

const resultMsg = computed(() => succeeded ? '登録しました。' : '登録に失敗しました。')

const fetchData = async () => {
  const response = await fetch(`${import.meta.env.VITE_HOST}/data`)
  data.value = await response.json()
  scrollToTop()
}

const startEdit = () => {
  editing.value = true
  fetchData()
}

const cancelEdit = () => {
  editing.value = false
  fetchData()
}

const update = async () => {
  showConfirm.value = false

  const postData = {
    member: member.value,
    items: data.value.map((item) => ({
      1: item[member.value][1],
      2: item[member.value][2],
      3: item[member.value][3],
    })),
    voted: data.value.map((item) => {
      const voted = item[member.value]['voted']
      return voted ? parseInt(voted, 10) : 0
    }),
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_HOST}/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    })
    const result = await response.json()
    succeeded.value = result.succeeded
    showResult.value = true
  } catch (e) {
    console.error(e)
    succeeded.value = false
    showResult.value = true
  }
}

const closeResult = () => {
  showResult.value = false

  if (succeeded.value) {
    editing.value = false
    scrollToTop()
  }
}

const scrollToTop = () => setTimeout(() => window.scroll({
  top: 0,
  behavior: 'smooth'
}), 250)

onMounted(() => setTimeout(fetchData, 250))
</script>

<template>
  <v-app-bar color="grey-darken-3">
    <v-app-bar-title class="text-white text-h4 font-weight-bold">
      ランキングパーティー
    </v-app-bar-title>
  </v-app-bar>

  <v-container>
    <v-row class="justify-center">
      <v-col cols="8" class="mt-4 mb-4">
        <v-btn
          color="green-lighten-1"
          prepend-icon="mdi-square-edit-outline"
          block
          class="text-h6 rounded-xl"
          v-if="!editing"
          @click="startEdit"
        >
          編集
        </v-btn>
        <v-btn
          color="red"
          prepend-icon="mdi-cancel"
          block
          class="text-h6 rounded-xl"
          v-else
          @click="cancelEdit"
        >
          キャンセル
        </v-btn>
      </v-col>
    </v-row>
    <v-row v-if="editing">
      <v-col cols="12">
        <v-switch
          v-model="member"
          false-value="A"
          true-value="B"
          inset
          :label="member === 'A' ? 'メンバーA' : 'メンバーB'"
        />
      </v-col>
    </v-row>
    <div v-for="(item, idx) in data" class="text-left">
      <v-row class="mt-4">
        <v-col cols="12">
          <p class="text-h5 bg-grey-darken-3 rounded-lg pa-2 pl-6">
            {{ idx + 1 }}. {{ item.theme }}
          </p>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6" class="pa-4">
          <p class="text-h6 bg-pink rounded-lg pa-1 pl-3 mb-2">
            メンバーA
          </p>
          <div v-if="editing">
            <v-radio-group v-model="data[idx]['B']['voted']">
              <div v-for="i in 3">
                <div v-if="member === 'A'">
                  <span class="text-h6">
                    {{ i }}位：
                  </span>
                  <v-text-field
                    v-model="data[idx]['A'][i]"
                    variant="underlined"
                    label="名称"
                  />
                </div>
                <div v-else>
                  <v-radio
                    :value="i"
                    :label="`${i}位：${data[idx]['A'][i]}`"
                    :disabled="data[idx]['A'][i].trim().length < 1"
                  />
                </div>
              </div>
            </v-radio-group>
          </div>
          <div v-else>
            <div v-for="i in 3">
              <p class="text-h6">
                {{ data[idx]['B']['voted'] === i ? '✅' : '☐️' }} {{ i }}位：{{ data[idx]['A'][i] }}
              </p>
            </div>
          </div>
        </v-col>
        <v-col cols="6" class="pa-4 mb-4">
          <p class="text-h6 bg-blue rounded-lg pa-1 pl-3 mb-2">
            メンバーB
          </p>
          <div v-if="editing">
            <v-radio-group v-model="data[idx]['A']['voted']">
              <div v-for="i in 3">
                <div v-if="member === 'B'">
                  <span class="text-h6">
                    {{ i }}位：
                  </span>
                  <v-text-field
                    v-model="data[idx]['B'][i]"
                    variant="underlined"
                    label="名称"
                  />
                </div>
                <div v-else>
                  <v-radio
                    :value="i"
                    :label="`${i}位：${data[idx]['B'][i]}`"
                    :disabled="data[idx]['B'][i].trim().length < 1"
                  />
                </div>
              </div>
            </v-radio-group>
          </div>
          <div v-else>
            <div v-for="i in 3">
              <p class="text-h6">
                {{ data[idx]['A']['voted'] === i ? '☑' : '☐️' }} {{ i }}位：{{ data[idx]['B'][i] }}
              </p>
            </div>
          </div>
        </v-col>
      </v-row>
    </div>
    <v-row class="justify-center">
      <v-col cols="8" class="mt-4 mb-4">
        <v-btn
          color="green-lighten-1"
          prepend-icon="mdi-upload"
          block
          class="text-h6 rounded-xl"
          v-if="editing"
          @click="showConfirm = true"
        >
          登録
        </v-btn>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog
    v-model="showConfirm"
    width="auto"
  >
    <v-card>
      <v-card-text>
        登録してよろしいですか?
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="update">
          OK
        </v-btn>
        <v-btn color="primary" @click="showConfirm = false">
          キャンセル
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog
    v-model="showResult"
    width="auto"
  >
    <v-card>
      <v-card-text>
        {{ resultMsg }}
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" block @click="closeResult">
          閉じる
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style lang="scss">
main {
  background-color: #e9e4c5;
}

.v-label {
  font-weight: bold;
}

.v-switch .v-label {
  font-size: 1.5rem;
}

.v-radio .v-label {
  font-size: 1.25rem;
}
</style>
