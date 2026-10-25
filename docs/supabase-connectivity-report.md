# Supabase project connectivity investigation

Project reference: pncuhopjwrnffnbfxxcy
Observed: 24 October 2026 (Asia/Yangon)

The game cannot reach https://pncuhopjwrnffnbfxxcy.supabase.co/auth/v1/settings or /auth/v1/health. TCP connection to HTTPS port 443 times out for both resolved IPv4 addresses before any HTTP response or OAuth redirect.

DNS resolves to 104.18.38.10 and 172.64.149.246. Google Public DNS independently returns the same addresses. No AAAA answer was returned by Google Public DNS.

https://api.supabase.com responds over HTTPS (404 at its root), and https://supabase.com responds with 200 from the same computer.

The Supabase dashboard reported Auth healthy. Auth and gateway logs inspected during reproduction showed no matching game sign-in request. Recent successful gateway entries were management administration calls. Google is enabled with a web OAuth client and the matching Supabase callback. The application is still in Google Testing mode with the owner's Google account registered as a test user.

The user reports the same symptom after trying a mobile hotspot and a VPN. The investigation did not establish the routing or filtering cause; these observations do not prove a global Supabase outage.

Please investigate public ingress/routing for this project and advise on additional network diagnostics or project-side remediation. No project restart, account deletion, key rotation, or security reduction has been attempted.

No API keys, client secrets, session tokens, passwords, or player data are included in this report.
