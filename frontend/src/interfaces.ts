export interface Root {
  message: string
  parameters: Parameters
  pdf_info: PdfInfo
  data: Data
  timestamp: string
}

export interface Parameters {
  poble: string
  informe: string
  pag: null | number;
}

export interface PdfInfo {
  file_path: string
  file_name: string
  extraction_mode: string
}

export interface Data {
  total_pages: number
  horizontal_lines: HorizontalLine[]
  processed_pages: number
  items: Item[]
}

export interface HorizontalLine {
  pageNumber: number
  horizontal_lines: HorizontalLines
}

export interface HorizontalLines {
  number: number
  yPositions: number[]
}

export interface Item {
  page_number: number
  text: string
  words: Word[]
  images: unknown[]
  links: unknown[]
}

export interface Word {
  text: string
  bbox: Bbox
  block_number: number
  line_number: number
  word_number: number
  x0: number
  y0: number
  x1: number
  y1: number
}


export interface TableStructure {
  columnas: number[]
  filas: number[]
  grosorYTotales: number,
  page:{
    height: number,
    width: number
  }
}


export interface DataRelevant {
  pages: number
  words: number
  paginasConTotales: number[]
  paginasConStart: number[]
  paginasConEnd: number[]
}

export interface PageStructure{
  header: Word[]
  body: {
    filas: Fila[]
  }
}

export type Fila = Celda[]

export type Celda = Word[]

export type Bbox = [number, number, number, number];

export type Rectangulo = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}
