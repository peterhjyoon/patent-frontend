import { Component, OnInit } from '@angular/core';
import { BasicAuthenticationService } from '../service/basic-authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css'],
  standalone: true
})
export class LogoutComponent implements OnInit {

  constructor(
    private authService: BasicAuthenticationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.logout();   // removes JWT from localStorage
    this.router.navigate(['/login']); // redirect to login
  }

}