import type { Root, TableStructure, Item, DataRelevant, Word, Rectangulo, Bbox, PageStructure, Fila } from "../interfaces";
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


  // Cojer las posiciones de los words con codigo de 6 digitos
  const filasPosicionesY:number[] = []

  const regex = /^\d{6}$/;
  page.words.forEach((word)=>{
    if (regex.test(word.text)){
      return filasPosicionesY.push(word.y0)
    }
  })

  
  // Hacer un for Each de las filas

  const tablaEntera: Fila[] = [];

  filasPosicionesY.forEach((yPosition, index) => {
    const y0Fila = yPosition
    const y1Fila = filasPosicionesY[index + 1] || tabla.page.height // Asumiendo que la fila ocupa todo el ancho de la página
    const filas: Fila = []
    // Ahora iteramos sobre las columnas
    tabla.columnas.forEach((x0Columna, colIndex) => {
      const x1Columna = tabla.columnas[colIndex + 1] || tabla.page.width; // Asumiendo que la columna ocupa todo el ancho de la página
      
      // Crear un rectángulo para la celda
      const rectangulo: Rectangulo = {
        x0: x0Columna,
        y0: y0Fila,
        x1: x1Columna,
        y1: y1Fila
      };

      // Obtener los items dentro de este rectángulo
      const itemsEnRectanguloCelda = getAllItemsInsideSquare(page, rectangulo);
      
      // Agrego los items de la celda a la fila
      filas.push(itemsEnRectanguloCelda);
      // Aquí puedes hacer algo con los itemsEnRectangulo, como agregarlos a una estructura de filas
      
    });

    tablaEntera.push(filas)
  });

  const objectToReturn: PageStructure = {header: headerWords,
    body: {
      filas: [...tablaEntera]
      // Aquí puedes agregar más lógica para organizar el cuerpo
    }}
    console.log('Object final', objectToReturn);
  return objectToReturn // Retorna la página organizada
};















