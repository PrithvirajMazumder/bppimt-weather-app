<script lang="ts">
	import { onMount } from 'svelte';
	import { getSavedLocations, saveLocation, updateLocation } from '$lib/services/LocationService';
	import clearNightImage from '$lib/images/Dark Cloudy Sky Photo.jpg';
	import { AQUSDefraIndex } from '$lib/constants/AQUSDefraIndex';
	import { format } from 'date-fns';


	const API_KEY: string = 'e6c675e37cb846b1b40163308240406';
	const BASE_URL: string = 'https://api.weatherapi.com/v1';
	const ENDPOINT: string = 'current.json';
	const FORECAST_ENDPOINT: string = 'forecast.json';
	const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

	let weatherInfo: any = null;
	let astroInfo: any = null;
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
			const astroInfoResp = await (
				await fetch(`${BASE_URL}/astronomy.json?q=${query}&dt=${format(new Date(), 'yyyy-MM-dd')}&key=${API_KEY}&&aqi=yes`)
			).json();

			//calling api of forecast weather info
			const respForecast = await (
				await fetch(`${BASE_URL}/${FORECAST_ENDPOINT}?q=${query}&days=5&key=${API_KEY}&&aqi=yes`)
			).json();
			weatherInfo = respWeatherInfo;
			forecast = respForecast.forecast;
			astroInfo = astroInfoResp;
			if (respWeatherInfo?.error) {
				hasError = respWeatherInfo?.error;
				return;
			}
			hasError = null;
			currentLocation = query;
		} catch (error) {
			alert('Something went wrong!');
			console.error(error);
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
			console.error(error);
		}
	};

	onMount(() => {
		savedLocations = getSavedLocations() ?? [];
		if ('geolocation' in window?.navigator) {
			console.log('is there');
			return window?.navigator?.geolocation?.getCurrentPosition((fetchedPosition) => {
				console.log('inside success');
				const latAndLong = `${fetchedPosition?.coords?.latitude} ${fetchedPosition?.coords?.longitude}`;
				currentLocation = latAndLong;
				void fetchWeatherInfo(latAndLong);
				void fetchHourlyForecast(latAndLong);
			}, () => {
				console.log('inside error');
				if (savedLocations?.length) {
					currentLocation = savedLocations[0];
					void fetchWeatherInfo(savedLocations[0]);
					void fetchHourlyForecast(savedLocations[0]);
				}
			});
		}
		if (savedLocations?.length) {
			currentLocation = savedLocations[0];
			void fetchWeatherInfo(savedLocations[0]);
			void fetchHourlyForecast(savedLocations[0]);
		}

	});
</script>

<div class="relative w-[100vw] h-[100vh]">
	<img alt="Weather condition background images" src={clearNightImage}
			 class="absolute top-0 left-0 w-full h-full object-cover" />
	<div class="absolute bg-black/60 w-full h-full top-0 left-0" />
	<div class="drawer lg:drawer-open">
		<input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
		<div class="drawer-content md:pt-6 p-2 md:p-0 md:pr-6 text-gray-200 relative">
			<!-- Page content here -->
			<div class="navbar bg-glass-morphic px-6 w-full flex items-center">
				<h1 class="text-xl">BPPIMT Weather</h1>
				<label for="my-drawer-2" class="md:hidden btn btn-ghost ml-auto pr-0">
					<svg class="w-6 h-6 text-gray-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24"
							 height="24" fill="none" viewBox="0 0 24 24">
						<path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M5 7h14M5 12h14M5 17h14" />
					</svg>
				</label>
			</div>
			{#if isLoading }
				<progress class="progress w-full"></progress>
			{/if}
			{#if weatherInfo}
				<div class="h-[calc(100svh-5.5rem)] flex gap-6 w-full items-start py-6">
					<div class="w-[100svw] md:w-[calc(100svw-45rem)] overflow-y-scroll h-full">
						<div class="flex gap-4 items-end -mb-8">
							<h1 class="text-xl md:text-4xl text-gray-300/70 break-all"><span
								class="text-sm">Current condition ☁ at</span>
								<br>{weatherInfo?.location?.name}, {weatherInfo?.location?.region}</h1>
							<button class="btn btn-xs capitalize btn-ghost mb-2" on:click={() => {
							saveLocation(weatherInfo?.location?.name)
							savedLocations = getSavedLocations() ?? [];
						}}>
								{#if savedLocations?.find((location) => location.toUpperCase() === weatherInfo?.location?.name?.toUpperCase())}
									<svg class="w-6 h-6 text-yellow-300" aria-hidden="true"
											 xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
											 viewBox="0 0 24 24">
										<path
											d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" />
									</svg>
								{:else }
									<svg class="w-6 h-6 text-gray-300" aria-hidden="true"
											 xmlns="http://www.w3.org/2000/svg"
											 width="24" height="24" fill="none" viewBox="0 0 24 24">
										<path stroke="currentColor" stroke-width="2"
													d="M11.083 5.104c.35-.8 1.485-.8 1.834 0l1.752 4.022a1 1 0 0 0 .84.597l4.463.342c.9.069 1.255 1.2.556 1.771l-3.33 2.723a1 1 0 0 0-.337 1.016l1.03 4.119c.214.858-.71 1.552-1.474 1.106l-3.913-2.281a1 1 0 0 0-1.008 0L7.583 20.8c-.764.446-1.688-.248-1.474-1.106l1.03-4.119A1 1 0 0 0 6.8 14.56l-3.33-2.723c-.698-.571-.342-1.702.557-1.771l4.462-.342a1 1 0 0 0 .84-.597l1.753-4.022Z" />
									</svg>
								{/if}
							</button>

						</div>
						<h1
							class="text-6xl md:text-[6rem] break-words my-10 md:my-16 leading-[1]">{weatherInfo?.current?.condition?.text}</h1>
						<div class="mb-6 bg-glass-morphic p-6 block md:hidden">
							<h1 class="text-6xl font-semibold mb-8">
								{weatherInfo?.current?.temp_c}°c
							</h1>
							<p class="text-lg -mt-6">Feels like {weatherInfo?.current?.feelslike_c}°c</p>
							<span
								class="bg-glass-morphic my-4 !rounded-[50px] w-full px-3 py-1 flex items-center">Wind 💨 direction <span
								class="font-semibold mx-1">{weatherInfo?.current?.wind_dir}</span></span>
							<div class="flex flex-col w-full gap-4">
								{#if forecast}
									{#each forecast.forecastday as day}
										<div class="flex items-center w-full gap-2">
											<div class="h-12 w-12 flex flex-col justify-center items-center bg-glass-morphic">
												<img
													class="h-8 w-8"
													src={day?.day?.condition?.icon}
													alt={day?.day?.condition?.text}
												/>
											</div>
											<div>
												<h3 class="text-md text-gray-300">
													{daysOfWeek[new Date(day.date).getDay()]}
												</h3>
												<h3 class="text-xs text-gray-300/50">{day?.day?.condition?.text}</h3>

											</div>

											<h3 class="text-md font-semibold text-gray-300 ml-auto">{Math.trunc(day?.day?.avgtemp_c ?? 0)}
												&deg;</h3>
										</div>
									{/each}
								{/if}
								<div class=" mt-4 w-full bg-glass-morphic p-4">
									<div class="flex flex-col items-center w-full px-4">
										<p class="text-gray-300/40 text-p mb-2">Sun duration</p>
										<div class="bg-gray-300/30 h-1 rounded-full w-full relative mb-4" />
									</div>
									<div class="flex w-full items-center  justify-between gap-2">
										<div class="flex flex-col items-center">
											<svg class="w-4 h-4 text-gray-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
													 width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
												<path fill-rule="evenodd"
															d="M13 3a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0V3ZM6.343 4.929A1 1 0 0 0 4.93 6.343l1.414 1.414a1 1 0 0 0 1.414-1.414L6.343 4.929Zm12.728 1.414a1 1 0 0 0-1.414-1.414l-1.414 1.414a1 1 0 0 0 1.414 1.414l1.414-1.414ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm-9 4a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2H3Zm16 0a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2h-2ZM7.757 17.657a1 1 0 1 0-1.414-1.414l-1.414 1.414a1 1 0 1 0 1.414 1.414l1.414-1.414Zm9.9-1.414a1 1 0 0 0-1.414 1.414l1.414 1.414a1 1 0 0 0 1.414-1.414l-1.414-1.414ZM13 19a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2Z"
															clip-rule="evenodd" />
											</svg>
											<p class="text-gray-300">{astroInfo?.astronomy?.astro?.sunrise}</p>
										</div>

										{#if astroInfo}
											<div class="flex flex-col items-center">
												<svg class="w-4 h-4 text-gray-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
														 width="24"
														 height="24" fill="none" viewBox="0 0 24 24">
													<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
																d="M12 5V3m0 18v-2M7.05 7.05 5.636 5.636m12.728 12.728L16.95 16.95M5 12H3m18 0h-2M7.05 16.95l-1.414 1.414M18.364 5.636 16.95 7.05M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
												</svg>
												<p class="text-gray-300">{astroInfo?.astronomy?.astro?.sunset}</p>
											</div>
										{/if}
									</div>
								</div>
							</div>
						</div>
						<div class="flex gap-4 overflow-x-scroll">
							<div class="bg-glass-morphic p-4 w-full">
								<p class="️text-sm text-gray-300/30 mb-4">💨 Wind</p>
								<h3 class="text-5xl">{weatherInfo?.current?.wind_kph}Kph</h3>
							</div>
							<div class="bg-glass-morphic p-4 w-full">
								<p class="️text-sm text-gray-300/30 mb-4">💧 Humidity</p>
								<h3 class="text-5xl">{weatherInfo?.current?.humidity}%</h3>
							</div>
							<div class="bg-glass-morphic p-4 w-full">
								<p class="️text-sm text-gray-300/30 mb-4">📏 Pressure(in)</p>
								<h3 class="text-5xl">{weatherInfo?.current?.pressure_in}</h3>
							</div>
							<div class="bg-glass-morphic p-4 w-full">
								<p class="️text-sm text-gray-300/30 mb-4">🌧️ Precipitation</p>
								<h3 class="text-5xl">{weatherInfo?.current?.precip_mm}mm</h3>
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
								<div class="flex items-center mt-8 justify-between gap-8 overflow-x-scroll">
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
						<div class="bg-glass-morphic w-full p-6 mt-6">
							<p class="text-lg text-gray-300/50">Hourly forecast</p>
							<div class="divider my-0" />
							<div
								class="flex items-center w-full overflow-x-scroll mt-2"
							>
								{#if hourlyForecast}
									{#each hourlyForecast as hourly}
										<div class="flex flex-col min-w-[5rem] items-center">
											<p class="text-gray-300/60">
												{format(new Date(hourly?.forecast?.forecastday[0]?.hour[0]?.time ?? ''), 'h aa')}
											</p>
											<img
												class="h-[2rem] w-[2rem]"
												src={hourly?.forecast?.forecastday[0]?.hour[0]?.condition?.icon}
												alt="Weather condition icon"
											/>
											<p
												class="font-semibold text-gray-300/60 text-lg">{Math.trunc(hourly?.forecast?.forecastday[0]?.hour[0]?.temp_c ?? 0)}{'°'}</p>
										</div>
									{/each}

								{/if}

							</div>
						</div>
						{#if weatherInfo}
							<div class="hidden md:block mt-6 bg-glass-morphic p-6 h-max w-full">
								<iframe width="100%" height="300" class="rounded-lg"
												src="https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=default&metricTemp=default&metricWind=default&zoom=100&overlay=radar&product=radar&level=surface&lat={weatherInfo?.location?.lat}&lon={weatherInfo?.location?.lon}&pressure=true&message=true"
												frameborder="0" />

							</div>
							<div class="block md:hidden mt-6 bg-glass-morphic p-6 h-max w-full">
								<iframe width="100%" height="300" class="rounded-lg"
												src="https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=default&metricTemp=default&metricWind=default&zoom=100&overlay=radar&product=radar&level=surface&lat={weatherInfo?.location?.lat}&lon={weatherInfo?.location?.lon}&pressure=true&message=true"
												frameborder="0" />

							</div>
						{/if}
					</div>
					<div
						class="hidden md:flex w-96 h-full overflow-y-scroll bg-glass-morphic p-6 text-gray-300 flex-col items-start gap-4">
						<h1 class="text-8xl font-semibold leading-[0] mt-12 mb-8">
							{weatherInfo?.current?.temp_c}°c
						</h1>
						<p class="text-lg">Feels like {weatherInfo?.current?.feelslike_c}°c</p>
						<span class="bg-glass-morphic !rounded-[50px] w-full px-3 py-1 flex items-center">Wind 💨 direction <span
							class="font-semibold mx-1">{weatherInfo?.current?.wind_dir}</span></span>
						<div class="flex flex-col w-full gap-4">
							{#if forecast}
								{#each forecast.forecastday as day}
									<div class="flex items-center w-full gap-2">
										<div class="h-12 w-12 flex flex-col justify-center items-center bg-glass-morphic">
											<img
												class="h-8 w-8"
												src={day?.day?.condition?.icon}
												alt={day?.day?.condition?.text}
											/>
										</div>
										<div>
											<h3 class="text-md text-gray-300">
												{daysOfWeek[new Date(day.date).getDay()]}
											</h3>
											<h3 class="text-xs text-gray-300/50">{day?.day?.condition?.text}</h3>

										</div>

										<h3 class="text-md font-semibold text-gray-300 ml-auto">{Math.trunc(day?.day?.avgtemp_c ?? 0)}
											&deg;</h3>
									</div>
								{/each}
							{/if}
						</div>
						<div class=" mt-4 w-full bg-glass-morphic p-4">
							<div class="flex flex-col items-center w-full px-4">
								<p class="text-gray-300/40 text-p mb-2">Sun duration</p>
								<div class="bg-gray-300/30 h-1 rounded-full w-full relative mb-4" />
							</div>
							<div class="flex w-full items-center  justify-between gap-2">
								<div class="flex flex-col items-center">
									<svg class="w-4 h-4 text-gray-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
											 width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
										<path fill-rule="evenodd"
													d="M13 3a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0V3ZM6.343 4.929A1 1 0 0 0 4.93 6.343l1.414 1.414a1 1 0 0 0 1.414-1.414L6.343 4.929Zm12.728 1.414a1 1 0 0 0-1.414-1.414l-1.414 1.414a1 1 0 0 0 1.414 1.414l1.414-1.414ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm-9 4a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2H3Zm16 0a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2h-2ZM7.757 17.657a1 1 0 1 0-1.414-1.414l-1.414 1.414a1 1 0 1 0 1.414 1.414l1.414-1.414Zm9.9-1.414a1 1 0 0 0-1.414 1.414l1.414 1.414a1 1 0 0 0 1.414-1.414l-1.414-1.414ZM13 19a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2Z"
													clip-rule="evenodd" />
									</svg>
									<p class="text-gray-300">{astroInfo?.astronomy?.astro?.sunrise}</p>
								</div>

								{#if astroInfo}
									<div class="flex flex-col items-center">
										<svg class="w-4 h-4 text-gray-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24"
												 height="24" fill="none" viewBox="0 0 24 24">
											<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
														d="M12 5V3m0 18v-2M7.05 7.05 5.636 5.636m12.728 12.728L16.95 16.95M5 12H3m18 0h-2M7.05 16.95l-1.414 1.414M18.364 5.636 16.95 7.05M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
										</svg>
										<p class="text-gray-300">{astroInfo?.astronomy?.astro?.sunset}</p>
									</div>
								{/if}
							</div>
						</div>

					</div>
				</div>
			{/if}
		</div>
		<div class="drawer-side md:p-6">
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
					<svg class="w-4 h-4 text-gray-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
							 width="24" height="24" fill="none" viewBox="0 0 24 24">
						<path stroke="currentColor" stroke-linecap="round" stroke-width="2"
									d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
					</svg>
				</label></form>
				<div class="divider" />
				<p class="text-xs text-gray-300/30 mb-4 pl-3">Saved locations</p>
				{#each savedLocations as location, index}
					<li on:click={() => {
						fetchWeatherInfo(location.toLowerCase());
						fetchHourlyForecast(location.toLowerCase());
					}}>
						<p class="capitalize text-gray-300 hover:text-gray-300">{location?.toLowerCase()}
							<svg on:click|stopPropagation={() => {
savedLocations = [...savedLocations?.filter((_, savedIndex) => index !== savedIndex)]
								updateLocation(savedLocations)
							}} class="w-6 h-6 text-gray-300/30 hover:text-gray-300 ml-auto" aria-hidden="true"
									 xmlns="http://www.w3.org/2000/svg"
									 width="24" height="24" fill="none" viewBox="0 0 24 24">
								<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
											d="M5 12h14" />
							</svg>
						</p>

					</li>
				{/each}
			</ul>

		</div>
	</div>
</div>
