export interface SupabaseAppMetadata {
      provider: string
      providers: string[]
}

export interface SupabaseUserMetadata {
      email: string
      email_verified: boolean
      phone_verified: boolean
      sub: string
}

export interface SupabaseIdentityData {
      email: string
      email_verified: boolean
      phone_verified: boolean
      sub: string
}

export interface SupabaseIdentity {
      identity_id: string
      id: string
      user_id: string
      identity_data: SupabaseIdentityData
      provider: string
      last_sign_in_at: string
      created_at: string
      updated_at: string
      email: string
}

export interface SupabaseUser {
      id: string
      aud: string
      role: string
      email: string
      email_confirmed_at: string | null
      phone: string
      confirmation_sent_at: string | null
      confirmed_at: string | null
      last_sign_in_at: string | null

      app_metadata: SupabaseAppMetadata
      user_metadata: SupabaseUserMetadata
      identities: SupabaseIdentity[]

      created_at: string
      updated_at: string
      is_anonymous: boolean
}

export interface SupabaseSession {
      access_token: string
      token_type: "bearer"
      expires_in: number
      expires_at: number
      refresh_token: string
      user: SupabaseUser
}

export interface SupabaseSessionResponse {
      session: SupabaseSession | null
}
