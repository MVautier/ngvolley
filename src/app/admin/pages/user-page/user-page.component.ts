import { Component, OnInit } from '@angular/core';
import { UserService } from '@app/admin/services/user.service';
import { UserRole } from '@app/core/models/user-role.model';

@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.scss']
})
export class UserPageComponent implements OnInit {
  users: UserRole[] = [];

  constructor(private userService: UserService) {

  }

  ngOnInit(): void {
    this.init();
  }

  init() {
    this.userService.getListe().then(users => {
      this.users = users;
    }).catch(err => console.log('error getting users: ', err));
  }

  addUser() {
    this.users.push(new UserRole());
  }

  saveUser(user: UserRole) {
    console.log('saving user: ', user);
  }

  removeUser(index: number) {
    const user = this.users[index];
    if (user.IdUser === 0) {
      this.users.splice(index, 1);
    } else {

    }
  }

}
