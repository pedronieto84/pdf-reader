// Tipos TypeScript para la aplicación PDF Reader
export interface PDFData {
    text: string;
}

export interface SanitizedObject {
    classificacio?: number;
}

export interface TextSegmentObject {
    llibre: string | null;
    pag: number | null;
    text: string[];
    objectSanitized: SanitizedObject;
    items?: number;
}

export interface DetectionResult {
    method?: string;
    error?: string;
    [key: string]: any;
}