import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppGroupService, Group } from '../group.service';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class GroupComponent implements OnInit {
  groups: Group[] = [];
  groupName: string = '';
  userIdToAdd: number | null = null;

  constructor(private groupService: AppGroupService) {}

  ngOnInit() {
    this.loadGroups();
  }

  loadGroups() {
    this.groupService.getMyGroups().subscribe({
      next: (groups) => this.groups = groups,
      error: (err) => console.error('Failed to load groups', err)
    });
  }

  createGroup() {
    if (!this.groupName.trim()) return;
    this.groupService.createGroup(this.groupName).subscribe({
      next: () => {
        this.groupName = '';
        this.loadGroups();
      },
      error: (err) => console.error('Failed to create group', err)
    });
  }

  addMember(groupId: number) {
    if (!this.userIdToAdd) return;
    this.groupService.addMember(groupId, this.userIdToAdd).subscribe({
      next: () => {
        this.userIdToAdd = null;
        this.loadGroups();
      },
      error: (err) => console.error('Failed to add member', err)
    });
  }

  getMemberNames(group: Group): string {
    return group.members.map(m => m.username).join(', ');
  }
}