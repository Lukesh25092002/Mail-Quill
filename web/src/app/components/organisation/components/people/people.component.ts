import { Component, OnInit, inject } from '@angular/core';
import { OrganisationService } from '../../../../services/organisation.service';
import { CommonModule, JsonPipe } from '@angular/common';
import { UserProfile } from '../../../../modals/user.modal';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-people',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './people.component.html',
  styleUrl: './people.component.css'
})
export class PeopleComponent implements OnInit{
  private organisationService = inject(OrganisationService);
  public userService = inject(UserService);
  public people: UserProfile[] = [];

  ngOnInit(): void {
    this.organisationService.getOrganisationPeople().subscribe({
      next: (data: any) => {
        this.people = data.people;
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }
}
