import { Component, effect, input, model, output } from '@angular/core';
import { timer } from 'rxjs';

@Component({
    selector: 'app-action-card',
    imports: [],
    templateUrl: './action-card.component.html'
})
export class ActionCardComponent {
  
  disabled = input(false);

  showSuccess = model(false);
  showError = model(false);

  execute = output<void>();

  constructor() {
    effect(() => {

      if(this.showSuccess()) {
        timer(3000).subscribe(() => this.showSuccess.set(false));
      }

      if(this.showError()) {
        timer(3000).subscribe(() => this.showError.set(false));
      }

    });
  }

  onExecute() {
    this.execute.emit();
  }
}
