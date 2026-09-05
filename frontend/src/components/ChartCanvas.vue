<template><div class="chart-wrap" :style="{ height: height + 'px' }"><canvas ref="el"></canvas></div></template>
<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { Chart, BarController, BarElement, LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler } from 'chart.js'
Chart.register(BarController, BarElement, LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler)
Chart.defaults.font.family = '-apple-system, system-ui, Pretendard, "Segoe UI", sans-serif'
Chart.defaults.color = '#64748b'
const props = defineProps({ type: { type: String, default: 'bar' }, data: Object, options: Object, height: { type: Number, default: 220 } })
const el = ref(null); let chart
const base = {
  responsive: true, maintainAspectRatio: false, animation: { duration: 300 },
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0f172a', titleColor: '#fff', bodyColor: '#e2e8f0', padding: 10, cornerRadius: 8, displayColors: false } },
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11 } } },
    y: { grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { font: { size: 11 }, precision: 0 }, beginAtZero: true },
  },
}
const deepMerge = (a, b) => { const o = { ...a }; for (const k in b) o[k] = b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) ? deepMerge(a[k] || {}, b[k]) : b[k]; return o }
function render() {
  if (chart) chart.destroy()
  chart = new Chart(el.value, { type: props.type, data: props.data, options: deepMerge(base, props.options || {}) })
}
onMounted(render)
watch(() => [props.data, props.options], render, { deep: true })
onBeforeUnmount(() => chart && chart.destroy())
</script>
<style scoped>.chart-wrap { position: relative; width: 100%; }</style>
