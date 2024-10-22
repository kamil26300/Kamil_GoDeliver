const calculatePrice = (distance, vehicle) => {
  // Calculate the fare based on distance
  const { basePrice, pricePerKm } = vehicle
  let fare = basePrice + (distance * pricePerKm);
  
  // Apply surge pricing if it's a peak hour (assuming 1.5x surge between 5 PM and 9 PM)
  const currentHour = new Date().getHours();
  if ((currentHour >= 20 && currentHour <= 24) || (currentHour >= 0 && currentHour <= 6)) {
    fare *= 1.5;
  }
  
  return Math.round(fare);
};

module.exports = {
  calculatePrice
};