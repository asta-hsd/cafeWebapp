<template>
	<div class="stats">
		<BackButton back="/"/>
		<h1>Stats</h1>
		<div class="datePickers">
			<div>Von:<vue-date-picker v-model="startDate" placeholder="Von" @update:model-value="updateOrders"/></div>
			<div>Bis:<vue-date-picker v-model="endDate" placeholder="Bis" @update:model-value="updateOrders"/></div>
		</div>
		<ul class="statList">
			<li v-for="(value, name, index) in stats">
				<p>{{ name }}</p>
				<span>{{ value }}</span>
			</li>
			<li v-for="ordertype in ordertypeCounters">
				<p>{{ ordertype.name }}</p>
				<span>{{ ordertype.count }}</span>
			</li>
		</ul>
	</div>
</template>

<script>


export default {
	data() {
		return {
			startDate: null,
			endDate: null,
			stats: {
				Shots: 0,
				Einnahmen: '0 €'
			},
			orders: []
		}
	},
	methods: {
		async updateOrders() {
			if(this.startDate && this.endDate) {
				const { data, error } = await useFetch("/api/orderStats", {
					query: { startDate: new Date(this.startDate).toISOString(), endDate: new Date(this.endDate).toISOString() }
				});
				if(!error.value) {
					console.log(data.value)
					let orders = data.value.filter(order => !order.devTest)
					this.orders = orders
					this.stats.Shots = orders.reduce((acc,curr) => {
						if(curr.options.includes('Doppelt')) return acc + 2
						if(curr.orderType.shots) return acc + Number(curr.orderType.shots)
						return acc
					}, 0)

					this.stats.Einnahmen = orders.reduce((acc,curr) => acc + curr.price,0) + " €"

					
				} else {
					console.log(error)
				}
			}
		}
	},
	computed: {
		ordertypeCounters() {
			console.log(this.orders)
			return useState('orderTypes').value.map(orderType => {
				return {
					name: orderType.name,
					count: this.orders.filter(order => order.orderType.name == orderType.name).length
				}
			})
		}
	}
}
</script>

<style scoped>
h1 {
	text-align: center;
}

.stats {
	height: 100%;
	display: flex;
	flex-direction: column;
}
.datePickers {
 	display: flex;
 	flex-direction: row;
 	width: 100%;
 }
 .datePickers > div {
 	flex-grow: 1;
 	margin: 20px;
 }

ul {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  padding: 0;
  margin: 0;
  height: 100%;
}
ul li {
  border-radius: 10px;
  height: 120px;
  width: 200px;
  background: #ffe3a5;
  margin: 15px;
  text-align: center;
  font-size: 20px;
}

li p {
	font-size: 20px;
}

li span {
	font-size: 25px;
}

.statList {
	overflow: scroll;
	flex-grow: 1;
}

.input {
	padding: 8px;
	font-size: 10px;
	width: 100%;
}
</style>