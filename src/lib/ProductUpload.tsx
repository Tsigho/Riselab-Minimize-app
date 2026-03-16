import { supabase } from "../../lib/supabase";

// FUNÇÃO MÁGICA DE UPLOAD
const uploadProductFile = async (file: File) => {
  try {
    // 1. Cria um nome único para o arquivo (evita substituir arquivos com mesmo nome)
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // 2. Faz o upload para o balde 'product-files' que criamos
    const { data, error: uploadError } = await supabase.storage
      .from('product-files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 3. Gera o link público definitivo
    const { data: { publicUrl } } = supabase.storage
      .from('product-files')
      .getPublicUrl(filePath);

    return publicUrl; // Este é o link que vai para a coluna 'file_url'

  } catch (error) {
    console.error('Erro no upload:', error);
    alert('Erro ao carregar arquivo. Tente novamente.');
    return null;
  }
};