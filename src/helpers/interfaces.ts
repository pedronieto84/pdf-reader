// Tipos TypeScript para la aplicación PDF Reader
export interface PDFData {
    text: string;
}

export interface SanitizedObject {
    classificacio?: number;
    numeroDeBe: number;
    quantitat: number | null;
    descripcio: string;
    centreGestor: number | null;
    centreDeCost: number | null;
    titolAdquisicio: string; // QUIZAS ES UN ENUM
    costAdquisicio: string | number;
    dataAlta: string; // Formato dd/mm/yyyy
    
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