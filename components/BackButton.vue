<template>
	<NuxtLink v-if="back" :to="back" class="backBtn">
	<svg fill="#FFC32A" viewBox="0 0 36 28" xmlns="http://www.w3.org/2000/svg">
		<path d="M0.83118 15.9639C-0.27706 14.8821 -0.27706 13.1179 0.83118 12.0361L12.3405 0.801467C13.4352 -0.267156 15.2004 -0.267156 16.2951 0.801467C17.4034 1.88327 17.4034 3.64744 16.2951 4.72924L9.63069 11.2346H33.1915C34.7197 11.2346 36 12.4501 36 14C36 15.5499 34.7197 16.7654 33.1915 16.7654H9.63069L16.2951 23.2708C17.4034 24.3526 17.4034 26.1167 16.2951 27.1985C15.2004 28.2672 13.4352 28.2672 12.3405 27.1985L0.83118 15.9639Z"/>
	</svg>
	</NuxtLink>
</template>

<script>
export default {
	props: ['back']
}
</script>

<style scoped>

.backBtn {
	position: absolute;
	top: 50px;
	width: 40px;
	z-index: 1;
}
</style>