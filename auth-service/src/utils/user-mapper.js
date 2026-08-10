// ! Campos seguros a exponer al cliente
// * Proyección explícita para evitar retornar el documento de Mongoose completo.
// ? Excluye datos sensibles: password, refreshTokens, tokens de verificación/reset, etc.

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
