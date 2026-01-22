import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-daily-forecast',
  templateUrl: './daily-forecast.component.html',
  styleUrls: ['./daily-forecast.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class DailyForecastComponent {
  @Input() forecast: any[] = [];

  constructor() {}

  Math = Math; // Make Math available in template

  getIconUrl(icon: string): string {
    return `http://openweathermap.org/img/wn/${icon}@2x.png`;
  }

  getMaxTemp(items: any[]): number {
    return Math.max(...items.map(i => i.main.temp));
  }

  getSpanishDate(dateStr: string): string {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
  }
}
