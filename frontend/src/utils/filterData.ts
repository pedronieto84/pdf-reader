import type { Root, TableStructure, Item, DataRelevant, Word, Rectangulo, Bbox } from "../interfaces";
import { evaluateIfIsIn, getAllItemsInsideSquare } from "./helpers";


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
    columnas: [ 0, 50.4, 92.16, 119.52, 280.08, 323.28, 414, 489.6, 598.32, 696.96, 747.36],
    filas: [ 176.4, 213.12 ],
    grosorYTotales: 36.72,
    page:{ width: 889.92, height: 597.6 }
  
}

 

// Cuantas páginas hay 
  const pages = data.data.processed_pages
  dataRelevant.pages = pages;


  // Cuantos Items hay en total
  let totalWords = 0;
  data.data.items.forEach((item: Item) => {
    // Aqui estoy dentro de cada item, que es una página
    totalWords += item.words.length

    // Organizar la página
    pageOrganizer(item, tabla);
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

const pageOrganizer = (page: Item, tabla: TableStructure): PageStructure => {
  // Aquí puedes implementar la lógica para organizar los items de la página
  // Por ejemplo, ordenar por coordenadas o agrupar por bloques

  // Primero tengo que poner los items que van en el header en el header

  const headerWords = getAllItemsInsideSquare(page, {x0: 0, y0: 0, x1: tabla.page.width, y1: tabla.filas[0]});


  // Luego organizar el body con las filas y columnas
  

  return {
    header: headerWords,
    body: {
      items: page.words.filter(word => !evaluateIfIsIn(word, {x0: 0, y0: 0, x1: tabla.page.width, y1: tabla.filas[0]})),
      // Aquí puedes agregar más lógica para organizar el cuerpo
    }
  }; // Retorna la página organizada
};















