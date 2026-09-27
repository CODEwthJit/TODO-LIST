function invalid(message) {
  return { success: false, message };
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function parseCredentials(input, requireRegistrationPassword) {
  if (!isObject(input)) {
    return invalid('request body must be a JSON object');
  }

  if (typeof input.email !== 'string') {
    return invalid('email must be a valid email address');
  }

  const email = input.email.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return invalid('email must be a valid email address');
  }

  if (typeof input.password !== 'string' || input.password.length === 0) {
    return invalid('password is required');
  }

  if (requireRegistrationPassword && input.password.length < 8) {
    return invalid('password must contain at least 8 characters');
  }

  if (Buffer.byteLength(input.password, 'utf8') > 72) {
    return invalid('password must be no more than 72 bytes');
  }

  return { success: true, data: { email, password: input.password } };
}

export const registerBodySchema = {
  safeParse(input) {
    return parseCredentials(input, true);
  },
};

export const loginBodySchema = {
  safeParse(input) {
    return parseCredentials(input, false);
  },
};
