import type { Bbox, Item, Rectangulo, Word } from "../interfaces";



export const evaluateIfIsIn = ( smallItem: Word, bigItem: (Bbox | Rectangulo) ): boolean => {
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

export const getAllItemsInsideSquare = ( page:Item, square: Rectangulo ): Word[]=>{

  const wordsInside: Word[] = [];

  page.words.forEach(word => {
    if (evaluateIfIsIn(word, square)) {
      wordsInside.push(word);
    }
  });

  return wordsInside;
}


