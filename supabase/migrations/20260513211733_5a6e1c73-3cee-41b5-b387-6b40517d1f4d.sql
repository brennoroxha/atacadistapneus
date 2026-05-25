UPDATE public.products
SET specs = specs || jsonb_build_object('informacoesTecnicas', jsonb_build_array(
  jsonb_build_object('icone','https://cdn.iset.io/assets/42004/arquivos/filtro/icon-cat.svg','texto','Categoria: Passeio'),
  jsonb_build_object('icone','https://cdn.iset.io/assets/42004/arquivos/filtro/icon-terreno.svg','texto','Terreno: Asfalto'),
  jsonb_build_object('icone','https://cdn.iset.io/assets/42004/arquivos/filtro/icon-carga.svg','texto','Índice de carga (por pneu): 82 (475 kg)'),
  jsonb_build_object('icone','https://cdn.iset.io/assets/42004/arquivos/filtro/icon-indice.svg','texto','Índice de velocidade: T (190 km/h)'),
  jsonb_build_object('icone','https://cdn.iset.io/assets/42004/arquivos/filtro/icon-talas.svg','texto','Talas compatíveis: 5 a 6'),
  jsonb_build_object('icone','https://cdn.iset.io/assets/42004/arquivos/filtro/icon-largura.svg','texto','Largura: 175 mm'),
  jsonb_build_object('icone','https://cdn.iset.io/assets/42004/arquivos/filtro/icon-diametro.svg','texto','Diâmetro: 575 mm'),
  jsonb_build_object('icone','https://cdn.iset.io/assets/42004/arquivos/filtro/icon-durabilidade.svg','texto','Durabilidade (Treadwear): 340'),
  jsonb_build_object('icone','https://cdn.iset.io/assets/42004/arquivos/filtro/icon-aderencia.svg','texto','Aderência (Traction): A'),
  jsonb_build_object('icone','https://cdn.iset.io/assets/42004/arquivos/filtro/icon-temperatura.svg','texto','Resistência ao aquecimento (Temperature): B'),
  jsonb_build_object('icone','https://cdn.iset.io/assets/42004/arquivos/filtro/icon-runflat.svg','texto','Runflat: Não'),
  jsonb_build_object('icone','https://cdn.iset.io/assets/42004/arquivos/filtro/icon-extra-load.svg','texto','Extra Load: Não'),
  jsonb_build_object('icone','https://cdn.iset.io/assets/42004/arquivos/filtro/icon-protetor-bordar.svg','texto','Protetor de borda: Não'),
  jsonb_build_object('icone','https://cdn.iset.io/assets/42004/arquivos/filtro/icon-quantidade-lonas.svg','texto','Quantidade de lonas: Não Possui'),
  jsonb_build_object('icone','https://cdn.iset.io/assets/42004/arquivos/filtro/icon-montagem.svg','texto','Montagem: Sem Câmara'),
  jsonb_build_object('icone','https://cdn.iset.io/assets/42004/arquivos/filtro/icon-letra.svg','texto','Letra: Preta')
))
WHERE id = 'a55b7ee2-142e-4cb0-aff6-91262861302e';