# 4VWeather App

Aplicación de pronóstico del tiempo desarrollada con **Ionic Framework v8** y **Angular 19**.
Este proyecto implementa la metodología **Atomic Design** para la arquitectura de componentes y utiliza la API de **OpenWeatherMap** para los datos meteorológicos.

---

## 📋 Tabla de Contenidos

1.  [Características](#-características)
2.  [Tecnologías](#-tecnologías)
3.  [Arquitectura (Atomic Design)](#-arquitectura-atomic-design)
4.  [Configuración del Entorno](#-configuración-del-entorno)
5.  [Despliegue en Android](#-despliegue-en-android)
6.  [Solución de Problemas](#-solución-de-problemas)

---

## 🚀 Características

*   **Búsqueda de Ciudades**: Buscador integrado con soporte para cualquier ciudad del mundo.
*   **Geolocalización Automática**:
    *   Detecta la ubicación del usuario al inicio.
    *   *Fallback*: Si falla el GPS o hay timeout, carga una ciudad por defecto (Pamplona).
    *   **Alta Precisión Inteligente**: Configurado para usar redes WiFi/Antenas (`enableHighAccuracy: false`) para mayor rapidez en interiores.
*   **Pronóstico Detallado**:
    *   **Tiempo Actual**: Tarjeta principal con temperatura, iconos dinámicos y hora local.
    *   **Horario (24h)**: Carrusel con intervalos interpolados para mayor fluidez (datos cada 1h).
    *   **Diario (4 días)**: Pronóstico extendido con máximas y resumen visual.
*   **Internacionalización (i18n)**:
    *   Soporte completo Español/Inglés.
    *   Cambio dinámico de idioma (textos y fechas) mediante bandera en la cabecera.
*   **Diseño Premium**: Interfaz moderna, animaciones suaves y paleta de colores "Warm Grey".

---

## 🛠 Tecnologías

*   **Framework**: [Ionic 8](https://ionicframework.com/) & [Angular 19](https://angular.io/)
*   **Runtime Nativo**: [Capacitor 6](https://capacitorjs.com/)
*   **API**: [OpenWeatherMap 3.0](https://openweathermap.org/api)
*   **HTTP Client**: Angular `HttpClient` + RxJS
*   **Assets**: `ionicons` para iconografía.

---

## 🧩 Arquitectura (Atomic Design)

El proyecto organiza sus componentes siguiendo la jerarquía atómica para maximizar la reutilización:

### 1. Átomos (`src/app/components/atoms`)
*Elementos indivisibles básicos.*
*   *(Utilizados directamente de Ionic: `ion-icon`, `ion-text`, `ion-img`)*

### 2. Moléculas (`src/app/components/molecules`)
*Grupos de átomos que forman una unidad funcional.*
*   **`SearchBarComponent`**: Input de búsqueda con botón de acción.
*   **`WeatherCardComponent`**: Tarjeta principal consolidando temperatura, ciudad e icono grande.

### 3. Organismos (`src/app/components/organisms`)
*Secciones complejas formadas por moléculas.*
*   **`HourlyForecastComponent`**: Carrusel horizontal con el pronóstico por horas.
*   **`DailyForecastComponent`**: Lista vertical/horizontal con el pronóstico para los próximos días.

### 4. Templates / Pages
*   **`HomePage`**: Orquesta todos los organismos y gestiona la lógica de negocio (llamadas a servicios).

---

## ⚙ Configuración del Entorno

### Requisitos Previos
*   Node.js (LTS v18/v20 recomendado)
*   Ionic CLI: `npm install -g @ionic/cli`

### Instalación
```bash
# 1. Clonar el repositorio
git clone <url-repo>

# 2. Instalar dependencias
npm install

# 3. Configurar API Key
# Crea/Edita 'src/environments/environment.ts' y añade tu clave:
export const environment = {
  production: false,
  apiKey: 'TU_API_KEY_DE_OPENWEATHER',
  apiUrl: 'https://api.openweathermap.org/data/2.5'
};
```

### Ejecución Web (Desarrollo)
```bash
ionic serve
```

---

## 📱 Despliegue en Android

El proyecto utiliza **Capacitor** para generar la app nativa.

### Sincronización
Cada vez que hagas cambios en el código Web (`src/...`), debes compilar y sincronizar:

```bash
# Compila Angular y copia los assets a la carpeta nativa android/
ionic cap sync
```

### Abrir en Android Studio
```bash
ionic cap open android
```

### Permisos (`AndroidManifest.xml`)
La app requiere los siguientes permisos para la geolocalización:
```xml
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
```
*Nota: También se requiere configuración de `usesCleartextTraffic="true"` en `application` si se usan recursos HTTP inseguros (aunque esta app fuerza HTTPS).*

---

## 🔧 Solución de Problemas

### Error: `INSTALL_FAILED_USER_RESTRICTED` (Xiaomi/Redmi)
Si Android Studio no deja instalar la app en tu móvil físico:
1.  Ve a **Ajustes > Opciones de Desarrollador**.
2.  Desactiva "Optimización MIUI" (Opcional).
3.  **ACTIVA "Instalar vía USB" (Install via USB)**. *Requiere SIM insertada y cuenta Mi.*

### Error de Geolocalización (Timeout)
Si sale el aviso rojo "Ubicación falló":
*   Asegúrate de tener el GPS activado.
*   La app tiene un **timeout de 20 segundos**. Si tu red/GPS es lento, fallará y cargará la ciudad por defecto (Pamplona).

### Imágenes Rotas (Mixed Content)
Todas las URLs de imágenes (iconos del tiempo, banderas) deben usar **HTTPS**. Android bloquea las peticiones HTTP planas por seguridad.
- **Correcto**: `https://openweathermap.org/...`
- **Incorrecto**: `http://openweathermap.org/...`
