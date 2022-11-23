import { Injectable } from '@angular/core';
import { User } from '@app/authentication/models/user.model';
import { Tree } from '@app/core/models/tree.model';
import { WebItem } from '@app/core/models/web-item.model';
import { ApiPingService } from '@app/core/services/api-ping.service';
import { RouteService } from '@app/core/services/route.services';


@Injectable()
export class PagesService {
    currentIp: string;
    private pages: WebItem[] = [];

    constructor(
        private routeService: RouteService,
        private pingService: ApiPingService
        ) {
        this.routeService.subscribeConfig(tree => {
            this.pages = tree?.pages || [];
          }, 'subTreePage');
        this.pingService.getIPAddress().then(ip => {
            this.currentIp = ip;
        });
    }

    duplicate(item: WebItem, user: User, type: string): WebItem {
        return {
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
            Slug: type === 'page' ? this.getSlug(item.Slug) : null,
            Title: item.Title,
            Type: type
        };
    }

    getSlug(slug: string): string {
        const s = slug.includes('_') ? slug.replace(/_copy[0-9]{1,}/gis, '') : slug;
        const pages = this.pages.filter(p => p.Slug.startsWith(s));
        const result =  s + '_' + pages.length;
        if (!pages.find(p => p.Slug === result)) {
            return result;
        } else {
            return result + '_';
        }
    }
}