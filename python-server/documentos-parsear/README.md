# Estructura de documentos

Este directorio debe contener los archivos PDF organizados de la siguiente manera:

```
documentos-parsear/
├── collbato/
│   ├── collbato_a.pdf
│   └── collbato_bens.pdf
├── santboi/
│   ├── santboi_a.pdf
│   └── santboi_bens.pdf
└── premia/
    ├── premia_a.pdf
    └── premia_bens.pdf
```

## Municipios válidos:
- collbato
- santboi  
- premia

## Tipos de informe válidos:
- a
- bens

## Nomenclatura de archivos:
Los archivos deben seguir el patrón: `{municipio}_{informe}.pdf`

Ejemplos:
- `santboi_a.pdf`
- `premia_bens.pdf`
- `collbato_a.pdf`

Coloca tus archivos PDF siguiendo esta estructura para que la API pueda encontrarlos correctamente.
