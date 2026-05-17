export function normalizeUser(u: string) {
  return String(u || "").trim().toLowerCase();
}

export function getAlanIdentifier() {
  return normalizeUser(process.env.ALAN_IDENTIFIER || "alan");
}

export function isAlanUser(username: string) {
  return normalizeUser(username) === getAlanIdentifier();
}

export function getAlanEmail() {
  return process.env.ALAN_EMAIL || "areadereunion@gmail.com";
}

export function getFabricioEmail() {
  return process.env.FABRICIO_EMAIL || "anahijsb04@gmail.com";
}
