export interface RootCity {
  cities: City[]
  meta: Meta
}

export interface City {
  id: number
  code: string
  continent: Continent
  country: Country
  county: any
  latitude: string
  longitude: string
  name: string
  postcode: any
  state: State
}

export interface Continent {
  code: string
  latitude: string
  longitude: string
  name: string
  nameEs: string
  nameFr: string
}

export interface Country {
  code: string
  latitude: string
  longitude: string
  name: string
  nameEs: string
  nameFr: string
}

export interface State {
  code: string
  latitude: string
  longitude: string
  name: string
}

export interface Meta {
  currentPage: number
  firstPage: number
  lastPage: number
  perPage: number
  total: number
}

export interface User {
  status: string
  country: string
  countryCode: string
  region: string
  regionName: string
  city: string
  zip: string
  lat: number
  lon: number
  timezone: string
  isp: string
  org: string
  as: string
  query: string
}

export interface Weather {
  cod: string
  message: number
  cnt: number
  list: {
    dt: number
    main: {
      temp: number
      feels_like: number
      temp_min: number
      temp_max: number
      pressure: number
      sea_level: number
      grnd_level: number
      humidity: number
      temp_kf: number
    }
    weather: {
      id: number
      main: string
      description: string
      icon: string
    }[]
    clouds: {
      all: number
    }
    wind: {
      speed: number
      deg: number
      gust: number
    }
    visibility: number
    pop: number
    sys: {
      pod: string
    }
    dt_txt: string
  }[]
  city: {
    id: number
    name: string
    coord: {
      lat: number
      lon: number
    }
    country: string
    population: number
    timezone: number
    sunrise: number
    sunset: number
  }
}
