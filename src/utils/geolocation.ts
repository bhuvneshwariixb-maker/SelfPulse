// Geolocation utility
export const geoLocation = {
  isAvailable: () => {
    return 'geolocation' in navigator
  },

  getCurrentPosition: (options?: PositionOptions): Promise<GeolocationCoordinates> => {
    return new Promise((resolve, reject) => {
      if (!geoLocation.isAvailable()) {
        reject(new Error('Geolocation not available'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position.coords),
        (error) => reject(error),
        options
      )
    })
  },

  watchPosition: (callback: (coords: GeolocationCoordinates) => void, options?: PositionOptions): number => {
    if (!geoLocation.isAvailable()) {
      console.error('Geolocation not available')
      return -1
    }

    return navigator.geolocation.watchPosition(
      (position) => callback(position.coords),
      (error) => console.error('Geolocation watch error:', error),
      options
    )
  },

  clearWatch: (watchId: number) => {
    if (watchId >= 0) {
      navigator.geolocation.clearWatch(watchId)
    }
  },
}
