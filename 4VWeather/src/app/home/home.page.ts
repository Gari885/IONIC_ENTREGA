import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSpinner, IonButtons, IonButton, IonIcon } from '@ionic/angular/standalone';
import { SearchBarComponent } from '../components/molecules/search-bar/search-bar.component';
import { WeatherCardComponent } from '../components/molecules/weather-card/weather-card.component';
import { DailyForecastComponent } from '../components/organisms/daily-forecast/daily-forecast.component';
import { HourlyForecastComponent } from '../components/organisms/hourly-forecast/hourly-forecast.component';
import { TranslationService } from '../services/translation.service';
import { WeatherService } from '../services/weather.service';
import { LocationService } from '../services/location.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { addIcons } from 'ionicons';
import { locationOutline, cloudyNightOutline, globeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonSpinner, IonButtons, IonButton, IonIcon,
    SearchBarComponent,
    WeatherCardComponent,
    DailyForecastComponent,
    HourlyForecastComponent,
    TranslatePipe
  ],
})
export class HomePage implements OnInit {
  // ... properties ...
  currentWeather: any;
  forecast: any[] = [];
  hourlyForecast: any[] = [];
  loading = true;
  error: string | null = null;
  cityName: string = '';

  constructor(
    public translationService: TranslationService,
    private weatherService: WeatherService,
    private locationService: LocationService
  ) {
    addIcons({ locationOutline, cloudyNightOutline, globeOutline });
  }

  async ngOnInit() {
    await this.loadCurrentLocationWeather();
  }

  async loadCurrentLocationWeather() {
    this.loading = true;
    this.error = null;
    try {
      const position = await this.locationService.getCurrentPosition();
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      await this.getWeatherData(lat, lon);
    } catch (err: any) {
      console.error('Geolocation failed:', err && err.message ? err.message : err);
      // Fallback to a default city instead of showing nothing
      this.onSearch('Pamplona');
    }
  }

  async getWeatherData(lat: number, lon: number) {
    this.loading = true;
    this.error = null;
    const lang = this.translationService.getCurrentLang(); // Get current language
    
    try {
      // Get Current Weather
      this.weatherService.getCurrentWeather(lat, lon, lang).subscribe({
        next: (data: any) => {
          this.currentWeather = data;
          this.cityName = data.name;
          
          // Get UV nested inside success of current weather to ensure we have coords (though we have lat/lon anyway)
          this.weatherService.getUVIndex(lat, lon).subscribe({
             next: (uvData: any) => {
                 this.currentWeather.uvIndex = uvData.value;
             },
             error: (err: any) => console.log('Error getting UV', err)
          });
        },
        error: (err: any) => {
          console.error(err);
          this.error = 'Error al obtener el clima actual.';
        }
      });

      // Get Forecast
      this.weatherService.getForecast(lat, lon, lang).subscribe({
        next: (data: any) => {
          this.processForecast(data);
          this.loading = false;
        },
        error: (err: any) => {
          console.error(err);
          this.error = 'Error al obtener el pronóstico.';
          this.loading = false;
        }
      });

    } catch (err) {
      this.loading = false;
      this.error = 'Error desconocido.';
    }
  }

  processForecast(data: any) {
    const list = data.list;
    const now = new Date();
    const currentDay = now.getDate();

    // Obtener las próximas 24h (8 bloques de 3h) para interpolar
    const itemsToInterpolate = list.slice(0, 10); 
    const hourlyFull = this.interpolateHourlyData(itemsToInterpolate);
    this.hourlyForecast = hourlyFull.slice(0, 24); 

    // Agrupar los días siguientes (excluyendo hoy)
    const grouped: any = {};
    
    for (const item of list) {
       const itemDate = new Date(item.dt * 1000);
       const dayKey = itemDate.toISOString().slice(0, 10);
       
       // Filtrar solo días futuros
       if (itemDate.getDate() !== currentDay) {
           if (!grouped[dayKey]) grouped[dayKey] = [];
           grouped[dayKey].push(item);
       }
    }

    // Convertir a array y limitar a 4 días
    this.forecast = Object.keys(grouped).sort().slice(0, 4).map(dateKey => ({
      date: dateKey,
      items: grouped[dateKey]
    }));
  }
  
  /**
   * Formatea una fecha string a formato largo en español o inglés
   */
  getSpanishDate(dateStr: string): string {
      const date = new Date(dateStr);
      const lang = this.translationService.getCurrentLang() === 'en' ? 'en-US' : 'es-ES';
      return new Intl.DateTimeFormat(lang, { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
  }

  changeLanguage(lang: string) {
    this.translationService.setLanguage(lang);
    this.loading = true; // Show loading while fetching with new language
    // Reload weather with new/cached location
    this.loadCurrentLocationWeather(); 
  }

  /**
   * Interpola linealmente los datos de temperatura y tiempo para generar
   * intervalos de 1 hora a partir de datos de 3 horas.
   */
  interpolateHourlyData(items: any[]): any[] {
      const result: any[] = [];
      
      for (let i = 0; i < items.length - 1; i++) {
          const current = items[i];
          const next = items[i+1];
          
          result.push(current);
          
          // Generar 2 puntos intermedios (t+1h, t+2h)
          for (let j = 1; j <= 2; j++) {
              const interpolated = JSON.parse(JSON.stringify(current));
              
              const currentDt = current.dt;
              const nextDt = next.dt;
              const dtDiff = nextDt - currentDt;
              
              const interpDt = currentDt + (dtDiff * (j / 3));
              
              interpolated.dt = Math.floor(interpDt);
              interpolated.dt_txt = new Date(interpDt * 1000).toISOString().replace('T', ' ').slice(0, 19);
              
              // Interpolación lineal de temperatura
              const tempDiff = next.main.temp - current.main.temp;
              interpolated.main.temp = current.main.temp + (tempDiff * (j / 3));
              
              interpolated.interpolated = true; // Flag interno

              result.push(interpolated);
          }
      }
      return result;
  }

  onSearch(city: string) {
    if (!city) return;
    this.loading = true;
    this.weatherService.getCoordinates(city).subscribe({
      next: (data: any) => {
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          this.getWeatherData(lat, lon);
        } else {
          this.error = 'Ciudad no encontrada.';
          this.loading = false;
        }
      },
      error: (err: any) => {
        this.error = 'Error al buscar la ciudad.';
        this.loading = false;
      }
    });
  }

  resetHome() {
    this.cityName = ''; // Clear search context if any
    this.loadCurrentLocationWeather();
  }
}
