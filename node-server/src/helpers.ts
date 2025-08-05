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

// Cuando estamos en una pagina, los items estan aqui $.data.resultado.items[0].text_blocks
export function getPageData(data:any): TextBlock[] {

  // bbox ex [x0, y0, x1 , y1]
  console.log("getPageData", data.resultado.items);
    const arrayBlocks =  data.resultado.items[0].text_blocks;

    // Primero quitamos todos los que están encima de la fila 176.4
    const filteredBlocks = arrayBlocks.filter((block: TextBlock) => {
      const bbox = block.bbox;
      // bbox[1] es la coordenada y0
      return bbox[1] >= tableStructure.filaTop;
    });

    

    return filteredBlocks;
}

