import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreState } from '../core.state';

@Component({
  selector: 'app-home', 
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  viewModel = inject(CoreState).homeVm.resource;
}
