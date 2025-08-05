export interface Root {
  success: boolean
  message: string
  parameters: Parameters
  file_info: FileInfo
  data: Data
  timestamp: string
}

export interface Parameters {
  poble: string
  informe: string
  pag: number
}

export interface FileInfo {
  source: string
  file_name: string
  file_path: string
}

export interface Data {
  message: string
  parameters: Parameters2
  pdf_info: PdfInfo
  data: Data2
  timestamp: string
  filter_info: FilterInfo
}

export interface Parameters2 {
  poble: string
  informe: string
  pag: any
}

export interface PdfInfo {
  file_path: string
  file_name: string
  extraction_mode: string
}

export interface Data2 {
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
  images: any[]
  links: any[]
}

export interface Word {
  text: string
  bbox: number[]
  block_number: number
  line_number: number
  word_number: number
  x0: number
  y0: number
  x1: number
  y1: number
}

export interface FilterInfo {
  requested_page: number
  page_found: boolean
  message: string
}
