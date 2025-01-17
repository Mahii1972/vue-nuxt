<template>
  <div class="bg-gray-900 rounded-lg p-4">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold text-white">Latest Market News</h2>
      <div class="flex items-center gap-2">
        <button 
          @click="refreshNews" 
          class="text-blue-400 hover:text-blue-300 flex items-center gap-1"
          :disabled="loading"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
    </div>

    <div v-if="error" class="text-red-500 p-4 rounded-lg bg-red-100 mb-4">
      {{ error }}
    </div>

    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <div v-else-if="newsItems.length" class="space-y-6">
      <div v-for="item in newsItems" :key="item.guid" class="bg-gray-800 p-4 rounded-lg">
        <a :href="item.link" target="_blank" rel="noopener noreferrer" class="block">
          <div class="flex flex-col md:flex-row gap-4">
            <div v-if="item.imageUrl" class="md:w-1/3">
              <img 
                :src="item.imageUrl" 
                :alt="item.title"
                class="w-full h-48 object-cover rounded-lg"
                loading="lazy"
              />
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-white hover:text-blue-400 mb-2">{{ item.title }}</h3>
              <p class="text-gray-300 text-sm mb-2">{{ truncateText(cleanDescription(item.description), 200) }}</p>
              <div class="flex justify-between items-center text-sm text-gray-400">
                <span>{{ formatDate(item.pubDate) }}</span>
                <span>{{ item.creator }}</span>
              </div>
            </div>
          </div>
        </a>
      </div>
    </div>

    <p v-else class="text-gray-500 text-center py-8">No news available</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const newsItems = ref([])
const loading = ref(false)
const error = ref(null)

const extractImageUrl = (description) => {
  const div = document.createElement('div')
  div.innerHTML = description
  const img = div.querySelector('img')
  return img?.src || null
}

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

const fetchNews = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await fetch('https://www.5paisa.com/rss/news.xml')
    const text = await response.text()
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(text, 'text/xml')
    const items = xmlDoc.querySelectorAll('item')
    
    newsItems.value = Array.from(items).map(item => {
      const description = item.querySelector('description')?.textContent || ''
      return {
        title: item.querySelector('title')?.textContent || '',
        link: item.querySelector('link')?.textContent || '',
        description: description,
        pubDate: item.querySelector('pubDate')?.textContent || '',
        creator: item.querySelector('dc\\:creator')?.textContent || '',
        guid: item.querySelector('guid')?.textContent || '',
        imageUrl: extractImageUrl(description)
      }
    })
  } catch (e) {
    error.value = 'Failed to fetch news. Please try again later.'
    console.error('Error fetching news:', e)
  } finally {
    loading.value = false
  }
}

const cleanDescription = (description) => {
  // Extract first paragraph of text content
  const div = document.createElement('div')
  div.innerHTML = description
  const firstParagraph = div.querySelector('p')
  return firstParagraph ? firstParagraph.textContent : description
}

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date)
  } catch (e) {
    return dateString
  }
}

const refreshNews = () => {
  fetchNews()
}

onMounted(() => {
  fetchNews()
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 