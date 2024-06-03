<script lang="ts">
	import { onMount } from 'svelte';
	import { getSavedLocations, saveLocation } from '$lib/services/LocationService';
	import clearNightImage from '$lib/images/Dark Cloudy Sky Photo.jpg';
	import { AQUSDefraIndex } from '$lib/constants/AQUSDefraIndex';


	const API_KEY: string = 'fa026116b11a4b7ca30194511242704';
	const BASE_URL: string = 'https://api.weatherapi.com/v1';
	const ENDPOINT: string = 'current.json';
	const FORECAST_ENDPOINT: string = 'forecast.json';
	const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

	let weatherInfo: any = null;
	let forecast: any = null;
	let isLoading: boolean;
	let hasError: unknown;
	let hourlyForecast: any[] = [];
	let savedLocations: string[] = [];
	let currentLocation: string;

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
			currentLocation = query;
		} catch (error) {
			alert('Something went wrong!');
		} finally {
			isLoading = false;
		}
	};

	const fetchHourlyForecast = async (query: string) => {
		hourlyForecast = [];
		try {
			hourlyForecast = await Promise.all(
				new Array(24).fill(0).map(async (_, index) => {
					return await (
						await fetch(
							`${BASE_URL}/${FORECAST_ENDPOINT}?q=${query}&days=1&hour=${index}&key=${API_KEY}&&aqi=yes`
						)
					).json();
				})
			);
		} catch (error) {
			alert('Something went wrong');
		}
	};

	onMount(() => {
		savedLocations = getSavedLocations() ?? [];
		if (savedLocations?.length) {
			currentLocation = savedLocations[0];
			void fetchWeatherInfo(savedLocations[0]);
			void fetchHourlyForecast(savedLocations[0]);
		}
	});
</script>

<div class="relative w-[100svw] h-[100svh]">
	<img alt="Weather condition background images" src={clearNightImage}
			 class="absolute top-0 left-0 w-full h-full object-cover" />
	<div class="absolute bg-black/60 w-full h-full top-0 left-0" />
	<div class="drawer lg:drawer-open">
		<input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
		<div class="drawer-content pt-6 pr-6 text-gray-200 relative">
			<!-- Page content here -->
			<div class="navbar bg-glass-morphic px-6">
				<h1 class="text-xl">BPPIMT Weather</h1>
			</div>
			<div class="h-[calc(100%-5.5rem)] overflow-y-scroll flex gap-6 w-full items-start pt-6">
				<div class="w-full">
					<div class="flex gap-4 items-end -mb-8">
						<h1 class="text-4xl text-gray-300/70 break-all"><span class="text-sm">Current condition ☁ at</span>
							<br>{weatherInfo?.location?.name}, {weatherInfo?.location?.region}</h1>
						<button class="btn btn-xs capitalize btn-ghost mb-2" on:click={() => {
							saveLocation(currentLocation)
							savedLocations = getSavedLocations() ?? [];
						}}>
							{#if savedLocations?.find((location) => location.toUpperCase() === currentLocation.toUpperCase())}
								<svg class="w-6 h-6 text-yellow-300 dark:text-white" aria-hidden="true"
										 xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
									<path
										d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" />
								</svg>
							{:else }
								<svg class="w-6 h-6 text-gray-300 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
										 width="24" height="24" fill="none" viewBox="0 0 24 24">
									<path stroke="currentColor" stroke-width="2"
												d="M11.083 5.104c.35-.8 1.485-.8 1.834 0l1.752 4.022a1 1 0 0 0 .84.597l4.463.342c.9.069 1.255 1.2.556 1.771l-3.33 2.723a1 1 0 0 0-.337 1.016l1.03 4.119c.214.858-.71 1.552-1.474 1.106l-3.913-2.281a1 1 0 0 0-1.008 0L7.583 20.8c-.764.446-1.688-.248-1.474-1.106l1.03-4.119A1 1 0 0 0 6.8 14.56l-3.33-2.723c-.698-.571-.342-1.702.557-1.771l4.462-.342a1 1 0 0 0 .84-.597l1.753-4.022Z" />
								</svg>
							{/if}
						</button>

					</div>
					<h1 class="text-[10rem] break-all">{weatherInfo?.current?.condition?.text}</h1>
					<div class="flex gap-4">
						<div class="bg-glass-morphic p-4 w-full">
							<p class="️text-sm text-gray-300/30 mb-4">🌡 Feels like</p>
							<h3 class="text-5xl">{weatherInfo?.current?.feelslike_c}°c</h3>
						</div>
						<div class="bg-glass-morphic p-4 w-full">
							<p class="️text-sm text-gray-300/30 mb-4">💨 Wind</p>
							<h3 class="text-5xl">{weatherInfo?.current?.wind_kph}</h3>
						</div>
						<div class="bg-glass-morphic p-4 w-full">
							<p class="️text-sm text-gray-300/30 mb-4">💧 Humidity</p>
							<h3 class="text-5xl">{weatherInfo?.current?.humidity}</h3>
						</div>
						<div class="bg-glass-morphic p-4 w-full">
							<p class="️text-sm text-gray-300/30 mb-4">📏 Pressure(in)</p>
							<h3 class="text-5xl">{weatherInfo?.current?.pressure_in}</h3>
						</div>
						<div class="bg-glass-morphic p-4 w-full">
							<p class="️text-sm text-gray-300/30 mb-4">🌧️ Precipitation</p>
							<h3 class="text-5xl">{weatherInfo?.current?.precip_mm}</h3>
						</div>
					</div>
					<div class="border p-8 rounded-lg w-full mt-6 bg-glass-morphic">
						{#if weatherInfo}
							{@const aqi = parseInt(weatherInfo?.current?.air_quality['us-epa-index'])}
							<h3 class="text-3xl mb-4 text-center font-extrabold">
								{AQUSDefraIndex[aqi].meaning}
							</h3>
						{/if}
						<div
							class="w-full rounded-full h-4 relative"
							style="background: linear-gradient(90deg, #1DA53B 0%, #AA8500 19.57%, #A73C00 39.07%, #8F0000 59.82%, #990093 79.11%, #530005 100%);"
						>
							{#if weatherInfo}
								<span
									class="bg-gray-50/60 text-gray-700 border h-10 w-10 rounded-full absolute shadow-lg top-1/2 -translate-y-1/2 flex items-center justify-center"
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
								<div class="card w-full bg-glass-morphic shadow-xl p-4">
									<h3 class="text-lg text-center">Carbon Monoxide</h3>
									<h1 class="text-3xl text-center">{weatherInfo?.current?.air_quality?.co}</h1>
								</div>
								<div class="card w-full bg-glass-morphic shadow-xl p-4">
									<h3 class="text-lg text-center">Ozone</h3>
									<h1 class="text-3xl text-center">{weatherInfo?.current?.air_quality?.o3}</h1>
								</div>
								<div class="card w-full bg-glass-morphic shadow-xl p-4">
									<h3 class="text-lg text-center">Nitrogen dioxide</h3>
									<h1 class="text-3xl text-center">{weatherInfo?.current?.air_quality?.no2}</h1>
								</div>
								<div class="card w-full bg-glass-morphic shadow-xl p-4">
									<h3 class="text-lg text-center">Sulphur dioxide</h3>
									<h1 class="text-3xl text-center">{weatherInfo?.current?.air_quality?.so2}</h1>
								</div>
							</div>
						{/if}
					</div>
				</div>
				<div
					class="w-96 h-full bg-glass-morphic p-6 text-gray-300 flex flex-col items-start gap-4">
					<h1 class="text-8xl font-semibold">
						{weatherInfo?.current?.temp_c}°c
					</h1>
				</div>
			</div>
		</div>
		<div class="drawer-side p-6">
			<label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"></label>
			<ul class="menu p-4 w-60 min-h-full text-base-100 rounded-xl bg-glass-morphic">
				<!-- Sidebar content here -->
				<form on:submit|preventDefault={(event) => {
				// @ts-ignore
				fetchWeatherInfo(event?.target?.weatherQuery?.value);
				// @ts-ignore
				fetchHourlyForecast(event?.target?.weatherQuery?.value);
			}}><label class="input input-xs bg-transparent text-gray-300 flex items-center gap-2">
					<input name="weatherQuery" type="text" class="grow bg-transparent" placeholder="Search" />
					<svg class="w-4 h-4 text-gray-300 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
							 width="24" height="24" fill="none" viewBox="0 0 24 24">
						<path stroke="currentColor" stroke-linecap="round" stroke-width="2"
									d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
					</svg>
				</label></form>
				<div class="divider" />
				<p class="text-xs text-gray-300/30 mb-4 pl-3">Saved locations</p>
				{#each savedLocations as location}
					<li on:click={() => {
						fetchWeatherInfo(location.toLowerCase());
						fetchHourlyForecast(location.toLowerCase());
					}}><p class="capitalize hover:text-gray-300">{location?.toLowerCase()}</p></li>
				{/each}
			</ul>

		</div>
	</div>
</div>
