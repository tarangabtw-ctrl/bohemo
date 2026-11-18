-- Bohemo: writes go through the server only.
-- /api/submit and /api/subscribe now use the service role key (server-only),
-- which bypasses RLS, so the public (anon) key no longer needs to insert.
-- Applied 18 Nov 2026 (remote version 20261118075630), after the service role key was added in Vercel.

BEGIN;

-- submissions: drop the anon/authenticated insert policy. With RLS on and no
-- policies left, the public key can't read, add, change or delete rows.
DROP POLICY IF EXISTS "submissions_insert" ON public.submissions;

-- subscribers: "subscribers_insert" is KEPT for now. main's coming-soon page
-- still posts to its own /api/subscribe, which inserts with the public key.
-- Drop it when redesign/v2 is merged into main:
--   DROP POLICY IF EXISTS "subscribers_insert" ON public.subscribers;

-- rls_auto_enable(): an event-trigger function (trigger "ensure_rls").
-- Nobody should call it through /rest/v1/rpc. EXECUTE is held by PUBLIC as
-- well as anon and authenticated, so revoke all three. Event triggers don't
-- check EXECUTE when they fire, so ensure_rls keeps working.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

COMMIT;
