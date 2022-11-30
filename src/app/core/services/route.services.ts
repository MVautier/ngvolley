import { Injectable } from '@angular/core';
import { NavigationEnd, NavigationStart, Route, Router } from '@angular/router';
import { User } from '@app/authentication/models/user.model';
import { PageComponent } from '@app/ui/layout/components/page/page.component';
import { environment } from '@env/environment';
import { BehaviorSubject, filter, Subscription } from 'rxjs';
import { HrefToRouterLinkDirective } from '../directives/href-to-routerlink.directive';
import { Tree } from '../models/tree.model';
import { WebItem } from '../models/web-item.model';
import { AdminService } from './admin.service';
import { ApiPingService } from './api-ping.service';
import { HttpDataService } from './http-data.service';

@Injectable()
export class RouteService {
    private obsTree: BehaviorSubject<Tree> = new BehaviorSubject<Tree>(null);
    public obsPage: BehaviorSubject<WebItem> = new BehaviorSubject<WebItem>(null);
    private dicoSubscriptions: Subscription[] = [];
    currentIp: string;
    staticRoutes = ['home', 'inscription', 'admin'];

    constructor(
        private adminService: AdminService, 
        private pingService: ApiPingService,
        private routerLink: HrefToRouterLinkDirective,
        private router: Router) {
            console.log('================ route constructor');
            this.pingService.getIPAddress().then(ip => {
                this.currentIp = ip;
            });
            this.start().then(() => {
                this.router.events.pipe(filter(event => event instanceof NavigationStart)).subscribe((event: NavigationStart) => {
                    console.log('navigated to route: ', event.url);
                    const item = this.findPageInConfig(event.url); 
                    if (item) {
                        this.routerLink.ngOnDestroy();
                        this.routerLink.ngOnInit();
                        this.setCurrentPage(item);
                    }
                });
                // this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
                //     console.log('navigated to route: ', event.url);
                //     const item = this.findPageInConfig(event.url); 
                //     if (item) {
                //         this.routerLink.ngOnDestroy();
                //         this.setCurrentPage(item);
                //     }
                // });
            });
    }

    public subscribeConfig(next?: (value: Tree) => void, keySubscription?: string) {
        const subscriber = this.obsTree.subscribe(next);
        this.addSubscription(subscriber, keySubscription);
    }

    public subscribePage(next?: (value: WebItem) => void, keySubscription?: string) {
        const subscriber = this.obsPage.subscribe(next);
        this.addSubscription(subscriber, keySubscription);
    }

    public setCurrentConfig(tree: Tree) {
        this.obsTree.next(tree);
        this.configureRouter(tree);
        console.log('router changed: ', this.router.config);
    }

    public getCurrentConfig() : Tree {
        return this.obsTree.value;
    }

    public setCurrentPage(page: WebItem) {
        this.obsPage.next(page);
    }

    public getCurrentPage() : WebItem {
        return this.obsPage.value;
    }

    duplicate(item: WebItem, user: User, type: string): WebItem {
        return {
            id: this.getNewId(item.Type),
            IdItem: 0,
            Author: user.FirstName + ' ' + user.LastName,
            Content: item.Content,
            Date: new Date(),
            Description: item.Description,
            IdAuthor: user.IdUser,
            IdCategory: item.IdCategory,
            IdPages: item.IdPages,
            IdParent: item.IdParent,
            IdPost: item.IdPost,
            Ip: this.currentIp,
            Modified: null,
            Order: item.Order !== null ? item.Order + 1 : 0,
            Public: item.Public,
            Resume: item.Resume,
            Slug: type === 'page' ? this.getNewSlug(item.Slug) : null,
            Title: item.Title,
            Type: type
        };
    }

    addOrUpdateInTree(item: WebItem) {
        if (item) {
            let items = this.getItemsByType(item.Type);
            const index = items.findIndex(p => p.id === item.id);
            if (index >= 0) {
                if (item.Type === 'page' && item.oldpath) {
                    this.addPath(item.Slug, item.oldpath);
                }
                items = items.splice(index, 1, item);
            } else {
                items.push(item);
                if (item.Type === 'page') {
                    this.addPath(item.Slug);
                }
            }
        }
    }

    getItemsByType(type: string): WebItem[] {
        const tree = this.obsTree.value;
        let items: WebItem[] = [];
        switch(type) {
            case 'page':
                items = tree.pages;
                break;
            case 'post':
                items = tree.posts;
                break;
            case 'comment':
                items = tree.comments;
                break;
        }
        return items;
    }

    getNewId(type: string): number {
        const items = type === 'page' ? this.obsTree.value.pages : this.obsTree.value.posts;
        if (items && items.length) {
            return Math.max(...items.map(o => o.id)) + 1;
        }
        return 1;
    }

    getNewSlug(slug: string): string {
        const s = slug.includes('_') ? slug.replace(/_[0-9]{1,}/gis, '') : slug;
        const pages = this.obsTree.value.pages.filter(p => p.Slug.startsWith(s));
        const result =  s + '_' + pages.length;
        if (!pages.find(p => p.Slug === result)) {
            return result;
        } else {
            return result + '_';
        }
    }

    public addPage(page: WebItem) {
        const tree = this.obsTree.value;
        if (tree?.pages?.length && page.Order >= 0) {
            let pages = tree.pages.filter(p => p.Order < page.Order);
            const after = tree.pages.filter(p => p.Order >= page.Order);
            pages.push(page);
            if (after.length) {
                after.forEach(p => {
                    p.Order++;
                });
            }
            pages = pages.concat(after);
            tree.pages = pages;
        } else {
            tree.pages = [page];
        }
        this.setCurrentConfig(tree);
    }

    removePages(pages: WebItem[]) {
        const tree = this.obsTree.value;
        pages.forEach(page => {
            if (page.IdItem > 0) {
                tree.pages = tree.pages.filter(p => p.IdItem !== page.IdItem);
            } else {
                tree.pages = tree.pages.filter(p => p.Slug !== page.Slug);
            }
        });
        // TODO : call api
        this.setCurrentConfig(tree);
    }

    private addSubscription(subscriber: Subscription, keySubscription: string) {
        if (keySubscription) {
          this.unsubscribe(keySubscription);
          this.dicoSubscriptions[keySubscription] = subscriber;
        }
    }
    
    private unsubscribe(keySubscription: string): void {
        if (this.dicoSubscriptions[keySubscription]) {
          this.dicoSubscriptions[keySubscription].unsubscribe();
        }
    }

    start(): Promise<void> {
        return this.adminService.getTree().then(tree => {
            this.configureRouter(tree);
            console.log('ROUTER CONFIG = ', this.router.config) // A laisser
            this.setCurrentConfig(tree);
            this.setStartingRoute();
        }).catch((err) => {
            console.log('tree error: ', err);
        });
    }

    setStartingRoute() {
        let path = document.location.pathname;
        if (path.startsWith('/')) {
            path = path.substring(1);
        }
        const item = this.findPageInConfig(path);
        if (item) {
            this.setCurrentPage(item);
        }
    }

    findPageInConfig(url: string): WebItem {
        if (url.startsWith('/')) {
            url = url.substring(1);
        }
        const routes = this.router.config[0].children.filter(r => !this.staticRoutes.includes(r.path));
        const route = routes.find(p => p.path === url);
        if (route) {
            return this.obsTree.value.pages.find(p => p.Slug === url);
        } else if (url.includes('admin')) {
            return {
                IdItem: 0,
                Title: 'Administration',
                Slug: 'admin',
                Type: 'page',
                Public: true
            };
        } else if (url.includes('inscription')) {
            return {
                IdItem: 0,
                Title: 'Inscription',
                Slug: 'inscription',
                Type: 'page',
                Public: true
            };
        }
        return {
            IdItem: 0,
            Title: 'Accueil',
            Slug: '',
            Type: 'page',
            Public: true
        };
    }

    private configureRouter(tree: Tree) {
        if (tree.pages && tree.pages.length) {
            let routes = this.router.config[0].children;
            routes = routes.filter(r => !this.staticRoutes.includes(r.path));
            let i = 1;
            tree.pages.forEach(p => {
                p.id = i;
                this.addPath(p.Slug);
                i++;
            });
        }
    }

    private addPath(path: string, oldpath?: string) {
        const routes = this.router.config[0].children;
        if (path && routes && routes.length) {
            if (oldpath) {
                const index = routes.findIndex(r => r.path === oldpath);
                if (index >= 0) {
                    const route: Route = {
                        path: path,
                        component: PageComponent
                    };
                    routes.splice(index, 1, route);
                }
            } else {
                if (routes.findIndex(r => r.path === path) < 0) {
                    const route: Route = {
                        path: path,
                        component: PageComponent
                    };
                    const index = routes.findIndex(r => r.path === '**');
                    if (index >= 0) {
                        routes.splice(index, 0, route);
                    } else {
                        routes.push(route);
                    }
                }
            }
        }
    }
}