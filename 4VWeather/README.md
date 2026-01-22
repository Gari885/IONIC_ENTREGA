# 4VWeather

Aplicación del tiempo desarrollada con Ionic v8 y Angular. Utiliza Atomic Design y la API de OpenWeatherMap.

## Tecnologías
- **Ionic Framework**
- **Angular (Standalone Components)**
- **OpenWeatherMap API**
- **Atomic Design Methodology**

## Configuración
1.  Clonar el repositorio.
2.  Instalar dependencias: `npm install`
3.  Obtener una API Key de OpenWeatherMap y configurarla en `src/environments/environment.ts`.

## Estructura del Proyecto
- `src/app/components`: Componentes organizados según Atomic Design (atoms, molecules, organisms).
- `src/app/services`: Servicios para API y Geolocalización.
- `src/app/home`: Página principal.

## Ejecución
- Web: `ionic serve`
- Android: `ionic cap run android`

## Diseño
El diseño sigue principios de Atomic Design, con componentes reutilizables como `SearchBar` (molecule), `WeatherCard` (molecule/organism), y listas de pronósticos.
