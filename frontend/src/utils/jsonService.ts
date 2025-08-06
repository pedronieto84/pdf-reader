/**
 * Servicio para cargar datos JSON desde la carpeta assets del frontend
 */

export interface FilterParams {
  poble: string;
  option: string;
  number?: number;
}

/**
 * Carga datos JSON basándose en los parámetros de filtro
 * Los archivos están en: public/archivos-json/{poble}/{poble}-{option}.json
 */
export async function loadJsonData(params: FilterParams): Promise<unknown> {
  try {
    const { poble, option } = params;

    // Construir la ruta del archivo JSON desde public
    // Formato: /archivos-json/{poble}/{poble}-{option}.json
    const filePath = `/archivos-json/${poble}/${poble}-${option}.json`;

    console.log(`Cargando datos desde: ${filePath}`);

    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error(
        `Error al cargar archivo JSON: ${response.status} ${response.statusText}. Archivo: ${filePath}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error cargando datos JSON:", error);
    throw error;
  }
}

export default loadJsonData;
