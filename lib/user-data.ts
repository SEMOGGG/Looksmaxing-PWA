// Type partagé entre les Server Actions (app/actions/user-data.ts) et les
// pages client. Le statut Premium n'est plus un mock local : il vit dans la
// table user_profiles, liée au compte Clerk.
export type Plan = "free" | "premium";
