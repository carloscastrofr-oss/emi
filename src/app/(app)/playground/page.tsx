
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { HexColorPicker } from 'react-colorful';
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Palette, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function generateTheme(primaryColor: string) {
    // This is a simplified logic. A real implementation would use a color theory library.
    const secondaryColor = primaryColor.slice(0, 5) + 'A'; // Example manipulation
    return {
        '--color-primary': primaryColor,
        '--color-primary-container': `color-mix(in srgb, ${primaryColor} 15%, hsl(var(--background)))`,
        '--color-on-primary': '#ffffff',
        '--color-secondary': secondaryColor,
        '--color-ring': primaryColor,
    };
}

export default function PlaygroundPage() {
    const [primaryColor, setPrimaryColor] = useState('#455ADE');
    const [radius, setRadius] = useState([12]);
    const { toast } = useToast();

    const themeVars = generateTheme(primaryColor);
    const themeStyleString = Object.entries(themeVars)
        .map(([key, value]) => `${key}: ${value};`)
        .join(' ');
    
    const previewHtml = `
        <html style="--radius: ${radius[0]}px; ${themeStyleString}">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
                <style>
                    body { 
                        font-family: 'Inter', sans-serif;
                        background-color: hsl(var(--card)); 
                        color: hsl(var(--card-foreground));
                        padding: 2rem;
                        display: flex;
                        flex-direction: column;
                        gap: 1rem;
                        align-items: flex-start;
                    }
                    .button-primary { 
                        background-color: var(--color-primary); 
                        color: var(--color-on-primary); 
                        padding: 0.5rem 1rem; 
                        border: none; 
                        border-radius: var(--radius);
                        font-size: 0.875rem;
                        cursor: pointer;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    }
                    .card-preview {
                        background-color: var(--color-primary-container);
                        padding: 1.5rem;
                        border-radius: var(--radius);
                        width: 100%;
                        max-width: 300px;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    }
                     .card-preview-title {
                        font-weight: 600;
                        font-size: 1.125rem;
                        color: hsl(var(--card-foreground));
                    }
                    .card-preview-desc {
                        font-size: 0.875rem;
                        color: hsl(var(--muted-foreground));
                        margin-top: 0.25rem;
                    }

                </style>
            </head>
            <body>
                <div class="card-preview">
                    <h3 class="card-preview-title">Título de la Tarjeta</h3>
                    <p class="card-preview-desc">Esta es una descripción de ejemplo para la tarjeta.</p>
                </div>
                <button class="button-primary">Botón Primario</button>
            </body>
        </html>
    `;

    const handleExport = () => {
        toast({
            title: "Función no disponible",
            description: "La exportación de tokens estará disponible próximamente.",
        });
    }

  return (
    <div>
      <PageHeader
        title="Playground"
        description="Experimenta con tokens de diseño y temas en tiempo real."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <motion.div
            className="h-full"
            whileHover={{ y: -4, boxShadow: 'var(--tw-shadow-e8)'}}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            <Card className="rounded-expressive shadow-e2">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <Palette className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Cambiador de Tokens</CardTitle>
                            <CardDescription>Ajusta los valores para ver los cambios en vivo.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label htmlFor="color-picker" className="mb-2 block">Color Primario</Label>
                        <HexColorPicker id="color-picker" color={primaryColor} onChange={setPrimaryColor} style={{ width: '100%'}} />
                    </div>
                    <div>
                        <Label htmlFor="radius-slider" className="mb-4 block">Radio de Borde: {radius[0]}px</Label>
                        <Slider
                            id="radius-slider"
                            min={0}
                            max={40}
                            step={1}
                            value={radius}
                            onValueChange={setRadius}
                        />
                    </div>
                    <Button onClick={handleExport} className="w-full">
                        <Copy className="mr-2 h-4 w-4" />
                        Exportar Tokens
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
        
        <div>
            <Label className="mb-2 block">Vista Previa en Vivo</Label>
            <iframe
                title="preview"
                className="rounded-expressive border w-full h-[500px] bg-card"
                srcDoc={previewHtml}
            />
        </div>

      </div>
    </div>
  );
}
