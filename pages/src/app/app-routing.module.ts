import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {GettingStartedComponent} from './getting-started/getting-started.component';
import {CommandsComponent} from './commands/commands.component';
import {PromoComponent} from './promo/promo.component';

const routes: Routes = [
  { path: '', component: PromoComponent, },
  { path: 'getting-started', component: GettingStartedComponent, },
  { path: 'commands', component: CommandsComponent, },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
