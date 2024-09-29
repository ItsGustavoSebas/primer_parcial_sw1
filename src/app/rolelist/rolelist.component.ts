import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-roleslist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './rolelist.component.html',
  styleUrl: './rolelist.component.css'
})
export class RoleslistComponent {
  roles: any[] = [];
  errorMessage: string = ''
  constructor(
    public readonly userService: UsersService,
    private readonly router: Router,
  ) {}
  isAdmin:boolean = false;
  isUser:boolean = false;
  
  ngOnInit(): void {
    this.loadRoles();
  }

  async loadRoles() {
    try {
      const token: any = localStorage.getItem('token');
      const response = await this.userService.getAllRoles(token);
      if (response) {
        this.roles = response;
      } else {
        this.showError('No roles found.');
      }
    } catch (error: any) {
      this.showError(error.message);
    }
  }


  navigateToUpdate(roleId: string) {
    this.router.navigate(['/role/update', roleId]);
  }

  showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = ''; 
    }, 3000);
  }

  getPermissionsNames(role: any): string {
    return role.permissions.map((permission: any) => permission.name).join(', ');
  }
}
