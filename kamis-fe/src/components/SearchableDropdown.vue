<template>
  <div class="relative" ref="dropdownRef">
    <!-- Input Field -->
    <div class="relative">
      <input 
        v-model="searchQuery"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="[
          'w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm',
          { 'bg-gray-100 text-gray-400': disabled }
        ]"
        @focus="showDropdown = true"
        @input="handleInput"
        @keydown="handleKeydown"
        autocomplete="off"
      />
      
      <!-- Dropdown Arrow -->
      <div 
        class="absolute inset-y-0 right-0 flex items-center px-2 cursor-pointer"
        @click="toggleDropdown"
      >
        <svg 
          class="w-4 h-4 text-gray-400 transition-transform duration-200"
          :class="{ 'rotate-180': showDropdown }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
    </div>

    <!-- Dropdown List -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div 
        v-if="showDropdown && !disabled"
        class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
      >
        <!-- No Results -->
        <div 
          v-if="filteredOptions.length === 0" 
          class="px-3 py-2 text-gray-500 text-sm"
        >
          {{ searchQuery ? 'Tidak ada hasil ditemukan' : 'Tidak ada pilihan tersedia' }}
        </div>
        
        <!-- Options -->
        <div
          v-for="(option, index) in filteredOptions"
          :key="option"
          :class="[
            'px-3 py-2 cursor-pointer text-sm transition-colors duration-150',
            {
              'bg-blue-50 text-blue-700': index === highlightedIndex,
              'hover:bg-gray-50': index !== highlightedIndex
            }
          ]"
          @click="selectOption(option)"
          @mouseenter="highlightedIndex = index"
        >
          {{ option }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

interface Props {
  modelValue: string
  options: string[]
  placeholder?: string
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Pilih atau ketik untuk mencari...',
  disabled: false
})

const emit = defineEmits<Emits>()

// Reactive variables
const searchQuery = ref('')
const showDropdown = ref(false)
const highlightedIndex = ref(-1)
const dropdownRef = ref<HTMLElement>()

// Computed
const filteredOptions = computed(() => {
  if (!searchQuery.value) {
    return props.options
  }
  
  const query = searchQuery.value.toLowerCase()
  return props.options.filter(option => 
    option.toLowerCase().includes(query)
  )
})

// Methods
const handleInput = () => {
  showDropdown.value = true
  highlightedIndex.value = -1
  
  // If the search query exactly matches an option, emit it
  const exactMatch = props.options.find(option => 
    option.toLowerCase() === searchQuery.value.toLowerCase()
  )
  
  if (exactMatch) {
    emit('update:modelValue', exactMatch)
  } else {
    // If no exact match, clear the model value
    emit('update:modelValue', '')
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!showDropdown.value) return
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      highlightedIndex.value = Math.min(
        highlightedIndex.value + 1,
        filteredOptions.value.length - 1
      )
      break
      
    case 'ArrowUp':
      event.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1)
      break
      
    case 'Enter':
      event.preventDefault()
      if (highlightedIndex.value >= 0 && highlightedIndex.value < filteredOptions.value.length) {
        selectOption(filteredOptions.value[highlightedIndex.value])
      }
      break
      
    case 'Escape':
      showDropdown.value = false
      highlightedIndex.value = -1
      break
  }
}

const selectOption = (option: string) => {
  searchQuery.value = option
  emit('update:modelValue', option)
  showDropdown.value = false
  highlightedIndex.value = -1
}

const toggleDropdown = () => {
  if (!props.disabled) {
    showDropdown.value = !showDropdown.value
    highlightedIndex.value = -1
  }
}

const handleClickOutside = (event: Event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    showDropdown.value = false
    highlightedIndex.value = -1
  }
}

// Watch for model value changes from parent
watch(() => props.modelValue, (newValue) => {
  searchQuery.value = newValue
})

// Watch for options changes
watch(() => props.options, () => {
  highlightedIndex.value = -1
})

// Initialize search query with model value
onMounted(() => {
  searchQuery.value = props.modelValue
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>