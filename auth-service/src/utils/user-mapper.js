export const toPublicUser = (user) => ({
  role: user.role,
  name: user.name,
  userName: user.userName,
  dpi: user.dpi,
  address: user.address,
  phone: user.phone,
  email: user.email,
  status: user.status,
});
