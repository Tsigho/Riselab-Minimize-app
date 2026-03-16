import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { setCookie } from 'cookies-next';

export const RastroCapture = () => {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // Procura pelo parâmetro 'rid' (Rastro ID) ou 'click_id'
        const rid = searchParams.get('rid') || searchParams.get('click_id');

        if (rid) {
            console.log(`[RastroMoz] ID Capturado: ${rid}`);

            // Salva o Cookie por 30 dias (Dominio todo)
            setCookie('rastro_rid', rid, {
                maxAge: 60 * 60 * 24 * 30, // 30 dias em segundos
                path: '/',
                sameSite: 'lax'
            });
        }
    }, [searchParams]);

    return null; // Componente invisível (Headless)
};
