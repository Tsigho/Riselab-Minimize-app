import React, { useState } from "react";
import { supabase } from "../lib/supabase"; // Ajuste o caminho se necessário
import { UploadCloud, FileCheck, Loader2 } from "lucide-react";
import { Button } from "./ui/Primitives";

interface ProductUploadProps {
  onUploadSuccess: (url: string) => void;
}

export const ProductUpload = ({ onUploadSuccess }: ProductUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${Math.random()}-${Date.now()}.${fileExt}`;

      // 1. Sobe para o Storage (Bucket: product-files)
      const { error: uploadError } = await supabase.storage
        .from("product-files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Pega o Link Público
      const { data: { publicUrl } } = supabase.storage
        .from("product-files")
        .getPublicUrl(filePath);

      setFileName(file.name);
      onUploadSuccess(publicUrl); // Envia o link para o formulário pai
      alert("Arquivo PDF carregado com sucesso!");

    } catch (error: any) {
      alert("Erro no upload: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-2">
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-700 rounded-2xl bg-zinc-900/50 hover:bg-zinc-800/50 transition-all cursor-pointer">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {uploading ? (
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          ) : fileName ? (
            <FileCheck className="w-8 h-8 text-green-500" />
          ) : (
            <UploadCloud className="w-8 h-8 text-zinc-500 mb-2" />
          )}
          <p className="text-sm text-zinc-400">
            {uploading ? "Subindo para o servidor..." : fileName ? fileName : "Clique para carregar o PDF do Produto"}
          </p>
        </div>
        <input type="file" className="hidden" accept=".pdf,.zip,.rar" onChange={handleUpload} disabled={uploading} />
      </label>
    </div>
  );
};