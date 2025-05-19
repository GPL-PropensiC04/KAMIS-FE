<script setup lang="ts">
import VLineIncomeExpense from '@/components/VLineIncomeExpense.vue';
import TheWelcome from '../components/TheWelcome.vue'
import VDonutPengeluaran from '@/components/VDonutPengeluaran.vue';
</script>

<template>
  <main>
    <VLineIncomeExpense
      :range="'THIS_YEAR'"></VLineIncomeExpense>
    <TheWelcome />
  </main>
</template>