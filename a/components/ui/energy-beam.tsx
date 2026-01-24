
import React, { useEffect, useRef } from 'react';

interface EnergyBeamProps {
    projectId?: string;
    className?: string;
}

declare global {
    interface Window {
        UnicornStudio?: any;
    }
}

const EnergyBeam: React.FC<EnergyBeamProps> = ({
    projectId = "hRFfUymDGOHwtFe7evR2",
    className = ""
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scriptLoadedRef = useRef(false);

    useEffect(() => {
        const loadScript = () => {
            if (scriptLoadedRef.current) return;

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.5.2/dist/unicornStudio.umd.js';
            script.async = true;

            script.onload = () => {
                scriptLoadedRef.current = true;
                if (window.UnicornStudio && containerRef.current) {
                    window.UnicornStudio.init();
                }
            };

            document.head.appendChild(script);
        };

        loadScript();

        // CLEANUP: Garante que a animação pare e os recursos sejam liberados ao desmontar (pós-login)
        return () => {
            if (window.UnicornStudio && typeof window.UnicornStudio.destroy === 'function') {
                try {
                    window.UnicornStudio.destroy();
                } catch (e) {
                    console.log('Limpando recursos de animação...');
                }
            }
            // Remove o script para limpar a memória global
            const scripts = document.querySelectorAll('script[src*="unicornstudio"]');
            scripts.forEach(s => s.remove());
            scriptLoadedRef.current = false;
        };
    }, [projectId]);

    return (
        <div className={`relative w-full h-full bg-black overflow-hidden ${className}`}>
            <div
                ref={containerRef}
                data-us-project={projectId}
                className="w-full h-full"
                style={{ 
                    filter: 'hue-rotate(245deg) brightness(1.2) saturate(1.4)',
                    opacity: 0.85
                }}
            />
            {/* Overlay para suavizar a transição de cores e garantir o tom lilás */}
            <div className="absolute inset-0 bg-primary/5 pointer-events-none mix-blend-overlay"></div>
        </div>
    );
};

export default EnergyBeam;
