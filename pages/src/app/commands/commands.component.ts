import {Component, Inject, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {APP_BASE_HREF} from '@angular/common';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-commands',
  templateUrl: './commands.component.html',
  styleUrls: ['./commands.component.scss'],
  preserveWhitespaces: true,
})
export class CommandsComponent implements OnInit {
  public commands$: Observable<any>;

  constructor(
    private http: HttpClient,
    @Inject(APP_BASE_HREF) private baseHref: string,
  ) { }

  ngOnInit(): void {
    this.commands$ = this.http.get(`${this.baseHref === '/' ? '' : this.baseHref}/assets/commands.json`);
  }
}
