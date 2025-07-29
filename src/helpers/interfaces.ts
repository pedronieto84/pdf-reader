// Tipos TypeScript para la aplicación PDF Reader RELACIÓ DE BENS

export interface PDFData {
    text: string;
}

export interface SanitizedObject {
    id:string;
    classificacio?: number;

    numeroDeBe: number;
    etiqueta?: string | null;
    dataAlta: string; // Formato dd/mm/yyyy

    quantitat: number | null;
    descripcio: string;

    centreGestor?: number | null;
    centreDeCost?: number | null;
    titular?: string | null;

    tipusAdquisició?: TipusAdquisicio 
    situacioPatrimonial?: SituacioPatrimonialType
    naturalesaJuridica?: NaturalesaJuridica | null;
    us?: Us;
    vBC: string // isFormattedNumber
    fA: string // isFormattedNumber
    fP: string // isFormattedNumber
    vC: string // isFormattedNumber

    dotAmort?: string | null  // isFormattedNumber
    vMercat: string 
    vAsseguran: string 
    vRU: string | null

    dataVMercat?: string | null; // Formato dd/mm/yyyy
    dataVAsseguran?: string | null; // Formato dd/mm/yyyy
    dataVRU?: string | null; // Formato dd/mm/yyyy

}

export interface TextSegmentObject {
    llibre: string | null;
    pag: number | null;
    text?: string[];
    objectSanitized: SanitizedObject;
    items?: number;
}

export interface DetectionResult {
    method?: string;
    error?: string;
    [key: string]: any;
}

export type SituacioPatrimonialType= "PROPIETAT" | "CEDIT A FAVOR" | "CEDIT EN CONTRA" | "ADSCRIT A FAVOR" | "ADSCRIT EN CONTRA" | "ARRENDAT A FAVOR" | "CONCESSIÓ EN CONTRA" | "RETIRADA PERMANENT DE L'ÚS"

export type NaturalesaJuridica = "PATRIMONIAL" | "DOMINI PÚBLIC - ÚS PÚBLIC" | "DOMINI PÚBLIC - SERVEI PÚBLIC" | "COMUNAL" | "PATRIMONI PÚBLIC DEL SÒL"

export type Us = "ÚS COMÚ GENERAL" | "ÚS COMÚ ESPECIAL" | "ÚS PRIVATIU"

export type TipusAdquisicio = "COMPRA" 
| "CESSIÓ GRATUÏTA DE LA PROPIETAT O DONACIÓ" 
| "CESSIÓ URBANÍSTICA OBLIGATÒRIA" 
| "ALTA PER OBRA EN CURS" 
| "TREBALLS FETS AMB MITJANS PROPIS"
| "CESSIÓ D'ÚS TEMPORAL"
| "ADSCRIPCIÓ I ALTRES APORTACIONS DE BÉNS I DRETS DE L'ENTITAT PROPIETÀRIA"
| "INSPECCIÓ FÍSICA O INVENTARI" // iNVENTARI, INVESTIGACIÓ O INSPECCIÓ FÍSICA
| "EXPROPIACIÓ"
| "ADJUDICACIÓ EN PAGAMENT DE DEUTES O EMBARGAMENT"
| "ADJUDICACIÓ EN PAGAMENT DE DEUTES O EMBARGAMENT EXERCICI TANCAT"
| "ARRENDAMENT"
| "ALTA PER ARRENDAMENT FINANCER (LÍSING I ALTRES)"
| "COMPRA AMB PAGAMENT FRACCIONAT"
| "ALTA PER LÍSING AL VENEDOR (LEASE - BACK)"
| "ALTA PER MODIFICACIONS DE TANCAMENT"