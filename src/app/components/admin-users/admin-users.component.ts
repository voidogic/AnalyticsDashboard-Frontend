import { Component, OnInit } from '@angular/core';
import { DataService, UserData } from '../../services/data.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: UserData[] = [];
  filteredUsers: UserData[] = [];
  form: FormGroup;
  isModalOpen = false;
  isEditMode = false;
  searchQuery = '';
  roleFilter = '';
  statusFilter = '';

  constructor(private dataService: DataService, private fb: FormBuilder) {
    this.form = this.fb.group({
      _id: [''],
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['user', Validators.required],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.dataService.getUsers().subscribe(users => {
      this.users = users;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let filtered = [...this.users];

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.fullName.toLowerCase().includes(query) || 
        u.email.toLowerCase().includes(query)
      );
    }

    if (this.roleFilter) {
      filtered = filtered.filter(u => u.role === this.roleFilter);
    }

    if (this.statusFilter) {
      const isActive = this.statusFilter === 'active';
      filtered = filtered.filter(u => u.isActive === isActive);
    }

    this.filteredUsers = filtered;
  }

  onSearch(): void {
    this.applyFilters();
  }

  onRoleFilterChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  openModal(): void {
    this.isEditMode = false;
    this.form.reset({ role: 'user', isActive: true });
    this.isModalOpen = true;
  }

  editUser(user: UserData): void {
    this.isEditMode = true;
    this.form.patchValue(user);
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.form.reset();
  }

  saveUser(): void {
    if (this.form.invalid) {
      return;
    }

    const user = this.form.value as UserData;
    if (!user._id) {
      user._id = `user_${Date.now()}`;
      user.createdAt = new Date().toISOString().split('T')[0];
      user.lastLogin = new Date().toISOString().split('T')[0];
    }

    this.dataService.saveUser(user);
    this.closeModal();
    this.loadUsers();
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.dataService.deleteUser(userId);
      this.loadUsers();
    }
  }

  toggleUserStatus(user: UserData): void {
    user.isActive = !user.isActive;
    this.dataService.saveUser(user);
    this.loadUsers();
  }
}
