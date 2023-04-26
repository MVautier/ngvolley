import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AdherentService } from '@app/core/services/adherent.service';
import { GalleryService } from '@app/admin/services/gallery.service';
import { LayoutService } from '@app/admin/services/layout.service';
import { User } from '@app/authentication/models/user.model';
import { ConnectionInfoService } from '@app/authentication/services/connexion-info.service';
import { Tree } from '@app/core/models/tree.model';
import { RouteService } from '@app/core/services/route.services';
import { environment } from '@env/environment';
import { AuthorizeApiService } from '@app/authentication/services/authorize-api.service';
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  tree: Tree;
  user: User;
  showDisplayMenu = false;
  showAdherentMenu = false;
  fullApp = environment.fullApp;
  isAdmin = false;

  constructor(
    private routeService: RouteService,
    private router: Router,
    private gallery: GalleryService,
    private connexionInfo: ConnectionInfoService,
    private layoutService: LayoutService,
    private authService: AuthorizeApiService,
    private adherentService: AdherentService
    ) { 
      this.routeService.subscribeConfig(tree => {
        this.tree = tree;
        this.initUI();
      }, 'subTreeAdmin');
      this.user = this.connexionInfo.UserInfo;
      this.isAdmin = this.user.Role === 'admin';
    }

  ngOnInit(): void {
    // this.adherentService.getListe().then(data => {
    // }).catch((err) => {
    //   console.log('error getting adherents: ', err);
    // });
  }

  ngOnDestroy(): void {
    
  }

  closeDisplayMenu() {
    this.showDisplayMenu = false;
  }

  closeAdherentMenu() {
    this.showAdherentMenu = false;
  }

  closeAllMenus() {
    this.showDisplayMenu = this.showAdherentMenu = false;
  }

  initUI() {
    
  }

  goMenu(menu: string) {
    this.router.navigate(['/admin/' + menu]);
    this.closeAllMenus();
  }

  exit() {
    this.router.navigate(['/']);
  }

  logout() {
    this.authService.LogOut().then(() => {
        console.log('logged out');
    }).finally(() => {
        this.exit();
    });
  }

}
