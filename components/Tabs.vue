<template>
	<div class="tabView">
		<div v-if="currentTab==0" class="tab">
			<slot name="leftTab"/>
		</div>
		<div v-if="currentTab==1" class="tab">
			<slot name="rightTab"/>
		</div>
		<div class="buttons">
			<div class="btn" @click="currentTab=0" :class="{ active: currentTab == 0 }"><span>{{ leftTitle }}</span></div>
			<div class="btn" @click="currentTab=1" :class="{ active: currentTab == 1 }"><span>{{ rightTitle }}</span></div>
		</div>
	</div>
</template>


<script>
export default {
	props: ['leftTitle','rightTitle'],
	data() {
		return {
			currentTab: 0
		}
	}
}
</script>

<style scoped>


.tab {
	width: 100%;
	padding: 30px 60px;
	padding-bottom: 0;
	height: calc(100% - 140px);
}

.tabView {
	height: 100%;
	flex-direction: column;
}

.buttons {
	width: 100%;
	display: flex;
	z-index: 0;
	bottom: 0;
	left: 0;
	height: 80px;
	position: absolute;
}

.buttons .btn {
	width: 50%;
	font-size: 25px;
	vertical-align: middle;
	cursor: pointer;
	background: #FFF8F1;
	display: flex;
	justify-content: center;
	align-items: center;
}

.btn:not(.active) {
	/* background: #e4dcc7; */
	box-shadow: inset 0px 10px 15px -10px #00000032
}

.btn.active {
	background: #FFDF95;
}
</style>