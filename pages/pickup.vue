<template>
	<div class="pickup" v-if="useState('orders').value">
		<!-- <BackButton back="/"/> -->
		<!-- <h1>Asta Cafe</h1> -->
		<div>
			<h1>Zubereitung</h1>
			<ul>
				<transition-group name="list" tag="div">
					<template v-for="(name,index) in orderedOrders" :key="index">
				<li v-if="!name.ready">
					<p>{{ name.name }}</p>
					<span v-for="order in name.orders">{{ order.orderType }} 
						<svg v-if="order.status == OrderStatus.pickup" viewBox="0 0 40 28" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M4.81306 12.9036L15.8905 23.981L35.8299 4.04161" stroke="#80C587" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</span>
				</li>
				</template>
				</transition-group>
			</ul>
		</div>
		<div>
			<h1>Abholung</h1>
			<ul class="pickupList">
				<transition-group name="list" tag="div">
					<template v-for="(name,index) in orderedOrders" :key="index">
				<li @click="completePickup(name)" v-if="name.ready" :style="{'--timePerc': 100-(getElapsedTime(name)/maxPickupTime)*100 + '%', '--timeHue': 100-(getElapsedTime(name)/maxPickupTime)*100}">
					<p>{{ name.name }}</p>
					<span v-for="order in name.orders">{{ order.orderType }} 
						<svg v-if="order.status == OrderStatus.pickup" viewBox="0 0 40 28" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M4.81306 12.9036L15.8905 23.981L35.8299 4.04161" stroke="#80C587" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</span>
				</li>
				</template>
				</transition-group>
			</ul>
		</div>
	</div>
</template>

<script setup>
definePageMeta({
  layout: "empty",
});
</script>

<script>
export default {
	data() {
		return {
			currentTime: new Date(),
			maxPickupTime: 3*60,
			sound: new Audio('/cashSound.mp3')
		}
	},
	created() {
		setInterval(() => {
			this.currentTime = new Date()
			
			useState('pickupNames').value.filter(name => name.ready).map(name => {
				this.currentTime = new Date()
				
				if(this.getElapsedTime(name) > this.maxPickupTime) this.completePickup(name)
			})
		}, 1000)

		const config = useRuntimeConfig()
		this.maxPickupTime = config.public.maxPickupTime
		console.log(this.maxPickupTime)

		const { $io } = useNuxtApp()
		const synth = window.speechSynthesis;
		$io.on(SocketEvent.pickupOrder,(name) => {
			console.log("new pickup")
			// const utterThis = new SpeechSynthesisUtterance(name.name);
			
			// const german = speechSynthesis.getVoices().filter(voice => voice.lang.startsWith('de'))[0]
			// utterThis.voice = german
			// synth.speak(utterThis)
			this.sound.play()
		})

	},
	computed: {
		// activeNames() {
		// 	let activeOrders = useState('orders').value.filter(order => order.status == OrderStatus.ordered || order.status == OrderStatus.pickup)
		// 	let names = [... new Set(activeOrders.map(order=>order.pickupName))];
			
		// 	names = names.map(name => {
		// 		let matchingOrders = activeOrders.filter(order => order.pickupName == name)
		// 		return {
		// 			name: name,
		// 			orders: matchingOrders,
		// 			ready: matchingOrders.every(order => order.status === OrderStatus.pickup)
		// 		}
		// 	})
		// 	console.log(names)
		// 	this.pickupNames = names.filter(name => name.ready)
		// 	return names
		// }
		orderedOrders() {
			return useState('pickupNames').value.sort((a,b) => new Date(a.orders[0].createdAt) - new Date(b.orders[0].createdAt))
		},
		readyOrders() {
			return useState('pickupNames').value.sort((a,b) => new Date(b.orders[0].updatedAt) - new Date(a.orders[0].updatedAt))
		}
	},
	methods: {
		completePickup(name) {
			const {$io} = useNuxtApp()
			name.orders.map(order => {
				order.status = OrderStatus.done
				$io.emit(SocketEvent.updateOrder,order)
			})
		},
		getElapsedTime(name) {
			return Math.floor((this.currentTime - name.completedAt)/1000)
		},
		testSpeech(text) {
			const synth = window.speechSynthesis;
			const utterThis = new SpeechSynthesisUtterance(text);
			
			


			const german = speechSynthesis.getVoices().filter(voice => voice.lang.startsWith('de'))[0]
			utterThis.voice = german

			synth.speak(utterThis)
		}
	},
// 	watch: {
// 		// whenever question changes, this function will run
// 		pickupNames(newNames, oldNames) {
// 			let addedNames = newNames.filter(x => !oldNames.includes(x));
// 			const synth = window.speechSynthesis;
// 			console.log(synth.getVoices())
// 			addedNames.map(name => {
// 				const utterThis = new SpeechSynthesisUtterance(name.name);
// 				synth.speak(utterThis)

// 			})
// 		}
//   },
}
</script>

<style lang="scss" scoped>
* {
	overflow: hidden !important;
	transition: all 0.2s;
}

.pickup {
	background-color: #fff4da00;
	padding: 40px;
	border-radius: 20px;
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: row;
}

.pickup > div {
	width: 50%;
}

h1, h2 {
	color: white;
}

ul, ul > div {
	list-style: none;
	display: flex;
	flex-wrap: wrap;
	padding: 0;
	margin: 0;
	max-height: 100%;
	overflow: scroll;
}

.pickupList li::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 0;
	height: 10px;
	width: var(--timePerc);
	transition: all 0.2s;
	// background-color: color-mix(in hwb shorter hue, #ff4343, #80C587 var(--timePerc));
	background-color: hsl(calc(var(--timeHue)), 80%, 50%);
}

li {
	border-radius: 10px;
	background: #ffe3a5;
	margin: 20px;
	margin-left: 0;
	text-align: center;
	font-size: 20px;
	padding: 15px;
	cursor: pointer;
	transition: all 0.2s;
	display: flex;
	flex-direction: column;
	justify-content: center;
	min-width: 200px;
	position: relative;

	span {
		font-size: 15px;

		svg {
			width: 15px;
		}
	}
}

.list-enter, .list-leave-to {
    opacity: 0;
    transform: translate(100px, 0);
    background: green;
}
.list-leave-active {
    position: absolute;
}
// .list-enter-active, .list-leave-active {
//   transition: all 1s;
// }
// .list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
//   opacity: 0;
//   transform: translateY(30px);
// }

.list-move {
  transition: all 1s;
}
</style>