<template>
	<NuxtLink v-if="back" :to="back" class="backBtn">
		<svg viewBox="0 0 36 28" xmlns="http://www.w3.org/2000/svg" fill="#FFC32A">
			<path d="M0.83118 15.9639C-0.27706 14.8821 -0.27706 13.1179 0.83118 12.0361L12.3405 0.801467C13.4352 -0.267156 15.2004 -0.267156 16.2951 0.801467C17.4034 1.88327 17.4034 3.64744 16.2951 4.72924L9.63069 11.2346H33.1915C34.7197 11.2346 36 12.4501 36 14C36 15.5499 34.7197 16.7654 33.1915 16.7654H9.63069L16.2951 23.2708C17.4034 24.3526 17.4034 26.1167 16.2951 27.1985C15.2004 28.2672 13.4352 28.2672 12.3405 27.1985L0.83118 15.9639Z"/>
		</svg>
	</NuxtLink>
	<svg viewBox="0 0 54 54" class="fullScreen" @click="fullscreen()" fill="#FFC32A" xmlns="http://www.w3.org/2000/svg">
			<path d="M54 7C54 5.14348 53.2625 3.36301 51.9497 2.05025C50.637 0.737498 48.8565 0 47 0H36V6H47C47.2652 6 47.5196 6.10536 47.7071 6.29289C47.8946 6.48043 48 6.73478 48 7V18H54V7Z"/>
			<path d="M54 47V36H48V47C48 47.2652 47.8946 47.5196 47.7071 47.7071C47.5196 47.8946 47.2652 48 47 48H36V54H47C48.8565 54 50.637 53.2625 51.9497 51.9497C53.2625 50.637 54 48.8565 54 47Z"/>
			<path d="M0 36V47C0 48.8565 0.737498 50.637 2.05025 51.9497C3.36301 53.2625 5.14348 54 7 54H18V48H7C6.73478 48 6.48043 47.8946 6.29289 47.7071C6.10536 47.5196 6 47.2652 6 47V36H0Z"/>
			<path d="M18 0H7C5.14348 0 3.36301 0.737498 2.05025 2.05025C0.737498 3.36301 0 5.14348 0 7V18H6V7C6 6.73478 6.10536 6.48043 6.29289 6.29289C6.48043 6.10536 6.73478 6 7 6H18V0Z"/>
	</svg>
</template>

<script>
export default {
	props: ['back'],
	data() {
		return {
			isFullscreen: false
		}
	},
	methods: {
		fullscreen() {
			var isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
			(document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
			(document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
			(document.msFullscreenElement && document.msFullscreenElement !== null);

			var docElm = document.documentElement;
			if (!isInFullScreen) {
				if (docElm.requestFullscreen) {
					docElm.requestFullscreen();
				} else if (docElm.mozRequestFullScreen) {
					docElm.mozRequestFullScreen();
				} else if (docElm.webkitRequestFullScreen) {
					docElm.webkitRequestFullScreen();
				} else if (docElm.msRequestFullscreen) {
					docElm.msRequestFullscreen();
				}
			} else {
				if (document.exitFullscreen) {
					document.exitFullscreen();
				} else if (document.webkitExitFullscreen) {
					document.webkitExitFullscreen();
				} else if (document.mozCancelFullScreen) {
					document.mozCancelFullScreen();
				} else if (document.msExitFullscreen) {
					document.msExitFullscreen();
				}
			}
		}
	}
}
</script>

<style scoped>

.backBtn {
	position: absolute;
	top: 45px;
	left: 60px;
	width: 40px;
	z-index: 1;
}

.fullScreen {
	position: absolute;
	right: 60px;
	top: 45px;
	width: 30px;
}
</style>