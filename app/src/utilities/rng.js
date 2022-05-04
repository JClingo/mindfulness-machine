// generates a random integer from given range (non-inclusive)
// e.g., min of 0 and max of 3 will yield a 0, 1, or 2
export function randomInt (min, max) {
    return Math.trunc(Math.random() * (max - min) + min);
  }