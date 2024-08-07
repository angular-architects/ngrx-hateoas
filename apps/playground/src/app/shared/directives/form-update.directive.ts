import { Directive, inject, output } from '@angular/core';
import { NgForm } from '@angular/forms';

@Directive({ selector: 'form[appUpdate]', standalone: true })
export class FormUpdateDirective {

  private ngForm = inject(NgForm);

  appUpdate = output<any>()

  constructor() {
    this.ngForm.valueChanges?.subscribe((value) => this.appUpdate.emit(value));
  }
}
