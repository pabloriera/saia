# SAIA — Modelado en Música y Sonido

Un sitio web interactivo de presentación sobre los tipos de modelado en música y audio.

**Live:** [https://pabloriera.github.io/saia/](https://pabloriera.github.io/saia/)

## Estructura

```
site/
├── index.html          # Página principal
├── css/style.css       # Estilos
├── js/
│   ├── main.js         # Navegación, modo presentación, cards
│   ├── audio.js        # Carga CSV, reproductor, filtros
│   └── plots.js        # Gráficos discriminativos (Canvas)
└── media_links.csv     # Datos de audio demos
```

## Correr localmente

Cualquier servidor estático funciona:

```bash
# Opción 1: Python
cd site && python -m http.server 8000

# Opción 2: Node
npx serve site

# Opción 3: PHP
cd site && php -S localhost:8000
```

Luego abrí [http://localhost:8000](http://localhost:8000)

## Datos de audio (`media_links.csv`)

El archivo `site/media_links.csv` contiene links a demos de audio/video de modelos generativos.

Para actualizar los datos, corre el scraper en `scrapper/` y copia el CSV resultante.

## Heatmaps discriminativos

Los PNGs de heatmaps se cargan directamente desde arXiv. Para usar imágenes locales, descargalas a `site/img/` y actualizá los `src` en `index.html`.

## Deploy a GitHub Pages

El deploy es automático via GitHub Actions al hacer push a `main`. El workflow `.github/workflows/deploy.yml` publica el contenido de `site/`.

Para habilitar GitHub Pages:
1. Ir a Settings → Pages en el repo
2. Source: **GitHub Actions**

## Navegación

- **Scroll** o **← →** para navegar entre secciones
- **P** para activar/desactivar modo presentación
- Click en las cards para expandir/colapsar detalles
- Filtros de búsqueda y año en los paneles de audio

## Licencia

MIT
