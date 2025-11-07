import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Group {
  id: number;
  name: string;
  members: { id: number; username: string }[];
}

@Injectable({ providedIn: 'root' })
export class AppGroupService {
  private apiUrl = 'http://localhost:8081/api/groups';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken'); // MUST match login/signup storage
    if (!token) throw new Error('No JWT token found, user might not be logged in');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  // Get all groups the logged-in user is a member of
  getMyGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.apiUrl}`, { headers: this.getAuthHeaders() });
  }

  // Create a new group
  createGroup(name: string): Observable<Group> {
    return this.http.post<Group>(
      `${this.apiUrl}`,
      { name, members: [] }, // backend will add owner automatically
      { headers: this.getAuthHeaders() }
    );
  }

  // Add a member to a group by userId
  addMember(groupId: number, userId: number): Observable<Group> {
    return this.http.post<Group>(
      `${this.apiUrl}/${groupId}/add/${userId}`,
      null,
      { headers: this.getAuthHeaders() }
    );
  }
}