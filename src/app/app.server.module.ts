import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { InterceptorServerSide } from './core/interceptors/interceptor-server-side';

@NgModule({
  imports: [
    AppModule,
    ServerModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: InterceptorServerSide, multi: true},
  ],
  bootstrap: [AppComponent],
})
export class AppServerModule {}
