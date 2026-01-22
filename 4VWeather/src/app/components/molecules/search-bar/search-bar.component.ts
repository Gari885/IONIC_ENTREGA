import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonItem, IonInput, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline } from 'ionicons/icons';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonItem, IonInput, IonButton, IonIcon]
})
export class SearchBarComponent {
  searchTerm: string = '';
  @Output() search = new EventEmitter<string>();

  constructor() {
    addIcons({ searchOutline });
  }

  onSearch() {
    if (this.searchTerm.trim()) {
      this.search.emit(this.searchTerm);
    }
  }
}
