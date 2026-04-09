export const isAdmin = (email?: string | null) => {
  if (!email) return false;

  const admins = process.env.ADMIN_EMAILS?.split(",") || [];

  return admins.includes(email);
};