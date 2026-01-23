import { Component, Input } from '@angular/core';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hourly-forecast',
  templateUrl: './hourly-forecast.component.html',
  styleUrls: ['./hourly-forecast.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslatePipe]
})
export class HourlyForecastComponent {
  @Input() forecast: any[] = [];

  constructor() {}

  getIconUrl(icon: string): string {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  }
}
