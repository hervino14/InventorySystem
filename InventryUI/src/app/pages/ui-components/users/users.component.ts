
import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { UserDto } from 'src/app/_interface/user';
import { AddUserComponent } from './add-user/add-user.component';
import { MatDialog } from '@angular/material/dialog';
import { UpdateUserComponent } from './update-user/update-user.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DialogService } from 'src/app/shared/services/dialog.service';
import { RepositoryService } from 'src/app/shared/services/repository.service';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/shared/services/data.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { SuccessModalComponent } from 'src/app/shared/modals/success-modal/success-modal.component';
import { RepositoryErrorHandlerService } from 'src/app/shared/services/repository-error-handler.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit, AfterViewInit{
  public errorMessage: string = '';
  public bsModalRef?: BsModalRef;
  public displayedColumns = ['userName', 'firstName', 'lastName', 'email', 'update', 'delete'];
  public dataSource = new MatTableDataSource<UserDto>();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private repoService: RepositoryService,
    private errorService: RepositoryErrorHandlerService,
    private router: Router,
    private dialogserve: DialogService,
    private modal: BsModalService
  ) { }

  ngOnInit(): void {
    this.getAllUsers();
  }

  public getAllUsers = () => {
    this.repoService.getData('api/accounts/users')
      .subscribe({
        next: (data: UserDto[] |any) => {
          this.dataSource.data = data;
        },
        error: (error: HttpErrorResponse) => {
          this.errorService.handleError(error);
          this.errorMessage = this.errorService.errorMessage;
        }
      });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  public doFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  }

  public redirectToUpdate = (id: string) => {
    this.router.navigate([`/ui-components/update-user-role/${id}`]);
  }

  public deleteUser = (id: string) => {
    this.dialogserve.openConfirmDialog('Are you sure you want to delete this user?')
      .afterClosed()
      .subscribe(res => {
        if (res) {
          const deleteUri: string = `api/accounts/${id}`;
          this.repoService.delete(deleteUri)
            .subscribe({
              next: () => {
                const config: ModalOptions = {
                  initialState: {
                    modalHeaderText: 'Success Message',
                    modalBodyText: 'User deleted successfully',
                    okButtonText: 'OK'
                  }
                };

                this.bsModalRef = this.modal.show(SuccessModalComponent, config);
                this.bsModalRef.content.redirectOnOk.subscribe(() => this.getAllUsers());
              },
              error: (error: HttpErrorResponse) => {
                this.errorService.handleError(error);
                this.errorMessage = this.errorService.errorMessage;
              }
            });
        }
      });
  }
}
