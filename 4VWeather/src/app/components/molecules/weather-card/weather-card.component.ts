import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-weather-card',
  templateUrl: './weather-card.component.html',
  styleUrls: ['./weather-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, TranslatePipe]
})
export class WeatherCardComponent implements OnInit, OnDestroy {
  @Input() weather: any;
  currentTime: Date = new Date();
  private timer: any;

  constructor() {}

  ngOnInit() {
    this.timer = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  getIconUrl(icon: string): string {
    return `http://openweathermap.org/img/wn/${icon}@4x.png`;
  }
}
