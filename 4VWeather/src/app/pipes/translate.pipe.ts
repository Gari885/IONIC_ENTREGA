import { Pipe, PipeTransform, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { TranslationService } from '../services/translation.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Impure to update on language change
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private subscription: Subscription;
  private lastLang: string = '';

  constructor(
    private translationService: TranslationService,
    private _ref: ChangeDetectorRef
  ) {
    this.subscription = this.translationService.currentLang$.subscribe(lang => {
      if (lang !== this.lastLang) {
        this.lastLang = lang;
        this._ref.markForCheck();
      }
    });
  }

  transform(key: string): string {
    return this.translationService.get(key);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
