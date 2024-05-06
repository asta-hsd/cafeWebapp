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
	border-radius: 40px;
	position: relative;
	overflow: scroll;
}
</style>