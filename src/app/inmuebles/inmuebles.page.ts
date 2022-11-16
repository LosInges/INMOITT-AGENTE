import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-inmuebles',
  templateUrl: './inmuebles.page.html',
  styleUrls: ['./inmuebles.page.scss'],
})
export class InmueblesPage implements OnInit {

  constructor(
    private router: Router,
    private alertController: AlertController,
    private sessionService: SessionService,
  ) {
    router.events.subscribe(e=>{
      if(e instanceof NavigationEnd){
        this.sessionService.keys().then(k=>{
          if(k.length <= 0){
            this.router.navigate([''])
          }
        })
      }
    })
  }

  ngOnInit() {
  }

}
