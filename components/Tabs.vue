<template>
	<div class="tabView">
	<div v-if="currentTab==0" class="tab">
		<slot name="leftTab"/>
	</div>
	<div v-if="currentTab==1" class="tab">
		<slot name="rightTab"/>
	</div>
	<div class="buttons">
		<div class="btn" @click="currentTab=0" :class="{ active: currentTab == 0 }">{{ leftTabTitle }}</div>
		<div class="btn" @click="currentTab=1" :class="{ active: currentTab == 1 }">{{ rightTabTitle }}</div>
	</div>
</div>
</template>

<script>
export default {
	props: ['leftTabTitle','rightTabTitle'],
	data() {
		return {
			currentTab: 0
		}
	}
}
</script>

<style scoped>


.tab {
	position: relative
}

.buttons {
	width: 100%;
	display: flex;
	position: absolute;
	bottom: 0;
	left: 0
}

.buttons .btn {
	width: 50%;
	padding: 40px;
	text-align: center;
	font-size: 25px;
	vertical-align: middle;
	cursor: pointer;
	background: #FFF8F1;
}

.btn:not(.active) {
	/* background: #e4dcc7; */
	box-shadow: inset 0px 10px 15px -10px #00000032
}

.btn.active {
	background: #FFDF95;
}
</style>