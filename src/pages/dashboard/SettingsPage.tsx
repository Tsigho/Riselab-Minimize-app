import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Button, Input, Card } from "../../components/ui/Primitives";
import { Loader2, Camera, Save, User, ScanFace, Check } from "lucide-react";
import { toast } from "sonner";
import { FaceCapture } from "../../components/FaceCapture";

export const SettingsPage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [fullName, setFullName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    const [showCamera, setShowCamera] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                setFullName(user.user_metadata?.full_name || "");
                setAvatarUrl(user.user_metadata?.avatar_url || "");
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }
            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            // 1. Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars') // Make sure this bucket exists/is created
                .upload(filePath, file);

            if (uploadError) {
                // If bucket doesn't exist, try public bucket or handle error
                throw uploadError;
            }

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setAvatarUrl(publicUrl);
            toast.success("Imagem carregada! Não esqueça de salvar.");

        } catch (error: any) {
            console.error("Error uploading avatar:", error);
            toast.error("Erro ao carregar imagem. Verifique se o bucket 'avatars' existe.");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: fullName,
                    avatar_url: avatarUrl
                }
            });

            if (error) throw error;
            toast.success("Perfil atualizado com sucesso!");

            // Force reload to update header (simple way)
            // In a more complex app we would use a context to update global state
            setTimeout(() => window.location.reload(), 1000);

        } catch (error: any) {
            console.error("Error updating profile:", error);
            toast.error("Erro ao atualizar perfil.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configurações de Perfil</h1>
                <p className="text-muted-foreground">Gerencie suas informações pessoais e aparência.</p>
            </div>

            <Card className="p-8 space-y-8 glass-panel">
                {/* Avatar Section */}
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative group cursor-pointer">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-12 h-12 text-gray-400" />
                            )}
                        </div>
                        <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                            <Camera className="w-8 h-8" />
                        </label>
                        <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarUpload}
                            disabled={uploading}
                        />
                    </div>
                    {uploading && <p className="text-xs text-muted-foreground animate-pulse">Carregando imagem...</p>}
                    <p className="text-sm text-muted-foreground">Clique na foto para alterar</p>
                </div>

                {/* Form Section */}
                <div className="space-y-4 max-w-md mx-auto">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nome Completo</label>
                        <Input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Seu nome"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input
                            value={user?.email || ""}
                            disabled
                            className="bg-muted text-muted-foreground cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground">O email não pode ser alterado.</p>
                    </div>

                    <div className="pt-4">
                        <Button
                            onClick={handleSave}
                            disabled={saving || uploading}
                            className="w-full gap-2"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Salvar Alterações
                        </Button>
                        {/* Face Security Section */}
                        <div className="pt-8 border-t border-white/10">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <ScanFace className="w-5 h-5 text-green-500" />
                                Segurança Facial
                            </h2>

                            {!showCamera ? (
                                <div className="flex flex-col gap-4">
                                    <p className="text-sm text-muted-foreground">
                                        Cadastre seu rosto para facilitar o login e aumentar a segurança da sua conta.
                                    </p>

                                    {user?.user_metadata?.face_descriptor ? (
                                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                                    <Check className="w-5 h-5 text-green-500" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-green-400">Rosto Cadastrado</p>
                                                    <p className="text-xs text-green-400/70">Biometria ativa na conta</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => setShowCamera(true)}>
                                                Atualizar
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button onClick={() => setShowCamera(true)} className="w-full bg-green-600 hover:bg-green-500">
                                            Cadastrar Rosto
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <FaceCapture
                                        mode="register"
                                        onCapture={async (descriptor, image) => {
                                            try {
                                                // Save descriptor to user_metadata
                                                // Convert Float32Array to regular Array for JSON storage
                                                const descriptorArray = Array.from(descriptor);

                                                const { error } = await supabase.auth.updateUser({
                                                    data: {
                                                        face_descriptor: descriptorArray,
                                                        face_registered_at: new Date().toISOString()
                                                    }
                                                });

                                                if (error) throw error;

                                                toast.success("Biometria facial registrada com sucesso!");
                                                setShowCamera(false);
                                                fetchProfile(); // Refresh UI
                                            } catch (err) {
                                                console.error(err);
                                                toast.error("Erro ao salvar biometria.");
                                            }
                                        }}
                                    />
                                    <Button variant="ghost" onClick={() => setShowCamera(false)} className="w-full">
                                        Cancelar
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};
