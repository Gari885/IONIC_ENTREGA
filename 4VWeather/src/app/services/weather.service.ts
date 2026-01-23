import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey = environment.apiKey;
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getCoordinates(city: string): Observable<any[]> {
    return this.http.get<any[]>(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${this.apiKey}`);
  }

  getCurrentWeather(lat: number, lon: number, lang: string = 'es'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/weather?lat=${lat}&lon=${lon}&units=metric&lang=${lang}&appid=${this.apiKey}`);
  }

  getForecast(lat: number, lon: number, lang: string = 'es'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/forecast?lat=${lat}&lon=${lon}&units=metric&lang=${lang}&appid=${this.apiKey}`);
  }

  getUVIndex(lat: number, lon: number): Observable<any> {
    // Current UV API: https://api.openweathermap.org/data/2.5/uvi?lat={lat}&lon={lon}&appid={API key}
    // Or OneCall if available, but sticking to standard keys:
    return this.http.get<any>(`${this.apiUrl}/uvi?lat=${lat}&lon=${lon}&appid=${this.apiKey}`);
  }
}
