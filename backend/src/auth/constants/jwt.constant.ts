export const jwtConstants = {
  secret:
    process.env.JWT_SECRET ??
    'NestJS is awesome! Change this secret in production',
};
