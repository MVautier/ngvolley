import { Injectable } from '@angular/core';
import { Route, Router } from '@angular/router';
import { RouteService } from '@app/core/services/route.services';
import { PageComponent } from '@app/page/components/page/page.component';
import { environment } from '@env/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class LayoutService {

    constructor(private routeService: RouteService) {

    }
}