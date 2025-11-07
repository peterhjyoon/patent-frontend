import { TodoComponent } from './todo/todo.component';
import { RouteGuardService } from './service/route-guard.service';
import { LogoutComponent } from './logout/logout.component';
import { ListTodosComponent } from './list-todos/list-todos.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ErrorComponent } from './error/error.component';
import { AiImagePromptResultComponent } from './ai-image-prompt-result/ai-image-prompt-result.component';
import { EventTimelineComponent } from './event-timeline/event-timeline.component';
import { SignupComponent } from './signup/signup.component';
import { GroupComponent } from './group/group.component';

// welcome 
const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent }, 
  { path: 'welcome/:name', component: WelcomeComponent, canActivate: [RouteGuardService], data: { roles: ['USER', 'ADMIN', 'ROLE_USER', 'ROLE_ADMIN'] } },
  { path: 'todos', component: ListTodosComponent, canActivate: [RouteGuardService], data: { roles: ['USER', 'ADMIN'] } },
  { path: 'logout', component: LogoutComponent, canActivate: [RouteGuardService], data: { roles: ['USER', 'ADMIN'] } },
  { path: 'todos/:id', component: TodoComponent, canActivate: [RouteGuardService], data: { roles: ['USER', 'ADMIN'] } },
  { path: 'image', component: AiImagePromptResultComponent, canActivate: [RouteGuardService], data: { roles: ['USER', 'ADMIN'] } },
  { path: 'groups', component: GroupComponent, canActivate: [RouteGuardService] },
  { path: 'event-timeline', component: EventTimelineComponent, canActivate: [RouteGuardService], data: { roles: ['ROLE_USER', 'ROLE_ADMIN'] } },  // ✅ admin only
  { path: '**', component: ErrorComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
