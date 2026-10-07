-- Community Care Hospital — booking backend (Supabase / Postgres)
-- Run once in Supabase → SQL Editor. Safe to re-run.
--
-- Security model
--   anon (website visitors): may ONLY call public.create_booking(); cannot read,
--                            update or delete any row.
--   authenticated (staff):   may read, add and update bookings; no deletes
--                            (cancel by setting status = 'cancelled').

-- ---------------------------------------------------------------- types --
do $$ begin
  create type public.booking_status as enum ('new', 'confirmed', 'arrived', 'cancelled');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------- table --
create table if not exists public.bookings (
  id            uuid primary key default gen_random_uuid(),
  serial_no     integer not null,
  booking_date  date not null,
  doctor        text not null check (char_length(doctor) between 2 and 120),
  dept          text check (char_length(dept) <= 40),
  patient_name  text not null check (char_length(patient_name) between 2 and 80),
  phone         text not null check (phone ~ '^01[3-9][0-9]{8}$'),
  age           smallint check (age between 0 and 120),
  note          text check (char_length(note) <= 500),
  status        public.booking_status not null default 'new',
  source        text not null default 'online' check (source in ('online', 'manual')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (booking_date, doctor, serial_no)
);

create index if not exists bookings_date_doctor_idx on public.bookings (booking_date, doctor);
create index if not exists bookings_created_idx on public.bookings (created_at desc);

-- keep updated_at fresh
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists bookings_touch on public.bookings;
create trigger bookings_touch before update on public.bookings
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------- serial number --
-- Next serial for (date, doctor). The advisory lock serialises concurrent
-- bookings for the same doctor/day so two patients never get the same number.
create or replace function public.next_serial(p_date date, p_doctor text) returns integer
language plpgsql as $$
declare n integer;
begin
  perform pg_advisory_xact_lock(hashtext(p_date::text || '|' || p_doctor));
  select coalesce(max(serial_no), 0) + 1 into n
    from public.bookings where booking_date = p_date and doctor = p_doctor;
  return n;
end $$;

-- Staff inserts (manual entry) get their serial assigned the same way.
create or replace function public.assign_serial() returns trigger
language plpgsql as $$
begin
  if new.serial_no is null then
    new.serial_no := public.next_serial(new.booking_date, new.doctor);
  end if;
  return new;
end $$;

drop trigger if exists bookings_serial on public.bookings;
create trigger bookings_serial before insert on public.bookings
  for each row execute function public.assign_serial();

-- ------------------------------------------- public booking entry point --
create or replace function public.create_booking(
  p_name   text,
  p_phone  text,
  p_age    integer,
  p_date   date,
  p_doctor text,
  p_dept   text default null,
  p_note   text default null
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_serial integer;
  v_name   text := btrim(coalesce(p_name, ''));
  v_phone  text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_today  date := (now() at time zone 'Asia/Dhaka')::date;
begin
  if v_phone ~ '^8801' then v_phone := substr(v_phone, 3); end if;

  if char_length(v_name) < 2 or char_length(v_name) > 80 then
    raise exception 'invalid_name' using errcode = '22023';
  end if;
  if v_phone !~ '^01[3-9][0-9]{8}$' then
    raise exception 'invalid_phone' using errcode = '22023';
  end if;
  if p_date is null or p_date < v_today or p_date > v_today + 60 then
    raise exception 'invalid_date' using errcode = '22023';
  end if;
  if p_doctor is null or char_length(btrim(p_doctor)) < 2 then
    raise exception 'invalid_doctor' using errcode = '22023';
  end if;
  if p_age is not null and (p_age < 0 or p_age > 120) then
    raise exception 'invalid_age' using errcode = '22023';
  end if;
  if (select count(*) from public.bookings
        where phone = v_phone and booking_date = p_date) >= 3 then
    raise exception 'too_many_bookings' using errcode = '22023';
  end if;

  insert into public.bookings (booking_date, doctor, dept, patient_name, phone, age, note, source)
  values (p_date, btrim(p_doctor), nullif(btrim(coalesce(p_dept, '')), ''), v_name, v_phone,
          p_age, nullif(left(btrim(coalesce(p_note, '')), 500), ''), 'online')
  returning serial_no into v_serial;

  return v_serial;
end $$;

-- ------------------------------------------------------------------ RLS --
alter table public.bookings enable row level security;

revoke all on public.bookings from anon;
grant select, insert, update on public.bookings to authenticated;

drop policy if exists "staff read"   on public.bookings;
drop policy if exists "staff insert" on public.bookings;
drop policy if exists "staff update" on public.bookings;
create policy "staff read"   on public.bookings for select to authenticated using (true);
create policy "staff insert" on public.bookings for insert to authenticated with check (source = 'manual');
create policy "staff update" on public.bookings for update to authenticated using (true) with check (true);

revoke all on function public.create_booking(text, text, integer, date, text, text, text) from public;
grant execute on function public.create_booking(text, text, integer, date, text, text, text) to anon, authenticated;
revoke all on function public.next_serial(date, text) from public, anon;
grant execute on function public.next_serial(date, text) to authenticated;  -- used by the insert trigger

-- ------------------------------------------------------------- realtime --
do $$ begin
  alter publication supabase_realtime add table public.bookings;
exception when duplicate_object then null; end $$;
