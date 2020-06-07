import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {GettingStartedComponent} from './getting-started/getting-started.component';
import {CommandsComponent} from './commands/commands.component';

const routes: Routes = [
  { path: '', component: GettingStartedComponent, },
  { path: 'commands', component: CommandsComponent, },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
