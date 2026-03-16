
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { countries, defaultCountry } from "../lib/countries";
import { Loader2, ArrowLeft } from "lucide-react";

// Form Validation Schema
const registerSchema = z.object({
    fullName: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    countryCode: z.string(),
    phone: z.string().min(5, "Número de telefone muito curto"),
    whatsapp: z.boolean(),
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
    const [authError, setAuthError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<RegisterFormInputs>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            countryCode: defaultCountry.code,
            whatsapp: false,
        },
    });

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const country = countries.find((c) => c.code === e.target.value);
        if (country) {
            setSelectedCountry(country);
            setValue("countryCode", country.code);
        }
    };

    const onSubmit = async (data: RegisterFormInputs) => {
        setIsLoading(true);
        setAuthError(null);

        try {
            // 1. Sign Up using Supabase Auth
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password, // Auto-generate temp password or handle passwordless
                options: {
                    emailRedirectTo: `${window.location.origin}/login`,
                    data: {
                        full_name: data.fullName,
                    }
                }
            });

            if (signUpError) throw signUpError;

            // 2. Insert into Leads table
            if (authData.user) {
                const fullPhone = `${selectedCountry.phoneCode}${data.phone}`;

                const { error: leadsError } = await supabase.from("leads").insert([
                    {
                        email: data.email,
                        full_name: data.fullName,
                        country: selectedCountry.name,
                        phone: fullPhone,
                        whatsapp: data.whatsapp ? fullPhone : null,
                        user_id: authData.user.id,
                    },
                ]);

                if (leadsError) {
                    console.error("Error saving lead:", leadsError);
                    // Non-blocking error, user is created
                }
            }

            // 3. Success Feedback & Redirect
            // In a real flow we might ask to verify email, but for "Começar Grátis" lead capture often we just want the data
            // For now, redirect to a dashboard or success page.
            // Since dashboard doesn't exist, redirect to home with query param?
            alert("Cadastro realizado com sucesso!");

            // Handle Redirect
            const params = new URLSearchParams(window.location.search);
            const redirectUrl = params.get('redirect');
            navigate(redirectUrl || "/");

        } catch (error: unknown) {
            console.error("Registration Error:", error);
            const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro ao tentar cadastrar.";
            setAuthError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: window.location.origin,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });
            if (error) throw error;
        } catch (error: unknown) {
            console.error("Google Auth Error:", error);
            const errorMessage = error instanceof Error ? error.message : "Erro ao conectar com Google.";
            setAuthError(errorMessage);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.15),transparent_60%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,hsl(var(--secondary)/0.15),transparent_60%)]"></div>

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Voltar para Home
                </Link>

                <div className="backdrop-blur-xl bg-card/80 border border-border shadow-2xl rounded-2xl overflow-hidden">
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent gradient-primary mb-2">
                                Começar Grátis
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Crie sua conta em segundos e leve seu negócio para o próximo nível.
                            </p>
                        </div>

                        {authError && (
                            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                                {authError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label htmlFor="fullName" className="text-sm font-medium">Nome Completo</label>
                                <input
                                    {...register("fullName")}
                                    id="fullName"
                                    type="text"
                                    placeholder="Seu nome"
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                                {errors.fullName && <span className="text-xs text-destructive">{errors.fullName.message}</span>}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">Email</label>
                                <input
                                    {...register("email")}
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                                {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium">Senha</label>
                                <input
                                    {...register("password")}
                                    id="password"
                                    type="password"
                                    placeholder="******"
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                                {errors.password && <span className="text-xs text-destructive">{errors.password.message}</span>}
                            </div>

                            {/* Phone Input with Country Selector */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Celular / WhatsApp</label>
                                <div className="flex gap-2">
                                    <div className="relative w-1/3 min-w-[120px]">
                                        <select
                                            value={selectedCountry.code}
                                            onChange={handleCountryChange}
                                            className="w-full h-10 appearance-none pl-3 pr-8 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                                        >
                                            {countries.map((c) => (
                                                <option key={c.code} value={c.code}>
                                                    {c.flag} {c.code}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>

                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium select-none">
                                            {selectedCountry.phoneCode}
                                        </span>
                                        <input
                                            {...register("phone")}
                                            type="tel"
                                            className="w-full h-10 pl-16 pr-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50"
                                            placeholder="84 123 4567"
                                        />
                                    </div>
                                </div>
                                {errors.phone && <span className="text-xs text-destructive">{errors.phone.message}</span>}
                            </div>

                            <div className="flex items-center space-x-2 pt-1">
                                <input
                                    {...register("whatsapp")}
                                    type="checkbox"
                                    id="whatsapp"
                                    className="h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                                />
                                <label htmlFor="whatsapp" className="text-sm text-muted-foreground cursor-pointer select-none">
                                    Este número também é WhatsApp
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 mt-4 inline-flex items-center justify-center gap-2 font-semibold text-primary-foreground gradient-primary rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] disabled:opacity-70 disabled:pointer-events-none"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Cadastrar com Email"}
                            </button>
                        </form>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">Ou entre com</span>
                            </div>
                        </div>

                        <button
                            onClick={handleGoogleLogin}
                            type="button"
                            className="w-full h-12 inline-flex items-center justify-center gap-2 font-medium border border-input bg-background hover:bg-muted/50 rounded-lg transition-colors"
                        >
                            <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </button>

                        <p className="mt-6 text-center text-xs text-muted-foreground">
                            Ao se cadastrar, você concorda com nossos <a href="#" className="underline hover:text-primary">Termos</a> e <a href="#" className="underline hover:text-primary">Privacidade</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
