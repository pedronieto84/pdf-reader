import {
  Root,
  Parametros,
  Archivo,
  Resultado,
  Item,
  TextBlock,
} from "./interfaces.js";

// Aquí puedes agregar funciones helper que utilicen las interfaces importadas

const tableStructure= {
    col0: 0, col1: 50.4, col2: 92.16, col3: 119.52, col4: 280.08, col5: 323.28, col6: 414, col7: 489.6, col8:598.32, col9: 696.96, col10: 747.36, filaTop: 176.4, grosorYTotales: 36.72
}

// Quitar los elementos por encima de la filaTop
export function removeHeader(
textBlock: TextBlock[],
){

  const filaTop = tableStructure.filaTop;
  const filteredItems = textBlock.filter((item: TextBlock) => {
    // Verificar si el item tiene una propiedad bbox y si su valor y0 es mayor que filaTop
    if (item.bbox && item.bbox[1] > filaTop) {
      return true; // Mantener el item
    }
    return false; // Eliminar el item
  }); 

  return [...filteredItems];

}

// Cuando estamos en una pagina, los items estan aqui $.data.resultado.items[0].text_blocks
export function getPageData(data:Root) {

  // bbox ex [x0, y0, x1 , y1]


export function getHorizontalLines(data:any){
  const lines = data.data.horizontal_lines
  const horizontalLines = lines.filter((line:{
    pageNumber:number, horizontal_lines:{number:number}
  })=>{
    if(line.horizontal_lines.number>5){
      return true
    }else{
      return false
    }
  })

  return horizontalLines.map((line:{pageNumber:number, horizontal_lines:{number:number, yPositions:number[]}})=>{

    return {
      pageNumber: line.pageNumber,
      horizontalLines: line.horizontal_lines.number-5,
      yPositions: line.horizontal_lines.yPositions.slice(-(line.horizontal_lines.number-5))
    }

  })
}
