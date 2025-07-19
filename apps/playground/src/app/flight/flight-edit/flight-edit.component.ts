import { Component, inject, viewChild } from '@angular/core';
import { ActionCardComponent } from '../../shared/ui/action-card/action-card.component';
import { FlightConnectionFormComponent } from '../shared/flight-connection-form/flight-connection-form.component';
import { FlightOperatorFormComponent } from '../shared/flight-operator-form/flight-operator-form.component';
import { FlightPriceFormComponent } from '../shared/flight-price-form/flight-price-form.component';
import { FlightTimesFormComponent } from '../shared/flight-times-form/flight-times-form.component';
import { FlightEditStore } from './flight-edit.store';

@Component({
    selector: 'app-flight-edit',
    imports: [ActionCardComponent, FlightConnectionFormComponent, FlightOperatorFormComponent, FlightTimesFormComponent, FlightPriceFormComponent],
    templateUrl: './flight-edit.component.html'
})
export class FlightEditComponent {
  store = inject(FlightEditStore);
  viewModel = this.store.getFlightEditVmAsPatchable();
  flightConnection = this.viewModel.flight.connection;
  flightTimes = this.viewModel.flight.times;
  flightOperator = this.viewModel.flight.operator;
  flightPrice = this.viewModel.flight.price;

  _connectionCard = viewChild.required<ActionCardComponent>('connection');
  _timesCard = viewChild.required<ActionCardComponent>('times');
  _operatorCard = viewChild.required<ActionCardComponent>('operator');
  _priceCard = viewChild<ActionCardComponent>('price');

  async onUpdateConnection() {
    try {
      await this.store.updateFlightConnection();
      this._connectionCard().showSuccess();
    } catch {
      this._connectionCard().showError();
    }
  }

  onUpdateTimes() {
    try {
      this.store.updateFlightConnection();
      this._timesCard().showSuccess();
    } catch {
      this._timesCard().showError();
    }
  }

  onUpdateOperator() {
    try {
      this.store.updateFlightConnection();
      this._operatorCard().showSuccess();
    } catch {
      this._operatorCard().showError();
    }
  }

  onUpdatePrice() {
    try {
      this.store.updateFlightConnection();
      this._priceCard()?.showSuccess();
    } catch {
      this._priceCard()?.showError();
    }
  }
}
