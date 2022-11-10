import { User } from '../models/user.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserToken } from '../models/user-token.model';

export class ConnectionInfoService {
  Token!: UserToken | null;
  UserInfo!: User;
  isLoaded = false;
  private onChangeConnexion = new BehaviorSubject<UserToken>(null);

  SetNewConnexionState(token: UserToken | null): void {
    this.Token = token;
  }

  SetClientInfo(userInfo: User): void {
    this.UserInfo = userInfo;
    this.isLoaded = true;
  }

  TriggerConnexionChange(): void {
    this.onChangeConnexion.next(this.Token);
  }

  GetOnChangeConnexion(): Observable<UserToken> {
    return this.onChangeConnexion.asObservable();
  }

  IsAuth(): boolean {
    if (this.Token && this.Token.IdUser) {
      return true;
    }
    return false;
  }
}
