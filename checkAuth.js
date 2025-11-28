export function checkAuth(ctx) {
  const token = ctx.req.cookies.token || null;

  if (!token) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return { props: {} };
}
