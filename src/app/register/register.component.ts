import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  formData: any = {
    name: '',
    email: '',
    password: '',
    roles: []
  };
  errorMessage: string = '';
  roles: any[] = [];
  selectedRoles: Set<number> = new Set();

  constructor(
    private readonly userService: UsersService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.loadCargosAndRoles();
  }

  async loadCargosAndRoles() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.showError('Token not found');
      return;
    }

    try {
      this.roles = await this.userService.getAllRoles(token);
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
    console.log('Selected Roles:', Array.from(this.selectedRoles));
  }

  isRoleSelected(roleId: number): boolean {
    return this.selectedRoles.has(roleId);
  }

  async handleSubmit() {
    if (!this.formData.name || !this.formData.email || !this.formData.password) {
      this.showError('Por favor completa todos los campos.');
      return;
    }

    const confirmRegistration = confirm('Estas seguro que deseas registrar este usuario?');
    if (!confirmRegistration) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const selectedRoleNames = this.roles
        .filter(role => this.selectedRoles.has(role.id))
        .map(role => role.name);

      const newUserData = {
        email: this.formData.email,
        name: this.formData.name,
        password: this.formData.password,
        roles: selectedRoleNames,
        cargoId: this.formData.cargoId
      };

      console.log('New User Data:', newUserData);

      const response = await this.userService.register(newUserData, token);
      console.log('Registration Response:', response);

      if (response.statusCode === 200) {
        this.router.navigate(['/users']);
      } else {
        this.showError(response.message);
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
