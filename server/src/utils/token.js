import jwt from 'jsonwebtoken';

export function signToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name
    },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '1d' }
  );
}
