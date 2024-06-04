import { EnvironmentProviders, makeEnvironmentProviders } from "@angular/core";
import { HateoasConfig, HateoasService } from "./services/hateoas.service";

export function provideHateoas(): EnvironmentProviders {
    return makeEnvironmentProviders([{
        provide: HateoasConfig,
        useValue: new HateoasConfig()
    }, {
        provide: HateoasService,
        useClass: HateoasService
    }]);
}