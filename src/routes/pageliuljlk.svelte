<script lang="ts">
	import { AQUSDefraIndex } from '$lib/constants/AQUSDefraIndex';
	import { format } from 'date-fns';
	import { onMount } from 'svelte';
	import { getSavedLocations, saveLocation } from '$lib/services/LocationService';
	import clearNightImage from '$lib/images/Clear Night Weather.jpg'


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
			const resp = await Promise.all(
				new Array(24).fill(0).map(async (_, index) => {
					return await (
						await fetch(
							`${BASE_URL}/${FORECAST_ENDPOINT}?q=${query}&days=1&hour=${index}&key=${API_KEY}&&aqi=yes`
						)
					).json();
				})
			);
			hourlyForecast = resp;
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
				// @ts-ignore
				fetchHourlyForecast(event?.target?.weatherQuery?.value);
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
	<div class="flex items-start w-full h-[calc(100svh-4rem)]">
		<div class="w-72 bg-base-200 h-full p-4">
			<h1 class="text-2xl font-semibold text-gray-500 overflow-y-scroll">Saved Area</h1>
			<div class="flex flex-col items-start gap-2 mt-4">
				{#each savedLocations as location}
					<h1 on:click={() => {
						fetchWeatherInfo(location.toLowerCase());
						fetchHourlyForecast(location.toLowerCase());
					}} class="text-2xl font-bold cursor-pointer capitalize">{location}</h1>
				{/each}
			</div>
		</div>
		<div class="flex flex-col h-full items-start relative w-full overflow-y-scroll p-6">
			{#if isLoading}
				<progress class="progress w-full progress-primary absolute top-0 right-0 rounded-none" />
			{/if}
			{#if weatherInfo && !hasError}
				<div class="mt-[10rem]">
					<div class="flex items-center">
						<h1 class="text-xl text-gray-300/10 font-extrabold">
							Current weather ☁️ at <b>{weatherInfo?.location?.name}</b>
						</h1>
						<button class="btn btn-ghost" on:click={() => {
							saveLocation(currentLocation)
							savedLocations = getSavedLocations() ?? [];
						}}>
							{#if savedLocations?.find((location) => location.toUpperCase() === currentLocation.toUpperCase())}
								<svg class="w-6 h-6 text-yellow-300 dark:text-white" aria-hidden="true"
										 xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
									<path
										d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" />
								</svg>
							{:else}
								<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
										 width="24" height="24" fill="none" viewBox="0 0 24 24">
									<path stroke="currentColor" stroke-width="2"
												d="M11.083 5.104c.35-.8 1.485-.8 1.834 0l1.752 4.022a1 1 0 0 0 .84.597l4.463.342c.9.069 1.255 1.2.556 1.771l-3.33 2.723a1 1 0 0 0-.337 1.016l1.03 4.119c.214.858-.71 1.552-1.474 1.106l-3.913-2.281a1 1 0 0 0-1.008 0L7.583 20.8c-.764.446-1.688-.248-1.474-1.106l1.03-4.119A1 1 0 0 0 6.8 14.56l-3.33-2.723c-.698-.571-.342-1.702.557-1.771l4.462-.342a1 1 0 0 0 .84-.597l1.753-4.022Z" />
								</svg>
							{/if}
						</button>
					</div>
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
							Precipitation(mm) 🌧 <span class="text-primary">{weatherInfo?.current?.precip_mm}</span
						>
						</h1>
					</div>

					<h3 class="text-lg font-bold mt-12">Hourly forecast</h3>
					<div
						class="border p-8 rounded-lg flex items-center gap-4 w-[calc(100svw-56rem)] overflow-x-scroll"
					>
						{#each hourlyForecast as hourly}
							<div class="border p-4 rounded-md flex flex-col min-w-[8rem] items-center">
								<p class="font-bold">
									{format(new Date(hourly?.forecast?.forecastday[0]?.hour[0]?.time ?? ''), 'h aa')}
								</p>
								<img
									class="h-[5rem] w-[5rem]"
									src={hourly?.forecast?.forecastday[0]?.hour[0]?.condition?.icon}
									alt="Weather condition icon"
								/>
								<p class="font-bold text-lg">{hourly?.forecast?.forecastday[0]?.hour[0]?.temp_c}</p>
							</div>
						{/each}
					</div>

					<h3 class="text-lg font-bold mt-12">Air Quality Index</h3>
					<div class="border p-8 rounded-lg w-[calc(100svw-56rem)]">
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
					<div class="flex w-[calc(100svw-56rem)] gap-4">
						<div class="flex-1 rounded-lg border px-8 py-4 flex items-center gap-4">
							{#if forecast}
								{#each forecast.forecastday as day}
									<div class="flex flex-col w-40">
										<h3 class="text-xl font-bold mb-4">
											{daysOfWeek[new Date(day.date).getDay()]}
										</h3>
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
					{#if weatherInfo}
						<h3 class="text-2xl">Windy Map</h3>
						<div>
							<iframe width="650" height="450"
											src="https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=default&metricTemp=default&metricWind=default&zoom=100&overlay=radar&product=radar&level=surface&lat={weatherInfo?.location?.lat}&lon={weatherInfo?.location?.lon}&pressure=true&message=true"
											frameborder="0" />
						</div>
					{/if}
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
</div>
