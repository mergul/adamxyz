import { forkJoin, Observable, of, Subject},from 'rxjs';
import { filter, map, mergeMap, takeUntil},from 'rxjs/operators';
import { Component, OnInit, OnDestroy, AfterViewInit, HostListener, NgZone, Renderer2, Inject},from '@angular/core';
import { NavigationStart, Router},from '@angular/router';
import { Location, DOCUMENT},from '@angular/common';
import { NewsService},from './core/news.service';
import { AuthService},from './core/auth.service';
import { UserService},from './core/user.service';
import { FirebaseUserModel},from './core/user.model';
import { ReactiveStreamsService},from './core/reactive-streams.service';
import { WindowRef},from './core/window.service';
import { ScriptLoaderService},from './core/script-loader.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly destroy = new Subject<void>();

  public state$: Observable<{ [key: string]: string},| undefined>;
  private newslistUrl: string;
  myWis: number;
  user: FirebaseUserModel = new FirebaseUserModel();
  _loggedinUser: Observable<boolean> = of();

  constructor(
    private reactiveService: ReactiveStreamsService, public service: UserService,
    private zone: NgZone, private scriptService: ScriptLoaderService, private router: Router,
    public location: Location, public authService: AuthService, public newsService: NewsService,
    private winRef: WindowRef, private renderer: Renderer2, @Inject(DOCUMENT) private _document: Document) {
    this.state$ = this.router.events
      .pipe(
        filter((e): e is NavigationStart => e instanceof NavigationStart),
        map((e: NavigationStart) => this.router.getCurrentNavigation()?.extras.state)
      );
    this.myWis = this.winRef.nativeWindow.innerWidth;
    if (!this.reactiveService.random) {
      this.reactiveService.random = Math.floor(Math.random() * (999999 - 100000)) + 100000;
    }
    this.newslistUrl = '/sse/chat/room/TopNews' + this.reactiveService.random + '/subscribeMessages';
  }
  ngOnInit() {
    this._loggedinUser = this.authService.isLoggedIn();
  }
  @HostListener('window:pagehide', ['$event'])
  doSomething() {
    this.reactiveService.closeSources();
  }
  checkMedia() {
    return this.myWis < 600;
  }
  get loggedinUser(): Observable<boolean> {
    return this.authService.isLoggedIn();
  }
  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
  btnClick(url: string) {
    this.router.navigateByUrl(url);
  }

  ngAfterViewInit(): void {
    this.zone.run(() => {
        this.winRef.nativeWindow.onload = () => {
            if (!this.reactiveService.statusOfNewsSource()) {
                this.reactiveService.getNewsStream(this.reactiveService.random, this.newslistUrl);
            }
            if (!this.newsService.newsStreamList$) {
                this.newsService.newsStreamList$ = this.reactiveService.getMessage(this.newsService.links[0]);
                this.newsService.tagsStreamList$ = this.reactiveService.getMessage(this.newsService.links[1]);
                this.newsService.peopleStreamList$ = this.reactiveService.getMessage(this.newsService.links[2]);
                this.newsService.meStreamList$ = this.reactiveService.getMessage('me');
                this.newsService.newsStreamCounts$ = this.reactiveService.getMessage('user-counts')
                    .pipe(map(record => {
                        if (record.key) {
                            this.newsService.newsCounts$.set(record.key, String(record.value));
                        }
                        return record;
                    }));
                this.service._hotBalance = this.reactiveService.getMessage('hotRecords');
                this.service._historyBalance = this.reactiveService.getMessage('user-history');
            }
            this.newsService.topTags = this.reactiveService.getMessage('top-tags')
                .pipe(map(value =>
                    value.filter((value1: { key: string; }) =>
                        value1.key.charAt(0) === '#')));
            this.scriptService.injectScript(this.renderer, this._document, 'https://fonts.googleapis.com/icon?family=Material+Icons'
                , 'link', '1', '', 'anonymous').then(val => val);
            if (this.location.isCurrentPathEqualTo('/user')) {
                this.scriptService.injectScript(this.renderer, this._document,
                    'https://webrtc.github.io/adapter/adapter-latest.js', 'script', '2', '', 'anonymous')
                    .then(val => val);
                this.scriptService.injectScript(this.renderer, this._document,
                    'https://cdn.jsdelivr.net/npm/video-stream-merger@3.6.1/dist/video-stream-merger.min.js', 'script', '3', '', 'anonymous')
                    .then(val => val);
            }
            if (!this.service.dbUser && !this.location.path().startsWith('/user') && this.location.path() !== '/login' &&
                this.location.path() !== '/upload' &&
                this.location.path() !== '/register' && this.location.path() !== '/admin') {
                this.authService.getUser().pipe(takeUntil(this.destroy), mergeMap(us => {
                    if (us !== null&&this.service.user) {
                        this.service._loggedUser = this.service.user;
                        this.service._loggedUser.id = this.service.user.id = this.service.createId(us.uid);
                        this.reactiveService.setListeners('@' + this.service._loggedUser.id);
                        return forkJoin([this.service.getDbUser('/api/rest/start/user/' + this.service.user.id + '/' + this.reactiveService.random), this.authService.token]);
                    }
                    return forkJoin([of(this.service.dbUser), of("")]);
                })).subscribe(([user, token]) => {
                    if (user) {
                        this.service.setDbUser(user);
                        if(this.service.user) this.service.user.token = token;
                    }
                    this.authService.checkComplete = false;
                });
            }
        };
    });
}
}
