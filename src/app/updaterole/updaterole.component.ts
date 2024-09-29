import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../users.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-updatedrole',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './updaterole.component.html',
  styleUrl: './updaterole.component.css',
})
export class UpdateroleComponent {
  roleId: any;
  roleData: any = {};
  errorMessage: string = '';
  permissions: any[] = [];
  selectedPermissions: Set<number> = new Set();

  constructor(
    private readonly userService: UsersService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getRoleById();
  }

  async getRoleById() {
    this.roleId = this.route.snapshot.paramMap.get('id');
    const token = localStorage.getItem('token');
    if (!this.roleId || !token) {
      this.showError('User ID or Token is Required');
      return;
    }

    try {
      let userDataResponse = await this.userService.getRolesById(
        this.roleId,
        token
      );
      this.permissions = await this.userService.getAllPermissions(token);
      const { name, permissions } = userDataResponse;
      this.roleData = { name, permissions };
      this.roleData.permissions.forEach((permission: any) =>
        this.selectedPermissions.add(permission.id)
      );
    } catch (error: any) {
      this.showError(error.message);
    }
  }

  togglePermissionSelection(permissionId: number, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.checked) {
      this.selectedPermissions.add(permissionId);
    } else {
      this.selectedPermissions.delete(permissionId);
    }
  }

  isPermissionSelected(roleId: number): boolean {
    return this.selectedPermissions.has(roleId);
  }

  async updateRole() {
    const confirmUpdate = confirm(
      '¿Estás seguro de que quieres actualizar este rol?'
    );
    if (!confirmUpdate) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found');
      }
      if (this.selectedPermissions.size === 0) {
        throw new Error('Debe seleccionar al menos un permiso');
      }
      const selectedPermissionIds = Array.from(this.selectedPermissions);

      const res = await this.userService.updateRole(
        this.roleId,
        selectedPermissionIds,
        token
      );
      console.log(res);

      if (res.statusCode === 200) {
        this.router.navigate(['/roles']);
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
