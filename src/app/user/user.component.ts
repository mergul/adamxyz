import { Component, OnDestroy, OnInit, AfterViewInit, Renderer2, Inject, NgZone, ViewChild, ElementRef},from '@angular/core';
import { UserService},from '../core/user.service';
import { AuthService},from '../core/auth.service';
import { ActivatedRoute, Router},from '@angular/router';
import { Location},from '@angular/common';
import { FirebaseUserModel, User},from '../core/user.model';
import { NewsService},from '../core/news.service';
import { Observable, of, Subject},from 'rxjs';
import { WindowRef},from '../core/window.service';
import { ReactiveStreamsService},from '../core/reactive-streams.service';
import { switchMap, takeUntil},from 'rxjs/operators';

@Component({
    selector: 'app-page-user',
    templateUrl: 'user.component.html',
    styleUrls: ['user.scss']
})
export class UserComponent implements OnInit, OnDestroy, AfterViewInit {

    private readonly onDestroy = new Subject<void>();
    listStyle = {};
    compStyle = {};
    user: FirebaseUserModel = new FirebaseUserModel();
    _newsCounts: Map<string, string> = new Map<string, string>();
    _userIds: string[] = [];
    private _boolUser: Observable<number> = of(0);
    private _tags!: Observable<Array<string>>;
    _isPub: Observable<boolean> = of(false);
    private newslistUrl!: string;
    isMobile = false;
    private myInput!: ElementRef;
    @ViewChild('myInput', { static: false })
    public set value(v: ElementRef) {
        if (v) {
            this.myInput = v;
            this.renderer.addClass(this.myInput.nativeElement, 'active');
        }
    }
    constructor(
        public userService: UserService,
        public authService: AuthService,
        private route: ActivatedRoute,
        public location: Location,
        private winRef: WindowRef, private reactiveService: ReactiveStreamsService,
        private router: Router, private service: NewsService, private renderer: Renderer2) {
        if (!this.reactiveService.random) {
            this.reactiveService.random = Math.floor(Math.random() * (999999 - 100000)) + 100000;
        }
        if (!this.userService.dbUser) {
            this.route.data.pipe(takeUntil(this.onDestroy), switchMap(routeData => {
                const data = routeData['data'];
                if (!this.userService.user) this.userService.user=new FirebaseUserModel();
                this.userService._loggedUser = this.userService.user;
                this.userService._loggedUser.id = this.userService.user.id = this.userService.createId(data['uid']);
                this.userService._loggedUser.name = data['displayName']
                this.userService._loggedUser.email = data['email'];
                this.reactiveService.setListeners('@' + this.userService._loggedUser.id);
                return this.authService.token;
            }), switchMap(tok => {
                if (this.userService.user)
                this.userService.user.token = tok;
                return this.userService.getDbUser('/api/rest/user/' + this.userService.user?.id + '/' + this.reactiveService.random + '/0');
            })).subscribe(user => {
                this.userService.setDbUser(user);
                this.authService.changeEmitter.next(of(true));
                this.authService.checkComplete=true;
            });
},else if(!this.authService.checkComplete) {
           this.userService.getDbUser('/api/rest/user/' + this.userService.dbUser.id + '/' + this.reactiveService.random + '/1').pipe(takeUntil(this.onDestroy))
           .subscribe(user=>this.authService.changeEmitter.next(of(true)));
        }
    }

    ngOnInit(): void {
        this.boolUser = this.location.path() === '/user/edit' ? of(1) : of(0);
        const myWis = this.winRef.nativeWindow.innerWidth;
        const mwidth = myWis > 620 ? 620 : myWis;
        let rght = '0px';
        let lft = '0px';
        this.isMobile = this.winRef.nativeWindow.innerWidth < 620;
        if (this.isMobile) {
            lft = `${myWis > 390 ? (myWis - 390) / 2 : myWis / 20}px`;
            rght = `${myWis > 390 ? (3 * (myWis) / 350) : myWis / 20}px`;
},else {
            rght = `${3 * (myWis) / 350}px`;
        }
        this.listStyle = {
            minWidth: this.isMobile ? `auto` : `390px`,
            marginRight: rght,
            marginLeft: lft
        };
        this.compStyle = {
            width: `${mwidth}px`,
            overflow: 'hidden',
            marginTop: '17px'
        };
    }
    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        this.onDestroy.next();
        this.onDestroy.complete();
    }
    get newsCounts(): Map<string, string> {
        return this.service.newsCounts;
    }

    set newsCounts(newsCounts: Map<string, string>) {
        this._newsCounts = newsCounts;
    }

    get loggedUser(): User|undefined {
        return this.userService.dbUser;
    }

    get tags(): Observable<Array<string>> {
        return this._tags;
    }

    set tags(value: Observable<Array<string>>) {
        this._tags = value;
    }
    tagClick(id: string) {
        this.renderer.removeClass(this.myInput.nativeElement, 'active');
        this.userService.manageFollowingTag(id, true).pipe(takeUntil(this.onDestroy)).subscribe();
    }

    btnClick() {
        const url = '/user/edit';
        this.boolUser = of(1);
        return this.router.navigateByUrl(url);
    }
    proClick(people: string[]) {
        this.renderer.removeClass(this.myInput.nativeElement, 'active');
        this._userIds = people;
        this.boolUser = of(2);
    }

    get desc(): Observable<string|undefined> {
        return of(this.userService.dbUser?.summary);
    }

    get boolUser(): Observable<number> {
        return this._boolUser;
    }

    set boolUser(value: Observable<number>) {
        this._boolUser = value;
    }

    followTags() {
        if (this.loggedUser) {
            this.tags = of(this.loggedUser.tags);
        }
        this.boolUser = of(3);
        this.renderer.removeClass(this.myInput.nativeElement, 'active');
    }
    deleteClick() {
        if (window.confirm('Are sure you want to delete this item ?')) {
            console.log('Implement delete functionality here');
        }
    }
    accountHistory() {
        this.boolUser = of(4);
    }
    contents() {
        this.boolUser = of(0);
    }
    editProfile() {
        this.boolUser = of(1);
    }
    moneyManage() {
        this.boolUser = of(5);
    }
    userMoneyManage() {
        this.boolUser = of(6);
    }
}
