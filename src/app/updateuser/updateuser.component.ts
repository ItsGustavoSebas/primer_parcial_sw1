import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../users.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-updateuser',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './updateuser.component.html',
  styleUrls: ['./updateuser.component.css']
})

export class UpdateuserComponent implements OnInit {

  userId: any;
  userData: any = {};
  errorMessage: string = '';
  cargoError: string = '';
  rolesError: string = '';
  roles: any[] = [];
  selectedRoles: Set<number> = new Set();
  cargos: any[] = [];

  constructor(
    private readonly userService: UsersService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getUserById();
  }

  async getUserById() {
    this.userId = this.route.snapshot.paramMap.get('id');
    const token = localStorage.getItem('token');
    if (!this.userId || !token) {
      this.showError('User ID or Token is Required');
      return;
    }

    try {
      let userDataResponse = await this.userService.getUsersById(this.userId, token);
      this.roles = await this.userService.getAllRoles(token);
      const { name, email, roles, cargo } = userDataResponse.ourUsers;
      this.userData = { name, email, roles, cargo };
      this.userData.roles.forEach((role: any) => this.selectedRoles.add(role.id));
    } catch (error: any) {
      this.showError(error.message);
    }
  }

  toggleRoleSelection(roleId: number, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.checked) {
      this.selectedRoles.add(roleId);
    } else {
      this.selectedRoles.delete(roleId);
    }
  }

  isRoleSelected(roleId: number): boolean {
    return this.selectedRoles.has(roleId);
  }

  async updateUser() {
    if (!this.userData.name || !this.userData.email || !this.userData.cargoId) {
      this.showError('Por favor completa todos los campos requridos.');
      return;
    }
    const confirmUpdate = confirm('¿Estás seguro de que quieres actualizar este usuario?');
    if (!confirmUpdate) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found');
      }

      const selectedRoleNames = this.roles
        .filter(role => this.selectedRoles.has(role.id))
        .map(role => role.name)
        .join(',');

      const updatedUserData = {
        email: this.userData.email,
        name: this.userData.name,
        password: this.userData.password,
        cargo: this.userData.cargo,
      };

      const res = await this.userService.updateUSer(this.userId, updatedUserData, token, selectedRoleNames);
      console.log(res);

      if (res.statusCode === 200) {
        this.router.navigate(['/users']);
      } else {
        this.showError(res.message);
      }
    } catch (error: any) {
      this.showError(error.message);
    }
  }

  showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000);
  }
}
