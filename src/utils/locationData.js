let statesCache = null
let statesPromise = null

let citiesCache = null
let citiesPromise = null

export async function getBrazilStates() {
  if (statesCache) {
    return statesCache
  }

  if (!statesPromise) {
    statesPromise = fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then((response) => response.json())
      .then((data) => {
        statesCache = Array.isArray(data) ? data : []
        return statesCache
      })
      .catch(() => {
        statesPromise = null
        return []
      })
  }

  return statesPromise
}

export async function getBrazilCities() {
  if (citiesCache) {
    return citiesCache
  }

  if (!citiesPromise) {
    citiesPromise = import('../data/cidadesBR.json')
      .then((module) => {
        citiesCache = module.default || []
        return citiesCache
      })
      .catch(() => {
        citiesPromise = null
        return []
      })
  }

  return citiesPromise
}
