export const sendTokenCookie = (
  res,
  token,
) => {
  const isProduction =
    process.env.NODE_ENV ===
    'production';

  res.cookie(
    'auth_token',
    token,
    {
      httpOnly: true,

      secure:
        isProduction,

      sameSite:
        isProduction
          ? 'none'
          : 'lax',

      path: '/',

      maxAge:
        7 *
        24 *
        60 *
        60 *
        1000,
    },
  );
};