import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-weather-card',
  templateUrl: './weather-card.component.html',
  styleUrls: ['./weather-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, IonIcon]
})
export class WeatherCardComponent {
  @Input() weather: any;

  constructor() {}

  getIconUrl(icon: string): string {
    return `http://openweathermap.org/img/wn/${icon}@4x.png`;
  }
}
