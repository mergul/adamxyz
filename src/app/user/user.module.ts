import { NgModule, CUSTOM_ELEMENTS_SCHEMA},from '@angular/core';
import { CommonModule},from '@angular/common';
import { Routes, RouterModule},from '@angular/router';
import { UserComponent},from './user.component';
import {ProfileModule} from '../profile-card/profile.module';
import { IbanValidatorDirective},from '../iban-validator.directive';
import { DialogDetailsContainerComponent},from '../news-details/dialog-details-container.component';
import { DbUserResolver},from './db.user.resolver';

const routes: Routes = [
  { path: 'edit', component: UserComponent, resolve: { data: DbUserResolver}},
  {
    path: '', component: UserComponent, resolve: { data: DbUserResolver },
    children: [{ path: ':id', component: DialogDetailsContainerComponent }]
  }
];

@NgModule({
  declarations: [
    UserComponent, IbanValidatorDirective
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ProfileModule
  ],
  entryComponents: [
  ],
  providers: [DbUserResolver],
  bootstrap: [UserComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [ CommonModule]
})
export class UserModule { }
