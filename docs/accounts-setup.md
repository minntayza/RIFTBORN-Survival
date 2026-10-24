# Survivor Game account setup

The app implements guest play, Google OAuth (PKCE), email-code verification, and private progress sync through Supabase. Guest play does not require Supabase. Sign-in is disabled with a clear message until the public project configuration exists.

## 1. Connect the Supabase project

In the existing **Survivor Game** project, copy its project URL and **publishable** key from Project Settings → API / API Keys. Add these to `.env.local` (retain existing entries):

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_PUBLIC_KEY
```

An older anon key can use `VITE_SUPABASE_ANON_KEY` instead. Never expose a secret key or service-role key. Restart the development server after changing the environment. Add the same public variables to the deployment environment when publishing and rebuild.

## 2. Create private cloud saves

Run `supabase/migrations/202610240001_player_accounts.sql` in this project's SQL Editor, or apply it with your established migration workflow. It creates:

- `player_progress`: one row per account with row-level security.
- `save_player_progress`: authenticated optimistic writes; simultaneous devices cannot silently overwrite each other.

No public access or unauthenticated write policy is granted. These are player-owned, client-authoritative game saves, not proof of paid purchases or a trusted leaderboard.

## 3. Redirect URLs

Authentication → URL Configuration:

- Site URL: `https://zombie-last-stand.vercel.app/`
- Additional redirects: `http://127.0.0.1:5174/`, `http://localhost:5174/`, and the exact production URL.
- Add any actual preview deployment URLs you intend to test. Do not use broad production wildcards.

The app redirects to its own origin and pathname; it never accepts an arbitrary redirect supplied by a user.

## 4. Google sign-in

1. Create a Web application OAuth client in Google Cloud for Survivor Game.
2. Configure the consent screen with the app name and support contact. If the app is in testing, add your test users.
3. Add `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback` as an authorized redirect URI in Google.
4. Authentication → Sign In / Providers → Google: enable Google and enter the client ID and client secret. The secret belongs in Supabase, never in Vite environment variables.
5. Use only the standard `openid`, `email`, and `profile` scopes.

## 5. Email codes

Enable the Email provider and signups. Configure custom SMTP in Supabase using an email provider such as Resend and a verified sending domain. Supabase's default sender is for team-member testing, not delivery to public players.

Set the **Magic Link** template to include the OTP, rather than just a link:

```
<h2>Your Survivor Game sign-in code</h2>
<p>{{ .Token }}</p>
<p>Enter this code in the game. If you did not request it, ignore this email.</p>
```

Also include `{{ .Token }}` in the **Confirm signup** template if it is used for new users in your project. Set a short OTP expiry and keep Supabase's server-side request/verification rate limits enabled. The app additionally waits 60 seconds between resend requests and accepts 6–10 numeric digits to accommodate the configured OTP length.

## Progress behavior

- First sign-in to a new account carries the current guest progress into that account.
- Existing account and nonempty device progress: show both saves and let the player choose. No additive currency merge.
- Before resolving a conflict, both choices are backed up in local browser storage (`zls.account.backup.*`).
- Account saves are locally cached by user ID. Signing out restores the guest save; another account never inherits the previous account's active save.
- Cloud failures keep local progress. Retry is available from the account panel.
- Account changes arriving during gameplay wait until the player returns to camp.
- Another device's newer revision triggers a new choice instead of a silent overwrite.

## Verify once configuration is connected

1. Start as Guest. Record current equipment, currencies, and best wave.
2. Sign in through Google. Verify the correct account name and “Progress saved” after the cloud write.
3. Sign out. Verify the original guest progress returns.
4. Request a code at an email address you control. Verify a real delivered code, invalid code, expired code, resend cooldown, and successful sign-in.
5. Sign in on another browser/device. Check cloud restore and conflict selection.
6. Change progress concurrently on two devices; verify the revision conflict.
7. Confirm another authenticated user cannot read/update the first user's row and anonymous clients cannot read any rows. `supabase/tests/accounts-security.sql` is a rollback-only database check for this.

Automated tests use an injected progress backend; they do not substitute for live Google consent, actual SMTP delivery, or applying and testing the policies in your project.

Official setup references:
- https://supabase.com/docs/guides/auth/social-sign-in/auth-google
- https://supabase.com/docs/guides/auth/auth-email-passwordless
- https://supabase.com/docs/guides/auth/auth-smtp
