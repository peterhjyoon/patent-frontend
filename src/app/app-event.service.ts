import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { AppEvent } from './app-event';
import { AppComment } from './app-comment';
import { LifeStoryResponse } from './life-story-response';

@Injectable({
  providedIn: 'root'
})
export class AppEventService {
  private apiUrl = 'http://localhost:8081/api/events';

  constructor(private http: HttpClient) {}

  getEvents(): Observable<AppEvent[]> {
    return this.http.get<AppEvent[]>(this.apiUrl, {
      headers: getAuthHeaders()
    });
  }

  mergeVideos(eventIds: number[]): Observable<Blob> {
    const url = `${this.apiUrl}/merge-videos`;
    return this.http.post(url, eventIds, {
      responseType: 'blob' // 🔁 Receive video file as Blob
    });
  }

  createEvent(event: AppEvent, groupId?: number): Observable<AppEvent> {
    const formData = new FormData();
    formData.append('title', event.title);
    formData.append('name', event.name!);
    if (event.description) {
      formData.append('description', event.description);
    }
    if (event.startDate) {
      formData.append('startDate', event.startDate);
    }
    if (event.endDate) {
      formData.append('endDate', event.endDate);
    }
    if (event.image) {
      formData.append('image', event.image);
    }
    if (event.video) {
      formData.append('video', event.video);
    }
    if (groupId) {
      formData.append('groupId', groupId.toString());
    }

    return this.http.post<AppEvent>(this.apiUrl, formData, {
      headers: getAuthHeaders()
    });
  }

  updateEvent(id: number, event: AppEvent): Observable<AppEvent> {
    const formData = new FormData();
    formData.append('title', event.title);
    formData.append('name', event.name!);
    if (event.description) formData.append('description', event.description);
    if (event.startDate) formData.append('startDate', event.startDate);
    if (event.endDate) formData.append('endDate', event.endDate);
    if (event.image) formData.append('image', event.image);
    if (event.video) {
      formData.append('video', event.video);
    }

    return this.http.put<AppEvent>(`${this.apiUrl}/${id}`, formData, {
      headers: getAuthHeaders()
    });
  }

  deleteEvent(id: number): Observable<void> {
    console.log(`delete event ---------------------------- ${id}`)
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  generateLifeStory(events: AppEvent[], style: string): Observable<{ story: string, events: AppEvent[] }> {
    return this.http.post<{ story: string, events: AppEvent[] }>(
      'http://localhost:8081/api/events/generate-story',
      { events, style }
    );
  }

  fetchLatestLifeStory() {
    return this.http.get<LifeStoryResponse>(`http://localhost:8081/api/events/latest-story`);
  }

  commentOnEvent(eventId: number, comment: string): Observable<AppComment> {
    return this.http.post<AppComment>(`http://localhost:8081/api/comments/event/${eventId}`, { content: comment }, {
      headers: getAuthHeaders()
    });
  }

  getCommentsForEvent(eventId: number): Observable<AppComment[]> {
    return this.http.get<AppComment[]>(`http://localhost:8081/api/comments/event/${eventId}`);
  }

  commentOnLifeStory(comment: string): Observable<AppComment> {
    return this.http.post<AppComment>(`http://localhost:8081/api/comments/life-story`, { content: comment });
  }

  updateComment(commentId: number, newContent: string): Observable<AppComment> {
  return this.http.put<AppComment>(`http://localhost:8081/api/comments/${commentId}`, {
      content: newContent
    });
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`http://localhost:8081/api/comments/${commentId}`);
  }

  acceptComment(eventId: number, commentId: number): Observable<AppEvent> {
    const url = `${this.apiUrl}/${eventId}/accept-comment/${commentId}`;
    return this.http.post<AppEvent>(url, {});
  }

  getLifeStoryComments(): Observable<AppComment[]> {
    return this.http.get<AppComment[]>(`http://localhost:8081/api/comments/life-story`);
  }

  generateResume(eventIds: number[]): Observable<string> {
    return this.http.post(`${this.apiUrl}/resume`, eventIds, {
      responseType: 'text'
    });
  }
  
}


function getAuthHeaders(): HttpHeaders {
  const token = localStorage.getItem('authToken');
  return new HttpHeaders({
    Authorization: `Bearer ${token}`
  });
}

