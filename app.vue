<template>
    <!-- <NuxtWelcome /> -->
	<NuxtLayout>
	<NuxtPage/>
</NuxtLayout>
</template>

<script setup>

	async function loadOrders() {
		const {data,error} = await useFetch("/api/orders");
		if(!error.value) {
			useState('orders').value = data.value.orders
			useState('pickupNames').value = data.value.pickupNames
			useState('availableNames').value = data.value.availableNames
		}
	}

	const {data,error} = await useFetch("/api/orderMenu");
	if(!error.value) {
		useState('orderTypes').value = data.value.orderTypes
		useState('options').value = data.value.options
	}

	loadOrders()

	const { $io } = useNuxtApp()
	$io.connect()

	$io.on(SocketEvent.refreshOrders,async (message) => {
		loadOrders()
		console.log('refrehsed')
		// console.log(data)
	})

	$io.on('connect', function() {
		console.log('Connection success');
	});

	$io.on('connect_error', function() {
		console.log('Connection failed');
	});
</script>

<style>
* {
	box-sizing: border-box;
	user-select: none;
}

@font-face {
	font-family: 'Bungee';
	src: url("/fonts/Bungee-Regular.ttf");
}

@font-face {
	font-family: 'Nunito';
	src: url("/fonts/Nunito-Medium.ttf");
	font-weight: normal;
}

@font-face {
	font-family: 'Nunito';
	src: url("/fonts/Nunito-Light.ttf");
	font-weight: lighter;
}

@font-face {
	font-family: 'Nunito';
	src: url("/fonts/Nunito-Bold.ttf");
	font-weight: bold;
}

@font-face {
	font-family: 'Nunito';
	src: url("/fonts/Nunito-ExtraBold.ttf");
	font-weight:bolder;
}

html {
	height: 100%;
}

body {
	width: 100vw;
	height: 100%;
	margin: 0;
	font-family: 'Nunito';
	color: #736C5A;
	background: #EADAFF;
}

#__nuxt {
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
}

h1,h2,h3,h4,h5 {
	font-family: 'Bungee';
}

.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}

a {
	color: initial;
	text-decoration: none;
}
</style>