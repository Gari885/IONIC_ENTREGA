import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../services/translation.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-daily-forecast',
  templateUrl: './daily-forecast.component.html',
  styleUrls: ['./daily-forecast.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslatePipe]
})
export class DailyForecastComponent {
  @Input() forecast: any[] = [];

  constructor(private translationService: TranslationService) {}

  Math = Math; // Make Math available in template

  getIconUrl(icon: string): string {
    return `http://openweathermap.org/img/wn/${icon}@2x.png`;
  }

  getMaxTemp(items: any[]): number {
    return Math.max(...items.map(i => i.main.temp));
  }

  getSpanishDate(dateStr: string): string {
    const date = new Date(dateStr);
    const lang = this.translationService.getCurrentLang() === 'en' ? 'en-US' : 'es-ES';
    return new Intl.DateTimeFormat(lang, { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
  }
}
