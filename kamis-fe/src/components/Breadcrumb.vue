<template>
  <nav class="w-full flex items-center py-3 px-6 bg-white" aria-label="Breadcrumb">
    <ol class="flex flex-wrap items-center space-x-1">
      <li v-for="(route, idx) in fullBreadcrumbs" :key="route.path" class="flex items-center">
        <router-link
          v-if="idx !== fullBreadcrumbs.length - 1"
          :to="getRoutePath(route)"
          class="text-gray-600 font-medium text-sm md:text-base transition-colors duration-200 cursor-pointer hover:text-gray-800"
        >
          {{ route.meta.breadcrumb }}
        </router-link>
        <span
          v-else
          class="text-black font-bold text-base md:text-xl"
        >
          {{ route.meta.breadcrumb }}
        </span>
        <svg
          v-if="idx < fullBreadcrumbs.length - 1"
          class="mx-2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
  defineOptions({ name: 'AppBreadcrumb' })
  import { useRoute, useRouter } from 'vue-router'
  import { computed } from 'vue'
  import type { RouteRecordNormalized } from 'vue-router'

  const route = useRoute()
  const router = useRouter()

  const breadcrumbs = computed(() => {
    const crumbs: RouteRecordNormalized[] = []
    let current = route.matched[route.matched.length - 1]
    while (current) {
      if (current.meta && current.meta.breadcrumb) {
        crumbs.unshift(current)
      }
      if (current.meta && current.meta.parent) {
        const parentMatched = router.resolve(current.meta.parent).matched.at(-1)
        if (parentMatched) {
          current = parentMatched
        } else {
          break
        }
      } else {
        break
      }
    }
    return crumbs
  })

  const fullBreadcrumbs = computed(() => {
    return [
      {
        path: '/',
        meta: { breadcrumb: 'Home' },
      },
      ...breadcrumbs.value,
    ]
  })

  function getRoutePath(route: RouteRecordNormalized | { path: string }) {
    return route.path
  }
</script>

<style scoped>
  nav {
    background-color: white;
    box-shadow: none;
    border-radius: 0;
  }
  ol {
    align-items: center;
  }
  a {
    text-decoration: none;
  }
  a:hover {
    text-decoration: none;
  }
</style>