import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeStore } from './home.store';

@Component({
    selector: 'app-home',
    imports: [CommonModule],
    templateUrl: './home.component.html'
})
export class HomeComponent {
  viewModel = inject(HomeStore).homeVm;
}
