import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
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
    private alertCtrl: AlertController,
    private modalController: ModalController
  ) {}

  async mostrarAlerta(titulo: string, subtitulo: string, mensaje: string) {
    const alert = await this.alertCtrl.create({
      header: titulo,
      subHeader: subtitulo,
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
    const result = await alert.onDidDismiss();
    console.log(result);
  }

  ngOnInit() {}

  onSubmit() {
    alert(this.email + ', ' + this.password);
  }

  login() {
    if (this.email.trim().length <= 0 || this.password.trim().length <= 0) {
      this.mostrarAlerta(
        'Error',
        'Campos vacios',
        'No deje espacios en blanco.'
      );
    } else {
      this.loginService.login(this.email, this.password).subscribe(
        (res) => {
          if (res.session.tipo !== 'agente') {
            console.log('NO es agente');
            this.mostrarAlerta(
              'Error:',
              'RFC inválido',
              'Recuerde bien su RFC y contraseña'
            );
            return;
          }
          const promesas: Promise<any>[] = [
            this.sessionService.clear(),
            this.sessionService.set('rfc', res.session.email),
            this.sessionService.set('tipo', res.session.tipo),
            this.sessionService.set('inmobiliaria', res.session.empresa),
          ];

          Promise.all(promesas).then((res) => {
            this.cerrar();
            this.router.navigate(['/', 'perfil']);
          });
        },
        (err) => console.log(err)
      );
    }
  }

  cerrar() {
    this.modalController.dismiss();
  }
}
