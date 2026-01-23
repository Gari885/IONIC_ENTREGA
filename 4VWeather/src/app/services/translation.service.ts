import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLangSubject = new BehaviorSubject<string>('es');
  currentLang$ = this.currentLangSubject.asObservable();

  private translations: any = {
    'es': {
      'WIND': 'Viento',
      'HUMIDITY': 'Humedad',
      'PRECIPITATION': 'Precipitación',
      'UV_INDEX': 'Índice UV',
      'PROB': 'Prob.',
      'SEARCH_PLACEHOLDER': 'Buscar ciudad...',
      'FEELS_LIKE': 'Sensación',
      'PRESSURE': 'Presión',
      'TODAY': 'Hoy',
      'NEXT_DAYS': 'Próximos días',
      'TITLE': 'TIEMPO 4VIENTOS',
      'MAX': 'Máx'
    },
    'en': {
      'WIND': 'Wind',
      'HUMIDITY': 'Humidity',
      'PRECIPITATION': 'Precipitation',
      'UV_INDEX': 'UV Index',
      'PROB': 'Prob.',
      'SEARCH_PLACEHOLDER': 'Search city...',
      'FEELS_LIKE': 'Feels Like',
      'PRESSURE': 'Pressure',
      'TODAY': 'Today',
      'NEXT_DAYS': 'Next Days',
      'TITLE': '4WINDS WEATHER',
      'MAX': 'Max'
    }
  };

  constructor() {}

  setLanguage(lang: string) {
    if (this.translations[lang]) {
      this.currentLangSubject.next(lang);
    }
  }

  getCurrentLang(): string {
    return this.currentLangSubject.value;
  }

  get(key: string): string {
    const lang = this.currentLangSubject.value;
    return this.translations[lang][key] || key;
  }
}
