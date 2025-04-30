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

  const route = useRoute()
  const router = useRouter()

  const breadcrumbs = computed(() => {
    const crumbs: any[] = []
    let current = route.matched[route.matched.length - 1]
    const visited = new Set<string>()
    let params = { ...route.params } // ambil params aktif
    while (current) {
      if (current.meta && current.meta.breadcrumb) {
        // Simpan name dan params untuk router-link dinamis
        crumbs.unshift({
          ...current,
          name: current.name,
          params: { ...params }
        })
      }
      if (current.meta && current.meta.parent) {
        const parentMeta = typeof current.meta.parent === 'function'
          ? current.meta.parent({ ...route, params })
          : current.meta.parent;
        const resolved = router.resolve(parentMeta)
        const parentMatched = resolved.matched.at(-1)
        if (parentMatched && !visited.has(parentMatched.path)) {
          visited.add(parentMatched.path)
          // update params jika parentMeta object
          if (typeof parentMeta === 'object' && parentMeta.params) {
            params = { ...parentMeta.params }
          }
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

  function getRoutePath(route: any) {
    if (route.name && route.params && Object.keys(route.params).length > 0) {
      return { name: route.name, params: route.params }
    }
    if (route.path) {
      return route.path
    }
    // fallback
    return '/'
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