alter table public.llm_configs
  add column if not exists base_url text;

update public.llm_configs
set base_url = case provider
  when 'deepseek' then 'https://api.deepseek.com'
  else 'https://api.openai.com/v1'
end
where base_url is null or btrim(base_url) = '';

alter table public.llm_configs
  alter column base_url set not null;

do $$
begin
  alter table public.llm_configs
    drop constraint if exists llm_configs_base_url_check;
  alter table public.llm_configs
    add constraint llm_configs_base_url_check
    check (base_url ~* '^https?://');
end $$;
