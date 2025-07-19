import { Component, input, output, signal } from '@angular/core';
import { timer } from 'rxjs';

@Component({
    selector: 'app-action-card',
    imports: [],
    templateUrl: './action-card.component.html'
})
export class ActionCardComponent {
  
  disabled = input(false);
  save = output<void>();

  _showSuccess = signal(false);
  _showError = signal(false);

  onSave() {
    this.save.emit();
  }

  showSuccess() {
    this._showSuccess.set(true);
    timer(3000).subscribe(() => this._showSuccess.set(false));
  }

  showError() {
    this._showError.set(true);
    timer(3000).subscribe(() => this._showError.set(false));
  }
}
