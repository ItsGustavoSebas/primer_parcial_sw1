import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class UsersService {
  private BASE_URL = "http://localhost:8080";
  private projectNameSource = new BehaviorSubject<string>(this.getStoredProjectName());
  private projectIdSource = new BehaviorSubject<string>(this.getStoredProjectId());
  private usersSource = new BehaviorSubject<any[]>(this.getStoredUsers());
  constructor(private http: HttpClient) {}
  private authStatus = new BehaviorSubject<boolean>(this.isAuthenticated());
  authStatus$: Observable<boolean> = this.authStatus.asObservable();
  projectName$ = this.projectNameSource.asObservable();
  projectId$ = this.projectIdSource.asObservable();
  users$ = this.usersSource.asObservable();
  setProjectData(projectName: string, users: any[], projectId: string): void {
    this.projectNameSource.next(projectName);
    this.usersSource.next(users);
    this.projectIdSource.next(projectId);
    this.usersSource.next(users);
    localStorage.setItem('projectName', projectName);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('projectId', projectId);
  }

  clearProjectData(): void {
    this.projectNameSource.next('');
    this.projectIdSource.next('');
    this.usersSource.next([]);

    localStorage.removeItem('projectName');
    localStorage.removeItem('users');
    localStorage.removeItem('projectId');
  }

  private getStoredProjectName(): string {
    return localStorage.getItem('projectName') || '';
  }
  private getStoredProjectId(): string {
    return localStorage.getItem('projectId') || '';
  }

  private getStoredUsers(): any[] {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  }
  
  async login(email: string, password: string): Promise<any> {
    const url = `${this.BASE_URL}/auth/login`;
    try {
      const response = await this.http
        .post<any>(url, { email, password })
        .toPromise();
      if (response.statusCode == 200) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("roles", JSON.stringify(response.roles));
        localStorage.setItem(
          "permissions",
          JSON.stringify(response.permissions)
        );
        this.authStatus.next(true);
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  async register(userData: any, token: string): Promise<any> {
    const url = `${this.BASE_URL}/auth/register`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    try {
      const response = this.http
        .post<any>(url, userData, { headers })
        .toPromise();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async registrar(userData: any): Promise<any> {
    const url = `${this.BASE_URL}/auth/register`;
    try {
      const response = this.http
        .post<any>(url, userData)
        .toPromise();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getUsersByRole(role: string, token: string): Promise<any> {
    const url = `${this.BASE_URL}/admin/get-users-roles/${role}`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    try {
      const response = this.http.get<any>(url, { headers }).toPromise();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async searchUsersByName(name: string, token: string): Promise<any> {
    const url = `${this.BASE_URL}/admin/get-users-names?name=${name}`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    try {
      const response = this.http.get<any>(url, { headers }).toPromise();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getUsersByRoleAndName(
    role: string,
    name: string,
    token: string
  ): Promise<any> {
    const url = `${this.BASE_URL}/admin/get-users-roles-names?role=${role}&name=${name}`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    try {
      const response = this.http.get<any>(url, { headers }).toPromise();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getAllUsers(token: string): Promise<any> {
    const url = `${this.BASE_URL}/admin/get-all-users`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    try {
      const response = this.http.get<any>(url, { headers }).toPromise();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getYourProfile(token: string): Promise<any> {
    const url = `${this.BASE_URL}/adminuser/get-profile`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    try {
      const response = this.http.get<any>(url, { headers }).toPromise();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getUsersById(userId: string, token: string): Promise<any> {
    const url = `${this.BASE_URL}/admin/get-users/${userId}`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    try {
      const response = this.http.get<any>(url, { headers }).toPromise();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(userId: string, token: string): Promise<any> {
    const url = `${this.BASE_URL}/admin/delete/${userId}`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    try {
      const response = this.http.delete<any>(url, { headers }).toPromise();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateUSer(
    userId: string,
    userData: any,
    token: string,
    roles: string
  ): Promise<any> {
    const url = `${this.BASE_URL}/admin/update/${userId}`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    let params = new HttpParams().set("updatedRoles", roles);
    try {
      const response = this.http
        .put<any>(url, userData, { headers, params })
        .toPromise();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getAllRoles(token: string): Promise<any> {
    const url = `${this.BASE_URL}/admin/roles`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    try {
      const response = await this.http.get<any>(url, { headers }).toPromise();
      return response;
    } catch (error) {
      throw new Error(`Error al obtener los roles: ${error}`);
    }
  }

  async getAllPermissions(token: string): Promise<any> {
    const url = `${this.BASE_URL}/admin/permissions`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    try {
      const response = await this.http.get<any>(url, { headers }).toPromise();
      return response;
    } catch (error) {
      throw new Error(`Error al obtener los permisos: ${error}`);
    }
  }

  async getRolesById(roleId: string, token: string): Promise<any> {
    const url = `${this.BASE_URL}/admin/roles/${roleId}`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    try {
      const response = this.http.get<any>(url, { headers }).toPromise();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateRole(
    roleId: number,
    permissionsIds: number[],
    token: string
  ): Promise<any> {
    const url = `${this.BASE_URL}/admin/roles/${roleId}/permissions`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    try {
      const response = await this.http
        .put<any>(url, permissionsIds, { headers })
        .toPromise();
      console.log(response);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /***AUTHENTICATION METHODS */
  logOut(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
    localStorage.removeItem("permissions");
    this.authStatus.next(false);
  }

  isAuthenticated(): boolean {
    if (typeof localStorage !== "undefined") {
      const token = localStorage.getItem("token");
      return !!token;
    }
    return false;
  }

  private getRoles(): string[] {
    if (typeof localStorage !== "undefined") {
      const roles = localStorage.getItem("roles");
      if (roles) {
        return JSON.parse(roles);
      }
    }
    return [];
  }

  getUserPermissions(): string[] {
    if (typeof localStorage !== "undefined") {
      const permissions = localStorage.getItem("permissions");
      if (permissions) {
        return JSON.parse(permissions);
      }
    }
    return [];
  }

  isAdmin(): boolean {
    const roles = this.getRoles();
    console.log(roles);
    return roles.includes("ADMIN");
  }

  isUser(): boolean {
    if (typeof localStorage !== "undefined") {
      const roles = this.getRoles();
      console.log(roles);
      return roles.includes("USER");
    }
    return false;
  }

  HasPermission(permission: string): boolean {
    if (typeof localStorage !== "undefined") {
      const roles = this.getRoles();
      console.log(roles);
      return roles.includes(permission);
    }
    return false;
  }
}
