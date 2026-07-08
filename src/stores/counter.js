import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }
  return { count, doubleCount, increment }
})

// 主题管理 store
export const useThemeStore = defineStore('theme', () => {
  const isDarkMode = ref(true) // 默认暗色

  // 从 localStorage 读取保存的主题
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark'
  }

  // 切换主题
  function toggleTheme() {
    isDarkMode.value = !isDarkMode.value
    localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
    updateDocumentTheme()
  }

  // 更新文档主题类
  function updateDocumentTheme() {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 初始化主题
  updateDocumentTheme()

  return { isDarkMode, toggleTheme }
})
