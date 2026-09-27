import bcrypt from 'bcrypt';
import { AppError } from '../errors/AppError.js';
import { createUser, findUserByEmail } from '../repositories/usersRepository.js';

const passwordCost = 12;

export async function registerUser({ email, password }) {
  const passwordHash = await bcrypt.hash(password, passwordCost);

  try {
    return await createUser(email, passwordHash);
  } catch (error) {
    if (error.code === '23505') {
      throw new AppError(409, 'an account with this email already exists');
    }

    throw error;
  }
}

export async function authenticateUser({ email, password }) {
  const user = await findUserByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError(401, 'email or password is incorrect');
  }

  return { id: user.id, email: user.email };
}
