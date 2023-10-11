<script lang="ts">
	const API_KEY: string = '8fdfb33b017b44198ae181451231109';
	const BASE_URL: string = 'https://api.weatherapi.com/v1';
	const ENDPOINT: string = 'current.json';
	let weatherInfo: any = null;
	let isLoading: boolean;
	let hasError: unknown;

	const fetchWeatherInfo = async (query: string) => {
		try {
			isLoading = true;
			const resp = await (
				await fetch(
					`${BASE_URL}/${ENDPOINT}?q=${query}&key=${API_KEY}`
				)
			).json();
			weatherInfo = resp;

			if (resp?.error) {
				hasError = resp?.error;
				return;
			}
			hasError = null;
		} catch (error) {
			alert('Something went wrong!');
		} finally {
			isLoading = false;
		}
	};

	$: {
		console.log('weatherInfo: ', weatherInfo);
	}
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
	<div class="flex flex-col items-center justify-center h-[calc(100svh-4rem)] relative">
		{#if isLoading}
			<progress class="progress w-full progress-primary absolute top-0 right-0 rounded-none" />
		{/if}
		{#if weatherInfo && !hasError}
			<div>
				<h1 class="text-xl font-extrabold">
					Current weather ☁️ at <b>{weatherInfo?.location?.name}</b>
				</h1>
				<h1 class="text-9xl font-extrabold">
					<span class="text-primary">{weatherInfo?.current?.temp_c}</span> centigrade
				</h1>
				<div class="flex items-center mt-6">
					<h1 class="text-xl font-extrabold">
						Feels like <span class="text-primary">{weatherInfo?.current?.feelslike_c}</span> centigrade
					</h1>
					<div class="divider divider-horizontal" />
					<h1 class="text-xl font-extrabold">
						Wind 💨 <span class="text-primary">{weatherInfo?.current?.wind_kph}</span>kph
					</h1>
					<div class="divider divider-horizontal" />
					<h1 class="text-xl font-extrabold">
						Humidity 💦 <span class="text-primary">{weatherInfo?.current?.humidity}</span>
					</h1>
				</div>
			</div>
		{/if}
		{#if !weatherInfo}
			<div>
				<h1 class="text-9xl font-extrabold">
					Please enter a
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
