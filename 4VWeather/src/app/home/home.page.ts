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
import { locationOutline } from 'ionicons/icons';

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
    addIcons({ locationOutline });
  }
  
  // ... (rest of the file remains similar but I need to map it correctly)
  // Actually I will just fix the typo and type errors in place using context or just replace the whole Class content again to be safe and cleaner?
  // Replacing whole file content with fixed version is safer to avoid context shifting if line numbers are off.
  
  // Wait, I can just target the specific lines using context.
  
  // Typo fix:

    addIcons({ locationOutline });
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
    // Hourly: next 8 items (approx 24h)
    this.hourlyForecast = list.slice(0, 8);

    // Daily: Filter for one entry per day (e.g., at 12:00 PM) or just group them
    // For simplicity, taking every 8th item (24h) roughly, starting from tomorrow?
    // Or just identifying unique days.
    // Let's take one reading per day, specifically around noon if possible, 
    // or just the next 4 days separated by 24h chunks.
    
    // Quick filtering:
    const daily: any[] = [];
    const usedDates = new Set();
    
    // Get today's date string
    const today = new Date().toISOString().slice(0, 10);

    for (const item of list) {
      const date = item.dt_txt.slice(0, 10);
      if (date !== today && !usedDates.has(date)) {
        // Find the item closest to noon for this day? 
        // Or just take the first one available for that day?
        // Let's try to pick 15:00:00 (mid-day ish) if possible, or usually 12:00:00
        if (item.dt_txt.includes('12:00:00') || item.dt_txt.includes('15:00:00') || !daily.some(d => d.dt_txt.slice(0,10) === date)) {
           // If we don't have this date yet, add it. 
           // If we do, but this one is better (noon), replace it? 
           // Simplest: just take the first entry (00:00 or 03:00) or check specifically for '12:00:00'
        }
      }
    }
    
    // Revised daily logic:
    // We want 4 days.
    // Group by day.
    const grouped: any = {};
    for (const item of list) {
       const date = item.dt_txt.slice(0, 10);
       if (date === today) continue; // Skip today for daily forecast list
       if (!grouped[date]) grouped[date] = [];
       grouped[date].push(item);
    }

    this.forecast = Object.keys(grouped).slice(0, 4).map(date => {
       // Pick the one closest to 12:00
       const dayItems = grouped[date];
       // simple: pick middle item
       return dayItems[Math.floor(dayItems.length / 2)];
    });
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
