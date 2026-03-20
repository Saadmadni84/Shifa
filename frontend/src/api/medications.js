import apiClient from './client'

export const getMedications = async () => {
  const { data } = await apiClient.get('/medications')
  return data
}

export const searchMedications = async (query) => {
  const { data } = await apiClient.get(`/medications/search?q=${query}`)
  return data
}
