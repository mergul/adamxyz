import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CommentsComponent } from '../comments/comments.component';
import { NewsPayload } from '../core/news.model';
import { NewsService } from '../core/news.service';
import { ReactiveStreamsService } from '../core/reactive-streams.service';
import { User } from '../core/user.model';
import { UserService } from '../core/user.service';
import { WindowRef } from '../core/window.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
})
export class PostComponent implements OnInit, OnDestroy {
  _url: any;
  _news!: NewsPayload;
  othersList$!: NewsPayload[];
  thumbHeight = 109;
  fontSize = 12;
  height = 109;
  commUrl!: string;
  userId!: string;
  user!: Observable<User>;
  @ViewChild(CommentsComponent)
  commentsComponent!: CommentsComponent;
  @ViewChild('miButton', { static: true })
  miButton!: ElementRef;

  constructor(
    private userService: UserService,
    private newsService: NewsService,
    private route: ActivatedRoute,
    private router: Router,
    private reactiveService: ReactiveStreamsService,
    private winRef: WindowRef
  ) {}

  ngOnInit(): void {
    if (this.winRef.nativeWindow.innerWidth < 1080) {
      this.height = this.thumbHeight * (4 / 5);
      this.thumbHeight = this.height - 19;
      this.fontSize = 9;
    } else {
      this.thumbHeight = this.thumbHeight - 19;
    }
  }
  @Input()
  get news() {
    return this._news;
  }

  set news(news: NewsPayload) {
    this._news = news;
    this._url = 'url(' + news.ownerUrl + ')';
  }
  over() {
    this.miButton.nativeElement.disabled =
      this.userService.loggedUser &&
      this.news.newsOwnerId === this.userService.loggedUser.id;
  }
  onTagClick(tag: string) {
    if (!this.newsService.list$) {
      this.newsService.list$ =
        this.reactiveService.getNewsSubject('main').value;
    }
    this.othersList$ = this.newsService.list$.filter((value1) =>
      value1.topics.includes(tag)
    );
    this.reactiveService.getNewsSubject('main').next(this.othersList$);
    this.newsService.activeLink = tag;
    this.newsService.callTag.next(tag);
  }
  onClick(url, newsOwnerId) {
    this.router.navigateByUrl(url, {
      state: {
        userID: '@' + newsOwnerId,
        loggedID: this.userService.loggedUser
          ? this.userService.loggedUser.id
          : '',
      },
    });
  }
  navigate() {
    //this.commentsComponent.micStop();
    //this.commentsComponent.setStage(this.news.newsId);
    this.router.navigate([this._news.newsId], {
      relativeTo: this.route.parent,
    });
  }
  get newsCounts(): Map<string, string> {
    return this.newsService.newsCounts;
  }
  ngOnDestroy(): void {
    //this.commentsComponent.micStop();
  }
}
