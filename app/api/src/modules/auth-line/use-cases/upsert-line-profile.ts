import { eq } from "drizzle-orm"
import { db, profilesSchema } from "@repo/database"
import { supabaseAdmin } from "@repo/supabase"

type LineProfileInput = {
  lineUserId: string
  displayName?: string
  avatarUrl?: string
}

/** Returns the existing profile for this LINE user, or creates a new auth user + profile. */
export const upsertLineProfile = async ({ lineUserId, displayName, avatarUrl }: LineProfileInput) => {
  const [existingProfile] = await db
    .select()
    .from(profilesSchema)
    .where(eq(profilesSchema.lineUserId, lineUserId))
    .limit(1)

  if (existingProfile) return existingProfile

  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: `${lineUserId}@line.zoo-passport.local`,
    email_confirm: true,
    user_metadata: { line_user_id: lineUserId },
  })

  if (authError || !authUser.user) {
    throw new Error(`Failed to create auth user: ${authError?.message ?? "unknown error"}`)
  }

  const [newProfile] = await db
    .insert(profilesSchema)
    .values({
      id: authUser.user.id,
      lineUserId,
      displayName: displayName ?? "Zoo Explorer",
      avatarUrl,
    })
    .returning()

  if (!newProfile) {
    throw new Error("Failed to create user profile")
  }

  return newProfile
}

