import client from "./client";

export const getScenarios = () => client.get("/demo/scenarios");

export const getScenarioById = (id) =>
  client.get(`/demo/scenarios/${id}`);
