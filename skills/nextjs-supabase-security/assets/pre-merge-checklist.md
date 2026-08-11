## Security

Copy into every pull request that touches data, auth or the database.

- [ ] New or changed tables have RLS **and** least-privilege grants — in a
      migration, not the dashboard
- [ ] New views use `security_invoker = true`
- [ ] Every touched RLS policy: `TO` role set · not `USING (true)` · UPDATE has
      both `using` and `with check` plus a SELECT policy · null-guarded · no
      `user_metadata` · `(select auth.uid())` · policy columns indexed
- [ ] Supabase Security Advisor run — no new criticals
- [ ] Every new or changed Server Action: Zod `safeParse` · re-auth **inside**
      the action · ownership check · DTO return · database access via the data layer
- [ ] Tenant / org id comes from the session, never the request body
- [ ] No `process.env` or service-role key outside the data layer —
      `grep -rn "process\.env" app components lib hooks | grep -v "^data/"` is empty
- [ ] Built bundle is clean — no `eyJ…` token in `.next/static`
- [ ] Client input validated or sanitized: `searchParams`, `[param]`, form data,
      LLM output
- [ ] LLM endpoints, if any: rate-limited per user **and** per org, `max_tokens`,
      timeout
- [ ] `npm audit` clean at high; framework on a patched minor
- [ ] **RLS negative test** added or updated and passing in CI — a second user
      cannot read, update or delete this data
- [ ] Negative control on that test: policy dropped → test failed → restored

Exposure test, per new table:

```bash
curl "$SUPABASE_URL/rest/v1/<table>?select=*" -H "apikey: $PUBLISHABLE_KEY"
# expect: []
```
