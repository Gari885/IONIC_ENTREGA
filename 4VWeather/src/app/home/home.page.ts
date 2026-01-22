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
    const now = new Date();
    const currentDay = now.getDate();

    // 1. Hourly: Interpolate strictly to get 1h intervals for the immediate future
    // We linearly interpolate the first chunk of data to ensure we have the next 24h hour-by-hour
    const itemsToInterpolate = list.slice(0, 10); // Take enough 3h chunks to cover >24h
    const hourlyFull = this.interpolateHourlyData(itemsToInterpolate);
    this.hourlyForecast = hourlyFull.slice(0, 24); // Exactly next 24 hours

    // 2. Daily: "Next 4 Days" (Original 3h data)
    // Group by Day (Local Time) to align with user's perception of "Tomorrow"
    const grouped: any = {};
    
    for (const item of list) {
       const itemDate = new Date(item.dt * 1000);
       const dayKey = itemDate.toISOString().slice(0, 10); // Use ISO Key for sorting uniqueness
       
       // Strict check: Only include if it is NOT today (Local day comparison)
       if (itemDate.getDate() !== currentDay) {
           if (!grouped[dayKey]) grouped[dayKey] = [];
           grouped[dayKey].push(item);
       }
    }

    // Convert to array and take next 4
    this.forecast = Object.keys(grouped).sort().slice(0, 4).map(dateKey => ({
      date: dateKey,
      items: grouped[dateKey]
    }));
  }
  
  // Helper for Spanish Date in Template
  getSpanishDate(dateStr: string): string {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
  }

  interpolateHourlyData(items: any[]): any[] {
      const result: any[] = [];
      
      for (let i = 0; i < items.length - 1; i++) {
          const current = items[i];
          const next = items[i+1];
          
          result.push(current);
          
          // Interpolate 2 intermediate points (t+1, t+2)
          for (let j = 1; j <= 2; j++) {
              // Deep clone
              const interpolated = JSON.parse(JSON.stringify(current));
              
              // Time Math using Timestamps (dt is seconds)
              const currentDt = current.dt;
              const nextDt = next.dt;
              const dtDiff = nextDt - currentDt; // Should be 10800 seconds (3h)
              
              const interpDt = currentDt + (dtDiff * (j / 3));
              
              // Updates
              interpolated.dt = Math.floor(interpDt);
              // Update dt_txt for display consistency if used
              interpolated.dt_txt = new Date(interpDt * 1000).toISOString().replace('T', ' ').slice(0, 19);
              
              // Temp Interpolation
              const tempDiff = next.main.temp - current.main.temp;
              interpolated.main.temp = current.main.temp + (tempDiff * (j / 3));
              
              // Basic distinct key to avoid ngFor errors if strict tracking used
              interpolated.interpolated = true; 

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
}
