-- ============================================================
-- PROFILES TABLE — Nerine
-- ============================================================
-- Cria a tabela de perfis vinculada ao auth.users do Supabase.
-- Cada usuário cadastrado ganha automaticamente um perfil.
-- ============================================================

-- 1. Criar tabela
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'customer'
                CHECK (role IN ('admin', 'customer')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado vê apenas o próprio perfil
CREATE POLICY "Usuário vê o próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Usuário pode atualizar apenas o próprio perfil
CREATE POLICY "Usuário atualiza o próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin lê todos os perfis
CREATE POLICY "Admin lê todos os perfis"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Trigger: cria perfil automaticamente ao cadastrar novo usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Trigger: mantém updated_at sincronizado
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 5. Definir role ADMIN para boyczukrafaela@gmail.com
-- ============================================================
-- Cria o perfil se o usuário já existir no auth, e define role=admin.
-- Se o usuário ainda não se cadastrou, o trigger fará isso automaticamente;
-- em seguida, rode apenas o UPDATE abaixo para promover ao admin.

INSERT INTO public.profiles (id, email, role)
SELECT
  id,
  email,
  'admin'
FROM auth.users
WHERE email = 'boyczukrafaela@gmail.com'
ON CONFLICT (id) DO UPDATE
  SET role = 'admin',
      updated_at = NOW();
