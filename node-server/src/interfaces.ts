export interface Root {
  message: string
  parametros: Parametros
  archivo: Archivo
  resultado: Resultado
}

export interface Parametros {
  poble: string
  informe: string
  pag: any
}

export interface Archivo {
  nombre: string
  ruta: string
}

export interface Resultado {
  total_pages: number
  processed_pages: number
  items: Item[]
}

export interface Item {
  page_number: number
  text: string
  text_blocks: TextBlock[]
  images: any[]
  links: any[]
}

export interface TextBlock {
  text: string
  bbox: number[]
  font: string
  size: number
  flags: number
}
