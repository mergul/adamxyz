import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {News, NewsFeed} from './news.model';

@Injectable({
  providedIn: 'root',
})
export class BackendServiceService {
  constructor(private httpClient: HttpClient) {}
  postImage(formData: FormData): Observable<News> {
    return this.httpClient.post<News>('/api/image/save', formData, {
      responseType: 'json',
      withCredentials: true,
      reportProgress: true,
    });
  }
  postNews(newsFeed: NewsFeed): Observable<boolean> {
    return this.httpClient.post<boolean>('/api/rest/news/save', newsFeed, {
      responseType: 'json',
    });
  }
  getSignedUrl(name: string): Observable<string> {
    return this.httpClient.get<string>('/api/rest/storage/' + name, {
      responseType: 'json',
    });
  }
}
