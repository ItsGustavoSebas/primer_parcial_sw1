import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UsersService } from '../users.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-userslist',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './userlist.component.html',
  styleUrl: './userlist.component.css'
})


export class UserlistComponent implements OnInit {

  users: any[] = [];
  errorMessage: string = ''
  constructor(
    public readonly userService: UsersService,
    private readonly router: Router,
  ) {}
  isAdmin:boolean = false;
  isUser:boolean = false;
  filterRole: string = 'all';
  searchName: string = '';
  activeButton: string = 'all';

  setActiveButton(role: string) {
    this.activeButton = role;
  }
  
  ngOnInit(): void {
    this.loadUsers();
  }

  async loadUsers() {
    try {
      const token: any = localStorage.getItem('token');
      let response;
      if (this.filterRole === 'all' && !this.searchName) {
        response = await this.userService.getAllUsers(token);
      } else if (this.filterRole !== 'all' && !this.searchName) {
        response = await this.userService.getUsersByRole(this.filterRole, token);
      } else if (this.filterRole === 'all' && this.searchName) {
        response = await this.userService.searchUsersByName(this.searchName, token);
      } else {
        response = await this.userService.getUsersByRoleAndName(this.filterRole, this.searchName, token);
      }
      
      if (response && response.statusCode === 200 && response.ourUsersList) {
        this.users = response.ourUsersList;
      } else {
        this.showError('No se encontraron usuarios');
      }
    } catch (error: any) {
      this.showError(error.message);
    }
  }

  

  async deleteUser(userId: string) {
    const confirmDelete = confirm('¿Estás seguro que deseas eliminar este usuario?');
    if (confirmDelete) {
      try {
        const token: any = localStorage.getItem('token');
        await this.userService.deleteUser(userId, token);
        this.loadUsers();
      } catch (error: any) {
        this.showError(error.message);
      }
    }
  }

  navigateToUpdate(userId: string) {
    this.router.navigate(['/update', userId]);
  }

  showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = ''; 
    }, 3000);
  }
  getRoleNames(user: any): string {
    return user.roles.map((role: any) => {
      switch (role.name) {
        case 'ADMIN':
          return 'Administrador';
        case 'USER':
          return 'Usuario';
        default:
          return role.name;
      }
    }).join(', ');
  }
  
}
