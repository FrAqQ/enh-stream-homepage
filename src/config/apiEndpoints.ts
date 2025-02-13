
export const API_ENDPOINTS = [
  "v220250171253310506.hotsrv.de",
  "v2202501252999311567.powersrv.de"
];

let currentEndpointIndex = 0;

export const getNextEndpoint = () => {
  const endpoint = API_ENDPOINTS[currentEndpointIndex];
  currentEndpointIndex = (currentEndpointIndex + 1) % API_ENDPOINTS.length;
  return endpoint;
};

