<template>
	<div class="bestellungen">
	<BackButton back="/"/>
	<h1>Bestellungen</h1>
	<ul>
        <transition-group name="list" tag="p">
            <template v-if="useState('orders').value" v-for="(order, index) in useState('orders').value">
                <li v-if="order.status == OrderStatus.ordered">
                    <span
                        >{{ order.orderType }}
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
                        <svg
                            @click="completeOrder(order)"
                            class="btn"
                            viewBox="0 0 47 47"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <rect
                                width="47"
                                height="47"
                                rx="10"
                                fill="#FFFBF1"
                            />
                            <path
                                d="M7.81306 24.9036L18.8905 35.981L38.8299 16.0416"
                                stroke="#80C587"
                                stroke-width="8"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                    </span>
                </li>
            </template>
        </transition-group>

    </ul>
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
			orders: []
		}
	},
	methods: {
		completeOrder(order) {
			const {$io} = useNuxtApp()
			order.status = OrderStatus.pickup
			$io.emit(SocketEvent.updateOrder,order)
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


</style>