// Funciones de sanitización para PDF Reader
import { SanitizedObject } from './interfaces';

export function findClassificacio(array: string[]): string | null {
    const regex = /\b\d{6}\b/;
    console.log('regex', array);
    for (let i = 0; i < array.length; i++) {
        const match = array[i].match(regex);
        if (match) {
            console.log('match found:', match);
            return match[0]; // Retorna el código de 6 dígitos encontrado
        }
    }
    return null; // Si no encuentra ningún código de 6 dígitos
}

export function sanitizeObject(array: string[]): SanitizedObject {
    const object: SanitizedObject = {};
    // Classificació 120103 numeric, 6 digits
    const classificacio = findClassificacio(array);
    console.log('classificacio:', classificacio);
    if (classificacio) {
        object.classificacio = parseInt(classificacio, 10);
    }
    console.log('Objeto creado:', object);
    return object; // Retorna el objeto sanitizado
}