<template>
  <!-- 锁定界面 -->
  <div v-if="isLocked && !isUnlocked" class="lock-container">
    <div class="lock-box">
      <h1>访问验证</h1>
      <p class="lock-description">此导航站已启用访问保护</p>
      <form @submit.prevent="handleUnlock">
        <div class="form-group">
          <label for="unlock-password">请输入访问密钥</label>
          <input
            id="unlock-password"
            type="password"
            v-model="unlockPassword"
            placeholder="请输入访问密钥"
            required
            class="form-input"
          />
        </div>
        <button type="submit" class="unlock-btn" :disabled="unlocking">
          {{ unlocking ? '验证中...' : '进入导航' }}
        </button>
      </form>
      <div v-if="unlockError" class="error-message">{{ unlockError }}</div>
    </div>
  </div>

  <!-- 导航主界面 -->
  <div v-else class="page" :class="{ noise: true }">
    <!-- 顶部导航栏 -->
    <header class="topbar">
      <div class="topbar-inner">
        <a href="/" class="brand">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="brand-icon"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          <span>首页</span>
        </a>
        <nav class="topbar-nav">
          <button class="theme-btn" @click="themeStore.toggleTheme" :title="themeStore.isDarkMode ? '切换亮色' : '切换暗色'">
            <svg v-if="themeStore.isDarkMode" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          </button>
        </nav>
      </div>
    </header>

    <!-- 主内容 -->
    <main class="main bg-grid">
      <div class="container">
        <!-- 搜索栏 -->
        <form class="search-box" :action="searchEngines[selectedEngine].url" target="_blank">
          <div class="search-bar">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              type="text"
              :placeholder="searchEngines[selectedEngine].placeholder"
              class="search-input"
              name="q"
              autocomplete="off"
            />
            <div class="engine-switch">
              <img :src="searchEngines[selectedEngine].icon" class="engine-icon" :alt="selectedEngine" />
              <select v-model="selectedEngine" class="engine-select">
                <option value="google">Google</option>
                <option value="baidu">百度</option>
                <option value="bing">Bing</option>
                <option value="duckduckgo">DuckDuckGo</option>
              </select>
            </div>
          </div>
        </form>

        <!-- 加载状态 -->
        <div v-if="loading" class="status-box">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="status-box">
          <p>{{ error }}</p>
          <button @click="fetchCategories" class="retry-btn">重试</button>
        </div>

        <!-- 所有网站平铺 -->
        <div v-else class="card-grid">
          <template v-for="cat in categories" :key="cat.id">
            <a
              v-for="site in cat.sites"
              :key="site.id"
              :href="site.url"
              target="_blank"
              rel="noopener noreferrer"
              class="card card-glow"
            >
              <div class="card-icon">
                <img :src="site.icon" :alt="site.name" @error="handleImageError" />
              </div>
              <div class="card-body">
                <h3 class="card-name">{{ site.name }}</h3>
                <p class="card-desc">{{ site.description }}</p>
              </div>
            </a>
          </template>
        </div>

        <!-- 底部 -->
        <footer class="footer">
          <p>点击链接在新标签页打开 · 由 Vercel 驱动</p>
        </footer>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useNavigation } from '@/apis/useNavigation.js'
import { useThemeStore } from '@/stores/counter.js'
import googleLogo from '@/assets/goolge.png'
import baiduLogo from '@/assets/baidu.png'
import bingLogo from '@/assets/bing.png'
import duckLogo from '@/assets/duck.png'

const { categories, defaultSearchEngine, loading, error, fetchCategories } = useNavigation()
const themeStore = useThemeStore()

const selectedEngine = ref('bing')

// 锁定
const isLocked = ref(false)
const isUnlocked = ref(false)
const unlockPassword = ref('')
const unlocking = ref(false)
const unlockError = ref('')

const searchEngines = {
  google: { url: 'https://www.google.com/search?q=', icon: googleLogo, placeholder: 'Google 搜索…' },
  baidu: { url: 'https://www.baidu.com/s?wd=', icon: baiduLogo, placeholder: '百度一下…' },
  bing: { url: 'https://www.bing.com/search?q=', icon: bingLogo, placeholder: 'Bing 搜索…' },
  duckduckgo: { url: 'https://duckduckgo.com/?q=', icon: duckLogo, placeholder: 'DuckDuckGo 搜索…' },
}

const checkLockStatus = () => {
  const openLock = import.meta.env.VITE_OPEN_LOCK
  if (openLock && openLock.trim() !== '') {
    isLocked.value = true
    if (localStorage.getItem('nav_unlocked') === 'true') isUnlocked.value = true
  } else {
    isLocked.value = false
    isUnlocked.value = true
  }
}

const handleUnlock = async () => {
  unlocking.value = true
  unlockError.value = ''
  try {
    const res = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: unlockPassword.value }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error || '密钥错误')
    isUnlocked.value = true
    localStorage.setItem('nav_unlocked', 'true')
    unlockPassword.value = ''
  } catch (e) {
    unlockError.value = e.message
  } finally {
    unlocking.value = false
  }
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
  e.target.onerror = null
}

const getFavicon = (url) => {
  try {
    const host = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${host}&sz=32`
  } catch {
    return '/favicon.ico'
  }
}

onMounted(async () => {
  checkLockStatus()
  await fetchCategories()
  selectedEngine.value = defaultSearchEngine.value
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* ===== 锁定界面 ===== */
.lock-container {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  z-index: 9999;
}
.lock-box {
  background: var(--color-surface);
  padding: 40px;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  width: 100%;
  max-width: 400px;
  text-align: center;
}
.lock-box h1 { color: var(--color-text); margin-bottom: 8px; font-size: 24px; font-weight: 700; }
.lock-description { color: var(--color-text-muted); margin-bottom: 28px; font-size: 15px; }
.form-group { margin-bottom: 18px; text-align: left; }
.form-group label { display: block; margin-bottom: 6px; color: var(--color-text); font-size: 13px; font-weight: 500; }
.form-input {
  width: 100%;
  padding: 12px 16px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  color: var(--color-text);
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
}
.form-input:focus { border-color: var(--color-accent); }
.unlock-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-2));
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
}
.unlock-btn:hover:not(:disabled) { transform: translateY(-1px); }
.unlock-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.error-message {
  margin-top: 14px;
  padding: 12px;
  background: rgba(255,0,110,0.1);
  border: 1px solid rgba(255,0,110,0.3);
  border-radius: 8px;
  color: var(--color-accent-2);
  font-size: 13px;
}

/* ===== 页面 ===== */
.page {
  min-height: 100vh;
  background: var(--color-bg);
  color: var(--color-text);
}

/* ===== 顶部导航 ===== */
.topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(20px);
  background: rgba(10,10,10,0.8);
  border-bottom: 1px solid var(--color-border);
}
html:not(.dark) .topbar { background: rgba(250,250,250,0.85); }
.topbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text);
  font-weight: 700;
  font-size: 16px;
}
.brand-icon {
  width: 20px;
  height: 20px;
  color: var(--color-accent);
  transition: transform 0.3s;
}
.brand:hover .brand-icon { transform: rotate(12deg); }
.topbar-nav {
  display: flex;
  align-items: center;
  gap: 4px;
}
.nav-link {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  color: var(--color-text-muted);
  transition: color 0.2s, background 0.2s;
}
.nav-link:hover { color: var(--color-text); background: rgba(255,255,255,0.05); }
.theme-btn {
  margin-left: 4px;
  padding: 8px;
  border-radius: 999px;
  border: none;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.2s, background 0.2s;
}
.theme-btn:hover { color: var(--color-text); background: rgba(255,255,255,0.05); }

/* ===== 主体 ===== */
.main {
  min-height: calc(100vh - 56px);
}
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 48px 24px 64px;
}

/* ===== 搜索 ===== */
.search-box {
  max-width: 560px;
  margin: 0 auto 56px;
}
.search-bar {
  display: flex;
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.search-bar:focus-within {
  border-color: rgba(255,107,53,0.4);
  box-shadow: 0 0 0 3px rgba(255,107,53,0.08);
}
.search-icon {
  color: var(--color-text-muted);
  margin-left: 16px;
  flex-shrink: 0;
}
.search-input {
  flex: 1;
  padding: 14px 14px;
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-text);
  font-size: 15px;
}
.search-input::placeholder { color: var(--color-text-muted); }
.engine-switch {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-left: 1px solid var(--color-border);
  flex-shrink: 0;
}
.engine-icon {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  pointer-events: none;
}
.engine-select {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

/* ===== 状态 ===== */
.status-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
  color: var(--color-text-muted);
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.retry-btn {
  margin-top: 12px;
  padding: 8px 20px;
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
}

/* ===== 分类 ===== */
.sections { display: flex; flex-direction: column; gap: 48px; }
.section-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--color-text);
}
.section-icon { font-size: 26px; }

/* ===== 卡片网格 ===== */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}
.card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 16px 18px;
  transition: all 0.3s ease;
}
.card:hover {
  border-color: rgba(255,107,53,0.3);
}
.card-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(255,255,255,0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.card-icon img {
  width: 26px;
  height: 26px;
  object-fit: contain;
}
.card-body { min-width: 0; }
.card-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 2px;
}
.card-desc {
  font-size: 13px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ===== 底部 ===== */
.footer {
  margin-top: 64px;
  text-align: center;
  font-size: 12px;
  color: var(--color-text-muted);
}

/* ===== 响应式 ===== */
@media (max-width: 640px) {
  .container { padding: 32px 16px 48px; }
  .search-box { margin-bottom: 40px; }
  .card-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
  .card { padding: 12px 14px; flex-direction: column; text-align: center; }
  .card-icon { margin: 0 auto; }
  .section-title { font-size: 20px; }
  .topbar-inner { padding: 0 16px; }
  .nav-link { display: none; }
  .nav-link:first-of-type { display: inline; }
}
</style>
