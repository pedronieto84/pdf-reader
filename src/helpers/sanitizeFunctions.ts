// Funciones de sanitización para PDF Reader
import { SanitizedObject } from "./interfaces";

function isFormattedNumber(value: string): boolean {
  return (
    value === "0" ||
    /^(\d{1,3}(\.\d{3})*|\d+),\d{2}$/.test(value)
  );
}

export function findClassificacio(array: string[]): string | null {
  const regex = /\b\d{6}\b/;
  console.log("regex", array);
  for (let i = 0; i < array.length; i++) {
    const match = array[i].match(regex);
    if (match) {
      console.log("match found:", match);
      return match[0]; // Retorna el código de 6 dígitos encontrado
    }
  }
  return null; // Si no encuentra ningún código de 6 dígitos
}

function findNumeroDeBe(item: string): number | null {
  const splitted = item.split(" ");
  return splitted[0] ? parseInt(splitted[0]) : null;
}

function findQuantitat(item: string): number | null {
  console.log("item:", item);
  const splitted = item.split(" ");
  console.log("splitted:", splitted);
  return splitted[splitted.length - 1]
    ? parseFloat(splitted[splitted.length - 1])
    : null;
}

function findData(array: string[]): string | null {
  const regex = /\b\d{2}\/\d{2}\/\d{4}\b/;
  for (let i = 0; i < array.length; i++) {
    const match = array[i].match(regex);
    if (match) {
      return match[0];
    }
  }
  return null;
}

export function sanitizeObject(array: string[]): SanitizedObject{
  const object: SanitizedObject = {};


  // Classificació 120103 numeric, 6 digits
  const classificacio = findClassificacio(array);
  if (classificacio) {
    object.classificacio = parseInt(classificacio);
  }

  // Encontrar numeroDeBe
  const numeroDeBe = findNumeroDeBe(array[1]);
  if (numeroDeBe) {
    object.numeroDeBe = numeroDeBe;
  }

  // Encontrar quantitat
  const quantitat = findQuantitat(array[1]);
  if (quantitat) {
    object.quantitat = quantitat;
  }
  object.quantitat = quantitat;

  // Encontrar D.Alta
  const dAlta = findData(array);
  if (dAlta) {
    object.dataAlta = dAlta;
  }
  console.log("Objeto creado:", object);
  object.id = `${object.classificacio}-${object.dataAlta}-${object.numeroDeBe}`; // Genera un ID único basado en classificació, dataAlta y numeroDeBe


  //



  return object; // Retorna el objeto sanitizado y la classificació extraída
}
