const LOCATIONS_KEY_KEY = 'SAVED_LOCATIONS';

export const saveLocation = (location: string) => {
	const savedLocations = getSavedLocations();
	if (
		savedLocations?.find((savedLocation) => location.toUpperCase() === savedLocation.toUpperCase())
	) {
		return;
	}
	localStorage.setItem(LOCATIONS_KEY_KEY, JSON.stringify({ locations: [...savedLocations, location] }));
};

export const getSavedLocations = (): string[] => {
	const locations = localStorage.getItem(LOCATIONS_KEY_KEY);
	if (!locations?.length) {
		return [];
	}

	console.log(locations);
	return JSON.parse(locations).locations as string[];
};

export const updateLocation = (updatedLocation: string[]) => {
	return localStorage.setItem(LOCATIONS_KEY_KEY, JSON.stringify({ locations: updatedLocation }))
}
