"use client";

import React from "react";
import { FileText, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PdfViewerProps {
  fileUrl: string;
}

export function PdfViewer({ fileUrl }: PdfViewerProps) {
  const handleOpenPdf = () => {
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  const handleDownloadPdf = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = "";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full h-full min-h-[400px] p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <CardTitle>Vista previa de PDF</CardTitle>
          <CardDescription>
            Los PDFs se abren mejor en una nueva pestaña donde puedes usar todas las funciones del
            visor nativo de tu navegador.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button onClick={handleOpenPdf} className="w-full" size="lg">
            <ExternalLink className="mr-2 h-4 w-4" />
            Abrir PDF en nueva pestaña
          </Button>
          <Button onClick={handleDownloadPdf} variant="outline" className="w-full" size="lg">
            <Download className="mr-2 h-4 w-4" />
            Descargar PDF
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
