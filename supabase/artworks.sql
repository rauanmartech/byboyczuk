-- ============================================================
-- ARTWORKS TABLE — Nerine
-- ============================================================

CREATE TABLE IF NOT EXISTS public.artworks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  image_url_1  TEXT,
  image_url_2  TEXT,
  image_url_3  TEXT,
  price        NUMERIC,
  quantity     INTEGER DEFAULT 1,
  status       TEXT DEFAULT 'disponível',
  dimensions   TEXT,
  technique    TEXT,
  year         INTEGER DEFAULT extract(year from now()),
  category     TEXT CHECK (category IN ('original', 'print')),
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode ler as obras
CREATE POLICY "Public read artworks" 
  ON public.artworks FOR SELECT 
  USING (true);

-- Apenas admins podem inserir/editar/deletar
CREATE POLICY "Admin manage artworks" 
  ON public.artworks FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- STORAGE BUCKET: portfolio
-- ============================================================
-- Rode os comandos abaixo para configurar o bucket via SQL 
-- ou crie o bucket 'portfolio' manualmente no dashboard e habilite acesso público.

-- INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', true);

-- Políticas de Storage
CREATE POLICY "Public access to portfolio images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio');

CREATE POLICY "Admin upload to portfolio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'portfolio' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
