import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './app.constants';

@Injectable({
  providedIn: 'root'
})
export class AiServiceService {

  constructor(
    private http: HttpClient
  ) { }

  generateAiImage(prompt: string): Observable<Blob> {
    const params  = new HttpParams()
      .set('prompt', prompt);
    
    return this.http.get(`${API_URL}/generate-image`, {
      params,
      responseType: 'blob'
    });
  }

  generateAiText(prompt: string): Observable<string> {
    const params = new HttpParams()
      .set('prompt', prompt);

    return this.http.get(`${API_URL}/ask-ai`, {
      params,
      responseType: 'text'
    });
  }

  editImage(file: File, prompt: string, mask?: File): Observable<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('prompt', prompt);
    if (mask) {
      formData.append('mask', mask);
    }

    return this.http.post(`${API_URL}/api/images/img2img`, formData, {
      responseType: 'blob'  // because backend returns raw image bytes
    });
  }

  generateVideo(prompt: string): Observable<Blob> {
    const formData = new FormData();
    formData.append('prompt', prompt);

    return this.http.post(`${API_URL}/api/images/img2video`, formData, {
      responseType: 'blob'
    });
  }
}
