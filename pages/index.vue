<template>
	<div>
		<h1>Asta Cafe</h1>
		<ul>
			<NuxtLink to="/bestellungen">
				<li>Bestellungen</li>
			</NuxtLink>
			<NuxtLink to="/theke">
				<li>Theke</li>
			</NuxtLink>
			<NuxtLink to="/pickup">
				<li>Abholung</li>
			</NuxtLink>
			<NuxtLink to="/stats">
				<li>Stats</li>
			</NuxtLink>
		</ul>
	</div>
</template>

<style scoped>
h2 {
  text-align: center;
}
ul {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  padding: 0;
  margin: 0;
  max-height: 100%;
  overflow: scroll;
}
ul li {
  border-radius: 10px;
  height: 120px;
  line-height: 120px;
  width: 200px;
  background: #ffe3a5;
  margin: 15px;
  text-align: center;
  font-size: 20px;
}
</style>