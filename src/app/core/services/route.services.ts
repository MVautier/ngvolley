import { Injectable } from '@angular/core';
import { NavigationEnd, Route, Router } from '@angular/router';
import { User } from '@app/authentication/models/user.model';
import { PageComponent } from '@app/page/components/page/page.component';
import { environment } from '@env/environment';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Tree } from '../models/tree.model';
import { WebItem } from '../models/web-item.model';
import { ApiPingService } from './api-ping.service';
import { HttpDataService } from './http-data.service';

@Injectable()
export class RouteService {
    private obsTree: BehaviorSubject<Tree> = new BehaviorSubject<Tree>(null);
    private obsPage: BehaviorSubject<WebItem> = new BehaviorSubject<WebItem>(null);
    private dicoSubscriptions: Subscription[] = [];
    currentIp: string;

    constructor(
        private http: HttpDataService<any>, 
        private pingService: ApiPingService,
        private router: Router) {
            console.log('================ route constructor');
            this.pingService.getIPAddress().then(ip => {
                this.currentIp = ip;
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

    start() {
        this.initTree().then(tree => {
            this.configureRouter(tree);
            console.log('ROUTER CONFIG = ', this.router.config) // A laisser
            this.setCurrentConfig(tree);
            this.setStartingRoute();
        }).catch((err) => {
            console.log('tree error: ', err);
        });
        this.router.events.subscribe(e => {
            if (e instanceof NavigationEnd) {
                this.setCurrentRoute(e.url);
            }
        });
    }

    initTree(): Promise<Tree> {
        return new Promise((resolve, reject) => {
            try {
                this.http.get(environment.apiUrl + 'tree').then((tree: Tree) => {
                    resolve(tree);
                }).catch(err => {
                    reject(err);
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    setCurrentRoute(url: string) {
        const page = this.obsTree.value.pages.find(p => url.endsWith(p.Slug));
        if (page) {
            this.obsPage.next(page);
        } else {
            const found = this.findPageInConfig(url);
            if (found) {
                this.obsPage.next(found);
            }
        }
    }

    setStartingRoute() {
        let path = document.location.pathname;
        if (path.startsWith('/page/')) {
            path = path.substring(6);
        }
        if (path.startsWith('/')) {
            path = path.substring(1);
        }
        this.setCurrentRoute(path);
    }

    findPageInConfig(url: string): WebItem {
        if (url.startsWith('/')) {
            url = url.substring(1);
        }
        const route = this.router.config[0].children.find(p => p.path === url);
        if (route) {
            return {
                IdItem: 0,
                Title: route.title.toString(),
                Slug: route.path,
                Type: 'page',
                Public: true
            };
        } else if (url.includes('admin')) {
            return {
                IdItem: 0,
                Title: 'Administration',
                Slug: 'admin',
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
            this.router.config = this.router.config.filter(r => !r.path.startsWith('page/'));
            let i = 1;
            tree.pages.forEach(p => {
                p.id = i;
                this.addPath(p.Slug);
                i++;
            });
        }
    }

    private addPath(path: string) {
        if (path) {
            if (this.router.config.findIndex(r => r.path === 'page/' + path) < 0) {
                const route: Route = {
                    path: 'page/' + path,
                    component: PageComponent
                };
                const index = this.router.config.findIndex(r => r.path === '**');
                if (index >= 0) {
                    this.router.config.splice(index, 0, route);
                } else {
                    this.router.config.push(route);
                }
            }
        }
    }
}