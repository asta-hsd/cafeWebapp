<template>
	<div class="theke">
		<BackButton back="/"/>
	<Tabs leftTitle="Theke" rightTitle="Aktive Bestellungen">
			<template v-slot:leftTab>
				<h1>Theke</h1>
				<div class="wrapper">
					<div class="orderMenu">
						<div v-for="category in orderTypeCategories">
							<h2>{{category.name}}</h2>
							<ul>
								<li v-for="orderType in category.orderTypes" @click="clickMenuItem(orderType)">
									<p>{{ orderType.name }}</p>
									<span>{{ orderType.price }} €</span>	
								</li>
							</ul>
						</div>
					</div>
					<div class="receipt">
						<ul>
							<li v-for="(order,index) in addedOrders" @click="editOrder(index)">
								<div class="order">
									<svg @click="addedOrders.push({ ...order });console.log(addedOrders)" class="btn" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(45deg) scale(0.7);">
										<path d="M3 3L20 20M20 3L3 20" stroke="#80C587" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
									</svg>
									<span style="flex-grow: 1">{{ order.orderType.name }}</span>
									<span style="text-wrap: nowrap;">{{ order.price }} €</span>
									<svg @click.stop.prevent="addedOrders.splice(index,1)" class="btn" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M3 3L20 20M20 3L3 20" stroke="#B75252" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
									</svg>
								</div>
								<p style="margin-left: 30px;" v-for="opt in order.options">+{{ opt }}</p>
							</li>
						</ul>
						<div class="sum">
							Summe: <span>{{ totalPrice }} €</span>
							<p>Name: {{ pickupName }}</p>
							<div class="button" @click="sendOrder()">Bestellen</div>
							<div class="button secondary" @click="showReturn=true">Rückgeld</div>
						</div>
					</div>
				</div>

				<Modal :show="showReturn" @close="cancel()" buttonColor="#736C5A">
					<div class="returnScreen">
						<span class="input">Eingabe: {{ moneyInput }}€</span>
						<span class="output">Rückgeld:  {{ Math.max(0,(moneyInput - totalPrice).toFixed(2)) }}€</span>
						<SimpleKeyboard @onChange="onChange" @onKeyPress="onKeyPress" :input="moneyInput"/>
						<div class="button" @click="sendOrder()">Bestellen</div>
						<span style="font-size: 15px;"><input type="checkbox" v-model="devTest"/>Devtest</span>
					</div>
				</Modal>
			</template>
			<template v-slot:rightTab>
				<Orders @orderClick="editActiveOrder"/>
			</template>
		</Tabs>
		<Modal :show="showDetails" @close="cancel()" buttonColor="#736C5A">
					<div class="orderDetails">
						<h2>{{ selectedOrder.name }}</h2>
						<ul v-for="cat in optionCategories">
							<li v-for="option in cat.options" @click="option.selected = !option.selected" :class="{selected: option.selected}" class="option">
								<p>{{ option.name }}</p>
								<span v-if="option.price">+{{ option.price }} €</span>
							</li>
						</ul>
						<div class="buttons">
							<span @click="cancel()">Cancel</span>
							<span v-if="detailEdit" class="primary" @click="saveOptions()">Speichern</span>
							<span v-else-if="editActive" class="primary" @click="saveActiveOptions()">Speichern</span>
							<span v-else class="primary" @click="addOrder()">Hinzufügen</span>
						</div>
					</div>
				</Modal>
	</div>
</template>


<script setup>
definePageMeta({
  layout: "defaulttab",
});
</script>

<script>

export default {
	data() {
		return {
			showDetails: false,
			selectedOrder: null,
			showReturn: false,
			detailEdit: false,
			editActive: false,
			moneyInput: "0",
			addedOrders: [],
			pickupNameSet: '',
			devTest: false
		}
	},
	methods: {
		addOrder() {
			let options = useState('options').value.filter(option => option.selected)
			this.addedOrders.push({
				orderType: this.selectedOrder,
				options: options.map(option => option.name),
				status: OrderStatus.ordered,
				price: this.selectedOrder.price + options.reduce((acc,option) => acc + option.price, 0)
			})
			this.cancel()
		},
		cancel() {
			this.showDetails = false
			this.moneyInput = "0"
			this.showReturn = false
			this.devTest = false
			this.selectedOrder = null
			this.detailEdit = false
			this.editActive = false
			useState('options').value.map(opt => {opt.selected = false})
		},
		sendOrder() {
			console.log(this.addedOrders)
			this.addedOrders.map((order) => {
				console.log(order.orderType)
				if(order.orderType.ignoreOrders) {
					order.status = OrderStatus.done
					order.pickupName = ''
				} else {
					order.pickupName = this.pickupNameSet
				}
				order.orderType = order.orderType.name
				order.devTest = this.devTest
				const { $io } = useNuxtApp()
				$io.emit(SocketEvent.newOrder,order)
			})
			this.selectedOrder = null;
			this.addedOrders = [];
			this.cancel()
		},
		randomInteger(min, max) {
  			return Math.floor(Math.random() * (max - min + 1)) + min;
		},
		onChange(input) {
			this.moneyInput = input;
		},
		onKeyPress(button) {
			console.log("button", button);
		},
		onInputChange(input) {
			this.moneyInput = input.target.value;
		},
		clickMenuItem(type) {
			this.selectedOrder=type
			if(type.ignoreOrders) {
				this.addOrder()
			} else {
				this.showDetails = true;
			}
		},
		editOrder(index) {
			if(this.addedOrders[index].orderType.ignoreOrders) return
			this.selectedOrder = index
			useState('options').value.map(opt => {
				opt.selected = this.addedOrders[index].options.includes(opt.name)
			})
			this.detailEdit = true
			this.showDetails = true
		},
		editActiveOrder(id) {
			this.selectedOrder = id
			let order = useState('orders').value.find(order => order._id == id)
			useState('options').value.map(opt => {
				opt.selected = order.options.includes(opt.name)
			})
			this.editActive = true
			this.showDetails = true
		},
		saveActiveOptions() {
			let id = this.selectedOrder
			let selectedOptions = useState('options').value.filter(option => option.selected)
			let order = useState('orders').value.find(order => order._id == id)
			order.options = selectedOptions.map(option => option.name)
			order.price = order.orderType.price + selectedOptions.reduce((acc,option) => acc + option.price, 0)
			const {$io} = useNuxtApp()
			$io.emit(SocketEvent.updateOrder,order)
			this.cancel()
		},
		saveOptions() {
			let selectedOptions = useState('options').value.filter(option => option.selected)
			console.log(this.addedOrders)
			let order = this.addedOrders[this.selectedOrder]
			order.options = selectedOptions.map(option => option.name)
			order.price = order.orderType.price + selectedOptions.reduce((acc,option) => acc + option.price, 0)
			this.cancel()
		}
	},
	computed: {
		totalPrice() {
			return this.addedOrders.reduce((akk,order) => akk + order.price,0)
		},
		optionCategories() {
			let options = useState('options').value
			let categories = [... new Set(options.map(opt=>opt.category))];
			categories = categories.map(cat => ({
				name: cat,
				options: options.filter(opt => opt.category == cat)
			}))
			return categories
		},
		orderTypeCategories() {
			let orderTypes = useState('orderTypes').value
			let categories = [... new Set(orderTypes.map(type=>type.category))];
			categories = categories.map(cat => ({
				name: cat,
				orderTypes: orderTypes.filter(type => type.category == cat)
			}))
			return categories
		},
		pickupName() {
			if(useState('availableNames').value && useState('availableNames').value.length > 0) {
				let availableNames = useState('availableNames').value.map(name => name.name)

				if(!this.pickupNameSet || !availableNames.includes(this.pickupNameSet)) this.pickupNameSet = availableNames[Math.floor(Math.random() * availableNames.length)];
				return this.pickupNameSet
			} 
		}
	},
}
</script>

<style scoped lang="scss">

.theke {
  height: 100%;
  h1 {
    font-size: 3rem;
    margin: 0;
    text-align: center;
  }

  h2 {
	margin: 0;
	margin-top: 30px;
  }

  .wrapper {
    display: flex;
    max-height: 100%;
	height: 100%;
    width: 100%;

	
  }

  ul {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		padding: 0;
		margin: 0;
		max-height: 100%;
		width: auto;
		overflow: scroll;
	}

  .orderDetails {
    background: #FFF4DA;
    padding: 30px;
    width: 80vw;
	//height: 80vh;
    max-width: 1000px;

    h2 {
      font-family: 'Nunito';
      margin: 0;
      text-align: center;
    }
  }

  .orderDetails ul {
    background: #FFFBF1;
    padding: 10px;
    margin: 10px;
    border-radius: 10px;
  }

  .orderMenu {
    flex-grow: 1;
	height: 100%;
	overflow: scroll;
  }

  .buttons {
    display: flex;
    justify-content: space-around;
    margin-top: 20px;
  }

  .sum {
    width: 100%;
    border-top: 2px dashed #736C5A;
    padding-top: 10px;

    span {
      float: right;
    }
  }

  .buttons span, .button {
    cursor: pointer;
    background: #736C5A;
    color: white;
    padding: 15px;
    width: 150px;
    border-radius: 10px;
    text-align: center;
	&.secondary {
		background-color: #ffe3a5;
		padding: 10px;
		color: inherit;
	}
  }

  .button {
    width: 100%;
    background: #80C587;
    margin-top: 15px;
  }

  .buttons .primary {
    background: #80C587;
  }

  .receipt {
    background: #FFFBF1;
    padding: 20px;
    width: 400px;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    font-size: 20px;
	margin-bottom: 20px;

    .order {
      display: flex;
      align-items: center;
      width: 100%;
      margin: 0;
      padding: 0;

      .btn {
        height: 20px;
        margin: 5px;
      }
    }

    li {
      width: 100%;
      margin-bottom: 15px;
    }

    p {
      margin: 0;
      font-size: 18px;
      font-weight: bold;
    }
  }

  .orderMenu li, .orderDetails li {
    border-radius: 10px;
    width: 140px;
    background: #ffe3a5;
    margin: 20px;
    margin-left: 0;
    text-align: center;
    font-size: 20px;
    padding: 15px;
    cursor: pointer;
    transition: all 0.2s;
    height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;

    &.selected {
      background: #FCB759;
      color: white;
    }

	p {
      margin: 0;
    }

    span {
      font-size: 15px;
    }
  }

  .option {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 15px;
    width: 160px;

    p {
      margin: 0;
    }

    span {
      font-size: 15px;
    }

    &.selected {
      background: #FCB759;
      color: white;
    }
  }
}

.returnScreen {
	width: 500px;
	background: #FFF4DA;
    padding: 30px;
  }
  .returnScreen span {
    background: #FFFBF1;
    padding: 20px;
    width: 100%;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    font-size: 20px;
	margin: 10px 0;
	display: inline-block;
  }

</style>