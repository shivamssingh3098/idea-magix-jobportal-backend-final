function generateUniqueId() {
  // Get current timestamp
  const timestamp = new Date().getTime();

  // Generate a random number between 100000 and 999999
  const randomNum = Math.floor(Math.random() * 900000) + 100000;

  // Combine timestamp and random number to create a unique ID
  const uniqueId = timestamp.toString() + randomNum.toString();

  // Take the last 6 digits to ensure a 6-digit code
  const sixDigitId = uniqueId.slice(-6);

  return sixDigitId;
}

// Example usage
// const uniqueId = generateUniqueId();
// console.log(uniqueId);
export { generateUniqueId };
