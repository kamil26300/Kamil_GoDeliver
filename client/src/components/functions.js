export const convertHH = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  let result = "";
  if (hours > 0) result += `${hours} Hr `;
  result += `${minutes} Min`;

  return result;
};