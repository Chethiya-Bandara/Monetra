-- Apply in Supabase before deploying the matching backend. Existing plans begin
-- materializing occurrences after the migration date; past estimates are not
-- backfilled because edits to a plan may have changed its historical terms.
alter table public.recurring_transactions
  add column if not exists recorded_through date not null default current_date;

alter table public.transactions
  add column if not exists recurring_transaction_id uuid references public.recurring_transactions(id) on delete set null,
  add column if not exists occurrence_date date;
create unique index if not exists transactions_recurring_occurrence_unique
  on public.transactions (recurring_transaction_id, occurrence_date)
  where recurring_transaction_id is not null;

-- The caller's JWT and RLS policies apply to both tables. A row lock serializes
-- synchronization for each plan, while the unique index prevents duplicates.
create or replace function public.sync_recurring_transactions(p_through date)
returns void language plpgsql security invoker set search_path = public as $$
declare
  plan public.recurring_transactions%rowtype;
  due_date date;
  cutoff date;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_through is null or abs(p_through - current_date) > 1 then
    raise exception 'Invalid synchronization date';
  end if;
  for plan in select * from public.recurring_transactions
    where user_id = auth.uid() and recorded_through < p_through for update
  loop
    cutoff := least(p_through, coalesce(plan.end_date, p_through));
    if cutoff > plan.recorded_through then
      for due_date in
        select case when plan.frequency = 'monthly' then
          least((date_trunc('month', d) + interval '1 month - 1 day')::date,
                (date_trunc('month', d)::date + (extract(day from plan.start_date)::integer - 1)))
          else d::date end
        from generate_series(
          case when plan.frequency = 'monthly' then date_trunc('month', plan.recorded_through + 1)
               when plan.frequency = 'weekly' then plan.start_date::timestamp
                 + (greatest(0, ((plan.recorded_through - plan.start_date) / 7) + 1) * interval '7 days')
               else greatest(plan.start_date, plan.recorded_through + 1)::timestamp end,
          cutoff::timestamp,
          case plan.frequency when 'monthly' then interval '1 month' when 'weekly' then interval '7 days' else interval '1 day' end
        ) d
      loop
        if due_date > plan.recorded_through and due_date >= plan.start_date and due_date <= cutoff then
          insert into public.transactions (user_id, type, amount, date, description, category, recurring_transaction_id, occurrence_date)
          values (auth.uid(), plan.type, plan.amount, due_date::text, coalesce(plan.description, 'Recurring transaction'), plan.category, plan.id, due_date)
          on conflict (recurring_transaction_id, occurrence_date) where recurring_transaction_id is not null do nothing;
        end if;
      end loop;
    end if;
    update public.recurring_transactions set recorded_through = p_through where id = plan.id and user_id = auth.uid();
  end loop;
end $$;

-- One database transaction creates both the plan and its first transaction.
create or replace function public.create_recurring_with_transaction(
  p_amount numeric, p_type text, p_frequency text, p_category text,
  p_description text, p_start_date date, p_end_date date
) returns jsonb language plpgsql security invoker set search_path = public as $$
declare
  plan public.recurring_transactions%rowtype;
  entry public.transactions%rowtype;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_amount is null or p_amount <= 0 or p_amount > 10000000
    or p_type is null or p_type not in ('income', 'expense')
    or p_frequency is null or p_frequency not in ('daily', 'weekly', 'monthly')
    or p_category is null or p_category not in ('Food', 'Transport', 'Entertainment', 'Health', 'Utilities', 'General')
    or p_start_date is null or (p_end_date is not null and p_end_date < p_start_date)
    or (p_description is not null and (length(p_description) < 1 or length(p_description) > 200)) then
    raise exception 'Invalid recurring transaction';
  end if;
  insert into public.recurring_transactions (user_id, amount, type, frequency, category, description, start_date, end_date, recorded_through)
  values (auth.uid(), p_amount, p_type, p_frequency, p_category, p_description, p_start_date, p_end_date, p_start_date)
  returning * into plan;
  insert into public.transactions (user_id, type, amount, date, description, category, recurring_transaction_id, occurrence_date)
  values (auth.uid(), p_type, p_amount, p_start_date::text, coalesce(p_description, 'Recurring transaction'), p_category, plan.id, p_start_date)
  returning * into entry;
  return jsonb_build_object('recurring', to_jsonb(plan), 'transaction', to_jsonb(entry));
end $$;
revoke all on function public.sync_recurring_transactions(date) from public, anon;
revoke all on function public.create_recurring_with_transaction(numeric, text, text, text, text, date, date) from public, anon;
grant execute on function public.sync_recurring_transactions(date) to authenticated;
grant execute on function public.create_recurring_with_transaction(numeric, text, text, text, text, date, date) to authenticated;
