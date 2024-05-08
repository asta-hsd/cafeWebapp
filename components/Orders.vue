<template>
	<h1>Aktive Bestellungen</h1>
	<ul>
        <li v-for="(order, index) in [...useState('orders').value].sort(sortByDate).reverse()" @click="$emit('orderClick', order._id)">
            <span>{{ order.orderType }}
                        {{
                            order.options.length > 0
                                ? " - " + order.options.toString()
                                : ""
                        }}</span
                    >
                    <span
                        style="
                            float: right;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                        "
                    >
                        Name: {{ order.pickupName }}
						{{ new Date(order.createdAt).toLocaleString('de-DE', { hour: 'numeric', minute: 'numeric'})   }} Uhr
                        <svg
                            @click.stop="deleteOrder(order)"
                            class="btn"
                            viewBox="0 0 47 47"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
							<rect width="47" height="47" rx="10" fill="#FFFBF1"/>
							<path d="M12.6797 11.7506L34.4087 33.4796" stroke="#FF5E5E" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
							<path d="M12.3354 33.4797L34.0644 11.7507" stroke="#FF5E5E" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </span>
                </li>
		<Modal :show="clickedOrder" @close="clickedOrder=null" buttonColor="black" closeOnBackdrop>
			<div v-if="clickedOrder" class="orderDetails">
				<h2>{{ clickedOrder.orderType }}</h2>
				<p>Bestellt: {{ new Date(clickedOrder.createdAt).getHours() + ":" + new Date(clickedOrder.createdAt).getMinutes() }} Uhr</p>
			</div>
		</Modal>
    </ul>
</template>

<script>

export default {
	data() {
		return {
			orders: [],
			clickedOrder: null,
		}
	},
	emits: ["orderClick"],
	methods: {
		deleteOrder(order) {
			const {$io} = useNuxtApp()
			$io.emit(SocketEvent.deleteOrder,order)
		}
	},
}
</script>


<style lang="scss" scoped>

h1 {
	font-size: 35px;
	margin: 0;
	text-align: center
}

.bestellungen {
	background: #FFF4DA;
	height: 100%;
	width: 100%;
	margin: 0;
	padding: 30px 60px;
	position: relative;
	overflow: hidden;
}

ul,
li {
    margin: 0;
    padding: 0;
    list-style: none;
}

ul {
    /* padding: 50px; */
    overflow: scroll;
    height: 100%;
    position: relative;
    width: 100%;
    padding-bottom: 100px;
    margin-top: 30px;
    li {
        background: #ffe3a5;
        border-radius: 10px;
        margin: 15px 0;
        padding: 15px 20px;
        font-size: 1.5rem;
        width: 100%;
        transition: all 1s;
		display: inline-block;
    }
}

.btn {
    width: 35px;
    margin-left: 20px;
}

.orders {
    padding: 30px;
}

.list-enter, .list-leave-to {
    opacity: 0;
    transform: translate(100px, -15px);
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

.orderDetails {
    background: #FFF4DA;
    padding: 30px;

    h2 {
      font-family: 'Nunito';
      margin: 0;
      text-align: center;
    }
  }

</style>