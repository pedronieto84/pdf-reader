// Funciones de sanitización para PDF Reader
import {
  SanitizedObject,
  SituacioPatrimonialType,
  TipusAdquisicioType,
  NaturalesaJuridicaType,
  UsType,
} from "./interfaces";

const situacioPatrimonialSet = new Set([
  "PROPIETAT",
  "CEDIT A FAVOR",
  "CEDIT EN CONTRA",
  "ADSCRIT A FAVOR",
  "ADSCRIT EN CONTRA",
  "ARRENDAT A FAVOR",
  "CONCESSIÓ EN CONTRA",
  "RETIRADA PERMANENT DE L'ÚS",
]);

const naturalesaJuridicaSet = new Set([
  "PATRIMONIAL",
  "DOMINI PÚBLIC - ÚS PÚBLIC",
  "DOMINI PÚBLIC - SERVEI PÚBLIC",
  "COMUNAL",
  "PATRIMONI PÚBLIC DEL SÒL",
]);

const usSet = new Set(["ÚS COMÚ GENERAL", "ÚS COMÚ ESPECIAL", "ÚS PRIVATIU"]);

const tipusAdquisicioSet = new Set([
  "COMPRA",
  "CESSIÓ GRATUÏTA DE LA PROPIETAT O DONACIÓ",
  "CESSIÓ URBANÍSTICA OBLIGATÒRIA",
  "ALTA PER OBRA EN CURS",
  "TREBALLS FETS AMB MITJANS PROPIS",
  "CESSIÓ D'ÚS TEMPORAL",
  "ADSCRIPCIÓ I ALTRES APORTACIONS DE BÉNS I DRETS DE L'ENTITAT PROPIETÀRIA",
  "INSPECCIÓ FÍSICA O INVENTARI", // iNVENTARI, INVESTIGACIÓ O INSPECCIÓ FÍSICA
  "EXPROPIACIÓ",
  "ADJUDICACIÓ EN PAGAMENT DE DEUTES O EMBARGAMENT",
  "ADJUDICACIÓ EN PAGAMENT DE DEUTES O EMBARGAMENT EXERCICI TANCAT",
  "ARRENDAMENT",
  "ALTA PER ARRENDAMENT FINANCER (LÍSING I ALTRES)",
  "COMPRA AMB PAGAMENT FRACCIONAT",
  "ALTA PER LÍSING AL VENEDOR (LEASE - BACK)",
  "ALTA PER MODIFICACIONS DE TANCAMENT",
]);

function isFormattedNumber(value: string): boolean {
  return value === "0" || /^(\d{1,3}(\.\d{3})*|\d+),\d{2}$/.test(value);
}

function normalizeStringArray(array: string[]): string[] {
  return array.map(
    (str) =>
      str
        .normalize("NFD") // Descompone los caracteres acentuados
        .replace(/[\u0300-\u036f]/g, "") // Quita las marcas diacríticas (acentos, tildes, diéresis)
        .toUpperCase() // Convierte a mayúsculas
  );
}

function extractFormattedNumbers(text: string): string[] {
  const results: string[] = [];

  const normalizedText = normalizeStringArray([text])[0];

  // 🧼 Sanitizar: espacio entre letras y números en ambos sentidos
  text = normalizedText
    .replace(/([A-Z])(?=\d)/g, "$1 ")
    .replace(/(\d)(?=[A-Z])/g, "$1 ");

  const regex = /\d{1,3}(?:\.\d{3})*,\d{2}|00|0|[^\s]+/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const token = match[0];

    if (token === "00") {
      results.push("0", "0");
    } else if (isFormattedNumber(token)) {
      results.push(token);
    } else if (token.includes("0")) {
      for (let i = 0; i < token.length; i++) {
        if (token[i] === "0") {
          const next = token.slice(i + 1, i + 3);
          if (!/^\d{1,2}$/.test(next)) {
            results.push("0");
          }
        }
      }
    }
  }

  return results;
}

export function findClassificacio(array: string[]): string | null {
  const regex = /\b\d{6}\b/;
  for (let i = 0; i < array.length; i++) {
    const match = array[i].match(regex);
    if (match) {
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
  const splitted = item.split(" ");
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

function findTipusAdquisició(array: string[]): string | null {
  //const arrayStringified =
  const arrayStringified = array.join(" ");
  for (const item of array) {
    if (situacioPatrimonialSet.has(item)) {
      return item;
    }
  }

  // tengo que iterar sobre todos los elementos de TipusAdquisició y ver si contains
  for (const tipusAdquisicio of tipusAdquisicioSet) {
    if (arrayStringified.includes(tipusAdquisicio)) {
      return tipusAdquisicio;
    }
  }

  return null;
}

function findSituacioPatrimonial(array: string[]): string | null {
  const arrayStringified = array.join(" ");
  for (const item of array) {
    if (situacioPatrimonialSet.has(item)) {
      return item;
    }
  }

  for (const situacioPatrimonial of situacioPatrimonialSet) {
    if (arrayStringified.includes(situacioPatrimonial)) {
      return situacioPatrimonial;
    }
  }
  return null;
}

function findNaturalesaJuridica(array: string[]): string | null {
  const arrayStringified = array.join(" ");

  for (const item of array) {
    if (situacioPatrimonialSet.has(item)) {
      return item;
    }
  }
  for (const naturalesaJuridica of naturalesaJuridicaSet) {
    if (arrayStringified.includes(naturalesaJuridica)) {
      return naturalesaJuridica;
    }
  }
  return null;
}

export function findUs(array: string[]): string | null {
  const arrayStringified = array.join(" ");

  for (const item of array) {
    if (usSet.has(item)) {
      return item;
    }
  }
  for (const us of usSet) {
    if (arrayStringified.includes(us)) {
      return us;
    }
  }
  return null;
}

export function sanitizeObject(array: string[]): SanitizedObject {
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
  object.id = `${object.classificacio}-${object.dataAlta}-${object.numeroDeBe}`; // Genera un ID único basado en classificació, dataAlta y numeroDeBe

  // Encontrar tipusAdquisició
  const tipusAdquisicio = findTipusAdquisició(array) as TipusAdquisicioType;
  if (tipusAdquisicio) {
    object.tipusAdquisició = tipusAdquisicio;
  }

  // Encontrar situacioPatrimonial

  const situacioPatrimonial = findSituacioPatrimonial(array);
  if (situacioPatrimonial) {
    object.situacioPatrimonial = situacioPatrimonial as SituacioPatrimonialType;
  }

  // Encontrar naturalesaJuridica

  const naturalesaJuridica = findNaturalesaJuridica(array);
  if (naturalesaJuridica) {
    object.naturalesaJuridica = naturalesaJuridica as NaturalesaJuridicaType;
  }

  // Encontrar us
  const us = findUs(array);
  if (us) {
    object.us = us as UsType;
  }

  const arrayClean = array
    .slice(2) // Quita los 2 primeros elementos
    .filter((item) => !/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/.test(item)) // Filtra elementos que sean únicamente alfabéticos
    .join(" "); // Une los elementos filtrados en un string

  const arrayNumbersEnd = extractFormattedNumbers(arrayClean);
  console.log("arrayNumbersEnd:", arrayNumbersEnd);
  return object; // Retorna el objeto sanitizado y la classificació extraída
}
