<template>
  <div class="bg-slate-800 border border-slate-700 text-red-500 px-3 py-3 rounded-md">
      <p>{{ error }}</p>
    </div>
</template>

<script>
export default {
    props: ['error'] 
}
</script>
