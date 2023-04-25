import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import { map} from 'rxjs/operators';
import { Adherent } from "../models/adherent.model";
import { environment } from "@env/environment";

@Injectable()
export class CoursesResolver implements Resolve<Adherent[]> {

    constructor(private http: HttpClient) {

    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):  Observable<Adherent[]> {
        return this.http.get(environment.apiUrl + 'Adherent')
            .pipe(map(res => res['payload']));
    }

}