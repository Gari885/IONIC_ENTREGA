import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonList, IonItem, IonLabel, IonNote, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-daily-forecast',
  templateUrl: './daily-forecast.component.html',
  styleUrls: ['./daily-forecast.component.scss'],
  standalone: true,
  imports: [CommonModule, IonList, IonItem, IonLabel, IonNote, IonIcon]
})
export class DailyForecastComponent {
  @Input() forecast: any[] = [];

  constructor() {}

  getIconUrl(icon: string): string {
    return `http://openweathermap.org/img/wn/${icon}@2x.png`;
  }
}
