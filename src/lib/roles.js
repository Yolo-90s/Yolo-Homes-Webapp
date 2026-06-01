// Role model mirroring the Android Role enum.
export const Role = {
  DEVELOPER: "developer",
  ADMIN: "admin",
  OWNER: "owner",
  TENANT: "tenant",
  UNKNOWN: "unknown",
};

export function roleFrom(value) {
  switch ((value || "").trim().toLowerCase()) {
    case "developer":
      return Role.DEVELOPER;
    case "admin":
      return Role.ADMIN;
    case "owner":
      return Role.OWNER;
    case "tenant":
      return Role.TENANT;
    default:
      return Role.UNKNOWN;
  }
}

export function canWrite(role) {
  return role === Role.DEVELOPER || role === Role.ADMIN;
}
export function canEditSettings(role) {
  return role === Role.DEVELOPER || role === Role.ADMIN;
}
export function isResident(role) {
  return role === Role.OWNER || role === Role.TENANT;
}
export function roleLabel(role) {
  switch (role) {
    case Role.DEVELOPER:
      return "Developer";
    case Role.ADMIN:
      return "Administrator";
    case Role.OWNER:
      return "Owner";
    case Role.TENANT:
      return "Tenant";
    default:
      return "Resident";
  }
}
