<template>
	<div class="content">
		<slot/>
	</div>
</template>

<style scoped>
.content {
	background: #FFF4DA;
	height: calc(100% - 80px);
	width: calc(100% - 80px);
	margin: 0;
	padding: 30px 60px;
	border-radius: 40px;
	position: relative;
	overflow: hidden;
}
</style>