import type { Root, TableStructure, Items, Word } from "../interfaces";

export function filterData(data: Root): Root {
  // Por ahora simplemente devuelve la data tal cual

  const dataRelevant={
    pages: 0,
    words: 0,
  }



const tabla: TableStructure = {
    columnas: [0, 50.4, 92.16, 119.52, 280.08, 323.28, 414, 489.6, 598.32, 696.96, 747.36],
    filas: [176.4, 213.12],
    grosorYTotales: 36.72,
    pagsStructure: {
        totales: [],
        normales: [],

    }
}

 

// Cuantas páginas hay 
  const pages = data.data.processed_pages
  dataRelevant.pages = pages;


  // Cuantos Items hay en total
  let totalWords = 0;
  data.data.items.forEach((pagina) => {
    console.log('pagina', pagina)
    totalWords += pagina.
  });
 
  dataRelevant.words = totalWords;

  // Que páginas tienen totales

  return data;
}

export default filterData;



// Función para identificar una página que tipo de página es




