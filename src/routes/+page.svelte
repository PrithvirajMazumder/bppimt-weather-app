<script lang="ts">
	import { AQUSDefraIndex } from '$lib/constants/AQUSDefraIndex';
	import { onMount } from 'svelte';

	const API_KEY: string = 'b41e3c03abb0422dbfa192407242102';
	const BASE_URL: string = 'https://api.weatherapi.com/v1';
	const ENDPOINT: string = 'current.json';
	const FORECAST_ENDPOINT: string = 'forecast.json';
	const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

	let weatherInfo: any = null;
	let forecast: any = null;
	let isLoading: boolean;
	let hasError: unknown;

	const fetchWeatherInfo = async (query: string) => {
		try {
			isLoading = true;
			//calling api of current weather info
			const respWeatherInfo = await (
				await fetch(`${BASE_URL}/${ENDPOINT}?q=${query}&key=${API_KEY}&&aqi=yes`)
			).json();
			//calling api of forecast weather info
			const respForecast = await (
				await fetch(`${BASE_URL}/${FORECAST_ENDPOINT}?q=${query}&days=5&key=${API_KEY}&&aqi=yes`)
			).json();
			weatherInfo = respWeatherInfo;
			forecast = respForecast.forecast;

			if (respWeatherInfo?.error) {
				hasError = respWeatherInfo?.error;
				return;
			}
			hasError = null;
		} catch (error) {
			alert('Something went wrong!');
		} finally {
			isLoading = false;
		}
	};

</script>

<div class="container mx-auto">
	<div class="navbar bg-base-100 border-b">
		<div class="flex-1">
			<a href="/" class="btn btn-ghost normal-case text-xl"
				><span class="text-primary">BPPIMT</span> | Weather App</a
			>
		</div>
		<form
			on:submit|preventDefault={(event) => {
				// @ts-ignore
				fetchWeatherInfo(event?.target?.weatherQuery?.value);
			}}
			class="flex-none gap-2"
		>
			<div class="form-control">
				<label class="input-group">
					<span>Location</span>
					<input
						name="weatherQuery"
						type="text"
						placeholder="Eg. Pune, Kolkata"
						class="input input-bordered"
					/>
				</label>
			</div>
		</form>
	</div>
	<div class="flex flex-col items-center h-[calc(100svh-4rem)] relative">
		{#if isLoading}
			<progress class="progress w-full progress-primary absolute top-0 right-0 rounded-none" />
		{/if}
		{#if weatherInfo && !hasError}
			<div class="mt-[10rem]">
				<h1 class="text-xl font-extrabold">
					Current weather ☁️ at <b>{weatherInfo?.location?.name}</b>
				</h1>
				<h3 class="font-extrabold">
					Region <span class="text-primary">{weatherInfo?.location?.region}</span>
				</h3>
				<h1 class="text-9xl font-extrabold">
					<span class="text-primary">{weatherInfo?.current?.temp_c}</span> centigrade
				</h1>
				<div class="flex items-center mt-10">
					<h1 class="text-2xl font-extrabold">
						Feels like <span class="text-primary">{weatherInfo?.current?.feelslike_c}</span> centigrade
					</h1>
					<div class="divider divider-horizontal" />
					<h1 class="text-2xl font-extrabold">
						Wind 💨 <span class="text-primary">{weatherInfo?.current?.wind_kph}</span>kph
					</h1>
					<div class="divider divider-horizontal" />
					<h1 class="text-2xl font-extrabold">
						Humidity 💦 <span class="text-primary">{weatherInfo?.current?.humidity}</span>
					</h1>
					<div class="divider divider-horizontal" />

					<h1 class="text-2xl font-extrabold">
						Pressure(in) ⏱️ <span class="text-primary">{weatherInfo?.current?.pressure_in}</span>
					</h1>
					<div class="divider divider-horizontal" />
					<h1 class="text-2xl font-extrabold">
						Precipitation(mm) 🌧 <span class="text-primary">{weatherInfo?.current?.precip_mm}</span>
					</h1>
				</div>

				<h3 class="text-lg font-bold mt-12">Air Quality Index</h3>
				<div class="border p-8 rounded-lg">
					{#if weatherInfo}
						{@const aqi = parseInt(weatherInfo?.current?.air_quality['us-epa-index'])}
						<h3 class="text-3xl mb-4 text-center font-extrabold">{AQUSDefraIndex[aqi].meaning}</h3>
					{/if}
					<div
						class="w-full rounded-full h-4 relative"
						style="background: linear-gradient(90deg, #1DA53B 0%, #AA8500 19.57%, #A73C00 39.07%, #8F0000 59.82%, #990093 79.11%, #530005 100%);"
					>
						{#if weatherInfo}
							<span
								class="bg-gray-50 border h-10 w-10 rounded-full absolute shadow-lg top-1/2 -translate-y-1/2 flex items-center justify-center"
								style={`left: ${(() => {
									const aqi =
										(weatherInfo?.current?.air_quality['us-epa-index'] /
											Object.keys(AQUSDefraIndex).length) *
										100;

									return aqi >= 100 ? aqi - 4.5 : aqi;
								})()}%;`}
							>
								<h3 class="text-xl font-bold">
									{weatherInfo?.current?.air_quality['us-epa-index']}
								</h3>
							</span>
						{/if}
					</div>
					{#if weatherInfo}
						<div class="flex items-center mt-8 justify-between gap-8">
							<div class="card w-max bg-base-100 shadow-xl p-4">
								<h3 class="text-lg text-center">Carbon Monoxide</h3>
								<h1 class="text-3xl text-center">{weatherInfo?.current?.air_quality?.co}</h1>
							</div>
							<div class="card w-max bg-base-100 shadow-xl p-4">
								<h3 class="text-lg text-center">Ozone</h3>
								<h1 class="text-3xl text-center">{weatherInfo?.current?.air_quality?.o3}</h1>
							</div>
							<div class="card w-max bg-base-100 shadow-xl p-4">
								<h3 class="text-lg text-center">Nitrogen dioxide</h3>
								<h1 class="text-3xl text-center">{weatherInfo?.current?.air_quality?.no2}</h1>
							</div>
							<div class="card w-max bg-base-100 shadow-xl p-4">
								<h3 class="text-lg text-center">Sulphur dioxide</h3>
								<h1 class="text-3xl text-center">{weatherInfo?.current?.air_quality?.so2}</h1>
							</div>
						</div>
					{/if}
				</div>
				<h3 class="text-lg font-bold mt-8">Forecast</h3>
				<div class="flex w-full gap-4 ">
					<div class="flex-1 rounded-lg border px-8 py-4 flex items-center gap-4">
						{#if forecast}
							{#each forecast.forecastday as day}
								<div class="flex flex-col w-40">
									<h3 class="text-xl font-bold mb-4">{daysOfWeek[new Date(day.date).getDay()]}</h3>
									<div class="p-4 border rounded-md">
										<h3 class="text-md font-bold">{day?.day?.condition?.text}</h3>
										<img
											class="h-24 w-24 -ml-6 -my-2"
											src={day?.day?.condition?.icon}
											alt={day?.day?.condition?.text}
										/>
										<h3 class="text-3xl font-bold text-primary">{day?.day?.avgtemp_c}&deg;C</h3>
									</div>
								</div>
							{/each}
						{/if}
					</div>
				</div>
			</div>
		{/if}
		{#if !weatherInfo}
			<div>
				<h1 class="text-9xl font-extrabold">
					Please enter an
					<span class="text-primary">area</span>
				</h1>
			</div>
		{/if}
		{#if hasError}
			<div>
				<h1 class="text-xl font-extrabold">
					Something went <b class="text-red-700">wrong</b>
				</h1>
				<h1 class="text-9xl font-extrabold">
					Please enter a
					<span class="text-primary">valid</span> area
				</h1>
			</div>
		{/if}
	</div>
</div>
