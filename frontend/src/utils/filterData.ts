import type { Root, TableStructure, Item, DataRelevant, Word, Rectangulo, Bbox } from "../interfaces";

export function filterData(data: Root): Root {
  // Por ahora simplemente devuelve la data tal cual

  const dataRelevant: DataRelevant = {
    pages: 0,
    words: 0,
    paginasConTotales: [],
    paginasConStart: [],
    paginasConEnd: [],
  }



const tabla: TableStructure = {
    columnas: [0, 50.4, 92.16, 119.52, 280.08, 323.28, 414, 489.6, 598.32, 696.96, 747.36],
    filas: [176.4, 213.12],
    grosorYTotales: 36.72,
  
}

 

// Cuantas páginas hay 
  const pages = data.data.processed_pages
  dataRelevant.pages = pages;


  // Cuantos Items hay en total
  let totalWords = 0;
  data.data.items.forEach((item: Item) => {
    totalWords += item.words.length
  });
 
  dataRelevant.words = totalWords;

  // Que páginas tienen totales
  const paginasConTotales:number[] = []

  data.data.horizontal_lines.forEach((line, index) => {
    if (line.horizontal_lines.number > 5) {
      paginasConTotales.push(index + 1); // Guardar el número de página
    }
  });

  dataRelevant.paginasConTotales = paginasConTotales;

  // Me falta identificar en cada página, las que tienen start y/o end


  // Aquí identifico las que tienen y/o end

  return data;
}

export default filterData;



// Función para identificar una página que tipo de página es




// Función para organizar la página correcrtamente




const evaluateIfIsIn = ( smallItem: Word, bigItem: (Bbox | Rectangulo) ): boolean => {
  let  rectangulo: Rectangulo = { x0: 0, y0: 0, x1: 0, y1: 0 };

  if (!Array.isArray(bigItem)) {
    rectangulo = bigItem;
  } else {
    rectangulo = {
      x0: bigItem[0],
      y0: bigItem[1],
      x1: bigItem[2],
      y1: bigItem[3],
    };
  }

  // Verificar si el smallItem está dentro del rectángulo
  if (smallItem.x0 >= rectangulo.x0 && smallItem.y0 >= rectangulo.y0 && smallItem.x1 <= rectangulo.x1 && smallItem.y1 <= rectangulo.y1) {
    return true;
  }

  return false;
}




