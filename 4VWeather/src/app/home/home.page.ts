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

    // 1. "Today" forecast (every 3 hours available for the rest of the day)
    // NOTE: OpenWeather free API only provides 3-hour intervals (`list`). 
    // We cannot get 1-hour intervals without the OneCall API subscription.
    // We will display ALL available 3-hour slots for the current date as the "Hourly" section.
    this.hourlyForecast = list.filter((item: any) => item.dt_txt.startsWith(today));

    // If "Today" has very few items left (e.g. it's 11 PM), maybe we should append early tomorrow?
    // User requested "El dia de hoy", so we stick to 'today's items'.
    // If empty (end of day), we could show a message or just show the very next few hours of tomorrow?
    // Let's fallback to "Next 24h" logic if today's list is too short, or stick to literal "Today".
    // For better UX, if today is almost over, show "Next 24h".
    // Let's stick to "Next 8 items (24h)" as "Hourly" carousel is usually intended for immediate future,
    // which effectively covers "Today + Tonight".
    this.hourlyForecast = list.slice(0, 9); // Show next 24h (approx 8-9 items)

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
      items: grouped[date] // This strictly contains the 3h intervals for that day
    }));
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
