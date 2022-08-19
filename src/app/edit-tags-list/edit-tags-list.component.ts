import {Component, Input, OnInit, OnDestroy, Renderer2, ViewChild, ElementRef} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {UserService} from '../core/user.service';
import { takeUntil},from 'rxjs/operators';

@Component({
  selector: 'app-edit-tags-list',
  templateUrl: './edit-tags-list.component.html',
  styleUrls: ['./edit-tags-list.component.scss']
})
export class EditTagsListComponent implements OnInit, OnDestroy {

  private readonly onDestroy = new Subject<void>();
  private _isPub!: Observable<boolean>;
  _tags!: Observable<Array<string>>;
  private _booled!: boolean;
  @ViewChild('followButton', { static: false })
  followButton!: ElementRef;
  pubs=false;

  constructor(private service: UserService, private renderer: Renderer2) { }

  @Input()
  get tags(): Observable<Array<string>> {
    return this._tags;
  }

  set tags(value: Observable<Array<string>>) {
    this._tags = value;
  }
  @Input()
  get booled(): boolean {
    return this._booled;
  }

  set booled(value: boolean) {
    this._booled = value;
  }
  @Input()
  get isPub(): Observable<boolean> {
    return this._isPub;
  }

  set isPub(value: Observable<boolean>) {
    this._isPub = value;
  }

  ngOnInit() {
    this.isPub.pipe(takeUntil(this.onDestroy)).subscribe(val=>{
      this.pubs=val;
    });
  }
  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }
  checkUser() {
    return !this.service.dbUser;
 }
  checkTag(tag: string) {
     return !this.service.dbUser?.tags.includes(tag);
  }
  removeTag(tag: string) {
    this.service.manageFollowingTag('#' + tag, false).pipe(takeUntil(this.onDestroy)).subscribe(value => {
      if (this.service.dbUser) {  
      this.service.dbUser.tags.splice(this.service.dbUser.tags.indexOf(tag), 1);
      this.service.newsCo.get(this.service.links[1])?.splice(this.service.dbUser.tags.indexOf(tag), 1);
      this.renderer.setProperty(this.followButton.nativeElement, 'innerHTML', 'Takip Et');
      }
    });
  }
  addTag(tag: string) {
    this.service.manageFollowingTag('#' + tag, true).pipe(takeUntil(this.onDestroy)).subscribe(value => {
      this.service.dbUser?.tags.push(tag);
      this.service.newsCo.get(this.service.links[1])?.push(tag);
      this.renderer.setProperty(this.followButton.nativeElement, 'innerHTML', 'Takip Kes');
    });
  }
}
