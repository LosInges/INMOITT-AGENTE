import { Component, OnInit } from '@angular/core';

import { Inmobiliaria } from 'src/app/interfaces/inmobiliaria';
import { LoginService } from 'src/app/services/login.service';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';

  constructor(
    private loginService: LoginService,
    private sessionService: SessionService,
    private router: Router,
    private modalController: ModalController
  ) { }

  ngOnInit() { }

  onSubmit() {
    alert(this.email + ', ' + this.password);
  }

  login() {
    this.loginService.login(this.email, this.password).subscribe(
      (res) => {
        if (res.session.tipo !== 'agente') {
          return
        }
        const promesas: Promise<any>[] = [
          this.sessionService.clear(),
          this.sessionService.set('rfc', res.session.email),
          this.sessionService.set('tipo', res.session.tipo),
          this.sessionService.set('inmobiliaria', res.session.empresa)
        ];

        Promise.all(promesas).then((res) => {
          console.log("Bienvenido Guapo")
          console.log(res);
          if(res[1] && res[2]) this.modalController.dismiss()
        });
      },
      (err) => console.log(err)
    );

  }

  cerrar() {
    this.modalController.dismiss();
  }
}
