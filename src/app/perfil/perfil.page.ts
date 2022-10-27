import { Component, OnInit } from '@angular/core';
import { Inmobiliaria } from '../interfaces/inmobiliaria';
import { EstadosService } from '../services/estados.service';
import { InmobiliariaService } from '../services/inmobiliaria.service';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {

  inmobiliaria: Inmobiliaria = {
    correo: '',
    password: '',
    nombre: '',
    estados: [],
    direccion: {
      calle: '',
      codigopostal: '',
      colonia: '',
      numeroexterior: '',
      numerointerior: '',
      estado: '',
    },
    notarios: [],
    agentes: []
  };
  confirmPassword = '';

  estados = this.estadosService.getEstados();
  constructor(
    private estadosService: EstadosService,
    private sessionService: SessionService,
    private inmobiliariaService: InmobiliariaService
  ) { }

  ngOnInit() {
    this.sessionService.get('correo')?.then(correo => {
      if(correo) this.inmobiliariaService.getInmobiliaria(correo).subscribe(inmobiliaria => {
        this.inmobiliaria = inmobiliaria
        this.confirmPassword = inmobiliaria.password
      })
    })
  }

  actualizarPerfil() { 
    if (
      this.inmobiliaria.correo.trim() !== "" &&
      this.inmobiliaria.nombre.trim() !== "" &&
      this.inmobiliaria.password.trim() !== "" &&
      this.confirmPassword.trim() !== ""
    ) {
      if (this.confirmPassword === this.inmobiliaria.password)
      this.inmobiliariaService.postInmobiliaria(this.inmobiliaria).subscribe(res => console.log(res))
    }
  }

}
