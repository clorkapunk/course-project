interface Roles {
    readonly [key: string]: number; // Allow any string as a key
}
const Roles: Roles = {
    Admin: 2002,
    User: 2000
} as const

export default Roles
