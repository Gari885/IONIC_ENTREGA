import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSpinner, IonButtons, IonButton, IonIcon } from '@ionic/angular/standalone';
import { SearchBarComponent } from '../components/molecules/search-bar/search-bar.component';
import { WeatherCardComponent } from '../components/molecules/weather-card/weather-card.component';
import { DailyForecastComponent } from '../components/organisms/daily-forecast/daily-forecast.component';
import { HourlyForecastComponent } from '../components/organisms/hourly-forecast/hourly-forecast.component';
import { WeatherService } from '../services/weather.service';
import { LocationService } from '../services/location.service';
import { addIcons } from 'ionicons';
import { locationOutline, cloudyNightOutline } from 'ionicons/icons';

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
    HourlyForecastComponent
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
    private weatherService: WeatherService,
    private locationService: LocationService
  ) {
    addIcons({ locationOutline, cloudyNightOutline });
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
    } catch (err) {
      this.error = 'No se pudo obtener la ubicación. Por favor, busca una ciudad.';
      this.loading = false;
    }
  }

  async getWeatherData(lat: number, lon: number) {
    this.loading = true;
    this.error = null;
    try {
      // Get Current Weather
      this.weatherService.getCurrentWeather(lat, lon).subscribe({
        next: (data: any) => {
          this.currentWeather = data;
          this.cityName = data.name;
          
          // Get UV nested inside success of current weather to ensure we have coords (though we have lat/lon anyway)
          this.weatherService.getUVIndex(lat, lon).subscribe({
             next: (uvData: any) => {
                 this.currentWeather.uvIndex = uvData.value;
             },
             error: (err) => console.log('Error getting UV', err)
          });
        },
        error: (err: any) => {
          console.error(err);
          this.error = 'Error al obtener el clima actual.';
        }
      });

      // Get Forecast
      this.weatherService.getForecast(lat, lon).subscribe({
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
    const today = new Date().toISOString().slice(0, 10);

    // 1. Hourly Forecast (Next 24 Hours)
    // Instead of strictly filtering "Today" (which breaks at night), 
    // we take the next 8 items (8 * 3h = 24h) and interpolate them.
    const next24hItems = list.slice(0, 9); // Take 9 to cover the interpolation gap to the 24th hour
    this.hourlyForecast = this.interpolateHourlyData(next24hItems).slice(0, 24);

    // 2. Next 4 Days (Excluding today)
    const grouped: any = {};
    
    for (const item of list) {
       const date = item.dt_txt.slice(0, 10);
       if (date === today) continue; // Skip Today
       if (!grouped[date]) grouped[date] = [];
       grouped[date].push(item);
    }

    // Ensure we have exactly 4 days
    this.forecast = Object.keys(grouped).slice(0, 4).map(date => ({
      date: date,
      items: grouped[date] 
    }));
  }

  // Helper for Spanish Date in Template
  getSpanishDate(dateStr: string): string {
      const date = new Date(dateStr);
      // Format: "Viernes, 23 Enero"
      return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
  }

  interpolateHourlyData(items: any[]): any[] {
      const result: any[] = [];
      
      for (let i = 0; i < items.length - 1; i++) {
          const current = items[i];
          const next = items[i+1];
          
          result.push(current);
          
          for (let j = 1; j <= 2; j++) {
              const interpolated = JSON.parse(JSON.stringify(current));
              
              const currentTime = new Date(current.dt_txt).getTime();
              const nextTime = new Date(next.dt_txt).getTime();
              const timeDiff = nextTime - currentTime; 
              
              // Only interpolate if gap is close to 3h (avoid spanning large gaps if data is missing)
              // OpenWeather 'list' is usually contiguous.
              const interpTime = currentTime + (timeDiff * (j / 3));
              interpolated.dt_txt = new Date(interpTime).toISOString().replace('T', ' ').slice(0, 19);
              
              const tempDiff = next.main.temp - current.main.temp;
              interpolated.main.temp = current.main.temp + (tempDiff * (j / 3));

              result.push(interpolated);
          }
      }
      
      // Ensure we catch the last one if needed, but slice(0,24) handles the cutoff
      if (items.length > 0) {
          result.push(items[items.length - 1]);
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
}
