import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CoreState } from '../core.state';

@Component({
  selector: 'app-home', 
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  viewModel = inject(CoreState).homeVm.resource;
}
