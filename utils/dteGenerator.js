const { v4: uuidv4 } = require('uuid');

class DTEGenerator {
  constructor(emisorData) {
    this.emisor = emisorData;
  }

  generateUUID() {
    return uuidv4();
  }

  formatRUT(rut) {
    if (!rut) return '';
    rut = rut.toString().replace(/\D/g, '');
    if (rut.length < 2) return rut;
    const dv = rut.slice(-1);
    const number = rut.slice(0, -1);
    return `${number}-${dv}`;
  }

  calculateIVA(mntNeto, tasaIVA = 19) {
    return Math.round(mntNeto * (tasaIVA / 100));
  }

  validateDTE(dte) {
    const errors = [];

    if (!dte.Encabezado) errors.push('Encabezado is required');
    if (!dte.Detalle || dte.Detalle.length === 0) errors.push('At least one item is required');

    const enc = dte.Encabezado || {};
    const idDoc = enc.IdDoc || {};

    if (idDoc.Folio !== 0) errors.push('Folio must be 0 (system generates it)');
    if (!idDoc.TipoDTE) errors.push('TipoDTE is required');
    if (!idDoc.FchEmis) errors.push('FchEmis is required');

    const emisor = enc.Emisor || {};
    if (!emisor.RUTEmisor) errors.push('RUTEmisor is required');
    if (!emisor.RznSoc) errors.push('RznSoc is required');
    if (!emisor.GiroEmis) errors.push('GiroEmis is required');
    if (!emisor.Acteco || emisor.Acteco.length === 0) errors.push('Acteco is required');
    if (!emisor.DirOrigen) errors.push('DirOrigen is required');
    if (!emisor.CmnaOrigen) errors.push('CmnaOrigen is required');

    const receptor = enc.Receptor || {};
    if (!receptor.RUTRecep) errors.push('RUTRecep is required');
    if (!receptor.RznSocRecep) errors.push('RznSocRecep is required');
    if (!receptor.GiroRecep) errors.push('GiroRecep is required');
    if (!receptor.DirRecep) errors.push('DirRecep is required');
    if (!receptor.CmnaRecep) errors.push('CmnaRecep is required');

    const totales = enc.Totales || {};
    if (!totales.MntTotal) errors.push('MntTotal is required');

    if (idDoc.TipoDTE === 33 || idDoc.TipoDTE === 39) {
      if (!totales.MntNeto) errors.push('MntNeto is required for invoice with IVA');
      if (!totales.IVA) errors.push('IVA is required for invoice with IVA');
      if (totales.MntTotal !== (totales.MntNeto + totales.IVA)) {
        errors.push('MntTotal must equal MntNeto + IVA');
      }
    }

    if (idDoc.TipoDTE === 34 || idDoc.TipoDTE === 41) {
      if (!totales.MntExe) errors.push('MntExe is required for exempt invoice');
      if (totales.MntTotal !== totales.MntExe) {
        errors.push('MntTotal must equal MntExe for exempt invoice');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  createFacturaElectronica(data) {
    const uuid = this.generateUUID();
    const fechaEmision = data.fechaEmision || new Date().toISOString().split('T')[0];

    const dte = {
      DTE: {
        Encabezado: {
          IdDoc: {
            TipoDTE: 33,
            Folio: 0,
            FchEmis: fechaEmision,
            FmaPago: data.formaPago || 1,
            FchVenc: data.fechaVencimiento || null
          },
          Emisor: {
            RUTEmisor: this.formatRUT(data.rutEmisor || this.emisor.rut),
            RznSoc: data.razonSocialEmisor || this.emisor.razonSocial,
            GiroEmis: data.giroEmisor || this.emisor.giro,
            Acteco: data.acteco || this.emisor.acteco || [620200],
            DirOrigen: data.dirOrigen || this.emisor.direccion,
            CmnaOrigen: data.cmnaOrigen || this.emisor.comuna,
            CiudadOrigen: data.ciudadOrigen || this.emisor.ciudad,
            CorreoEmisor: data.correoEmisor || this.emisor.email,
            Telefono: data.telefonoEmisor ? [data.telefonoEmisor] : []
          },
          Receptor: {
            RUTRecep: this.formatRUT(data.rutReceptor),
            RznSocRecep: data.razonSocialReceptor,
            GiroRecep: data.giroReceptor,
            DirRecep: data.dirReceptor,
            CmnaRecep: data.cmnaReceptor,
            CiudadRecep: data.ciudadReceptor || '',
            CorreoRecep: data.correoReceptor || ''
          },
          Totales: {
            MntNeto: data.mntNeto,
            TasaIVA: data.tasaIVA || 19,
            IVA: data.iva || this.calculateIVA(data.mntNeto, data.tasaIVA || 19),
            MntTotal: data.mntTotal
          }
        },
        Detalle: this.formatDetalle(data.items || [])
      }
    };

    const validation = this.validateDTE(dte.DTE);
    if (!validation.valid) {
      throw new Error(`DTE Validation Error: ${validation.errors.join(', ')}`);
    }

    return { uuid, dte };
  }

  createFacturaExenta(data) {
    const uuid = this.generateUUID();
    const fechaEmision = data.fechaEmision || new Date().toISOString().split('T')[0];

    const dte = {
      DTE: {
        Encabezado: {
          IdDoc: {
            TipoDTE: 34,
            Folio: 0,
            FchEmis: fechaEmision,
            FmaPago: data.formaPago || 1,
            FchVenc: data.fechaVencimiento || null
          },
          Emisor: {
            RUTEmisor: this.formatRUT(data.rutEmisor || this.emisor.rut),
            RznSoc: data.razonSocialEmisor || this.emisor.razonSocial,
            GiroEmis: data.giroEmisor || this.emisor.giro,
            Acteco: data.acteco || this.emisor.acteco || [620200],
            DirOrigen: data.dirOrigen || this.emisor.direccion,
            CmnaOrigen: data.cmnaOrigen || this.emisor.comuna,
            CiudadOrigen: data.ciudadOrigen || this.emisor.ciudad,
            CorreoEmisor: data.correoEmisor || this.emisor.email
          },
          Receptor: {
            RUTRecep: this.formatRUT(data.rutReceptor),
            RznSocRecep: data.razonSocialReceptor,
            GiroRecep: data.giroReceptor,
            DirRecep: data.dirReceptor,
            CmnaRecep: data.cmnaReceptor,
            CiudadRecep: data.ciudadReceptor || '',
            CorreoRecep: data.correoReceptor || ''
          },
          Totales: {
            MntExe: data.mntExe,
            MntTotal: data.mntTotal
          }
        },
        Detalle: this.formatDetalleExento(data.items || [])
      }
    };

    const validation = this.validateDTE(dte.DTE);
    if (!validation.valid) {
      throw new Error(`DTE Validation Error: ${validation.errors.join(', ')}`);
    }

    return { uuid, dte };
  }

  createBoletaElectronica(data) {
    const uuid = this.generateUUID();
    const fechaEmision = data.fechaEmision || new Date().toISOString().split('T')[0];

    const dte = {
      DTE: {
        Encabezado: {
          IdDoc: {
            TipoDTE: 39,
            Folio: 0,
            FchEmis: fechaEmision,
            FmaPago: data.formaPago || 1
          },
          Emisor: {
            RUTEmisor: this.formatRUT(data.rutEmisor || this.emisor.rut),
            RznSoc: data.razonSocialEmisor || this.emisor.razonSocial,
            GiroEmis: data.giroEmisor || this.emisor.giro,
            Acteco: data.acteco || this.emisor.acteco || [620200],
            DirOrigen: data.dirOrigen || this.emisor.direccion,
            CmnaOrigen: data.cmnaOrigen || this.emisor.comuna,
            CorreoEmisor: data.correoEmisor || this.emisor.email
          },
          Receptor: {
            RUTRecep: this.formatRUT(data.rutReceptor),
            RznSocRecep: data.razonSocialReceptor,
            GiroRecep: data.giroReceptor,
            DirRecep: data.dirReceptor,
            CmnaRecep: data.cmnaReceptor
          },
          Totales: {
            MntNeto: data.mntNeto,
            TasaIVA: data.tasaIVA || 19,
            IVA: data.iva || this.calculateIVA(data.mntNeto, data.tasaIVA || 19),
            MntTotal: data.mntTotal
          }
        },
        Detalle: this.formatDetalle(data.items || [])
      }
    };

    const validation = this.validateDTE(dte.DTE);
    if (!validation.valid) {
      throw new Error(`DTE Validation Error: ${validation.errors.join(', ')}`);
    }

    return { uuid, dte };
  }

  createBoletaExenta(data) {
    const uuid = this.generateUUID();
    const fechaEmision = data.fechaEmision || new Date().toISOString().split('T')[0];

    const dte = {
      DTE: {
        Encabezado: {
          IdDoc: {
            TipoDTE: 41,
            Folio: 0,
            FchEmis: fechaEmision,
            FmaPago: data.formaPago || 1
          },
          Emisor: {
            RUTEmisor: this.formatRUT(data.rutEmisor || this.emisor.rut),
            RznSoc: data.razonSocialEmisor || this.emisor.razonSocial,
            GiroEmis: data.giroEmisor || this.emisor.giro,
            Acteco: data.acteco || this.emisor.acteco || [620200],
            DirOrigen: data.dirOrigen || this.emisor.direccion,
            CmnaOrigen: data.cmnaOrigen || this.emisor.comuna,
            CorreoEmisor: data.correoEmisor || this.emisor.email
          },
          Receptor: {
            RUTRecep: this.formatRUT(data.rutReceptor),
            RznSocRecep: data.razonSocialReceptor,
            GiroRecep: data.giroReceptor,
            DirRecep: data.dirReceptor,
            CmnaRecep: data.cmnaReceptor
          },
          Totales: {
            MntExe: data.mntExe,
            MntTotal: data.mntTotal
          }
        },
        Detalle: this.formatDetalleExento(data.items || [])
      }
    };

    const validation = this.validateDTE(dte.DTE);
    if (!validation.valid) {
      throw new Error(`DTE Validation Error: ${validation.errors.join(', ')}`);
    }

    return { uuid, dte };
  }

  createGuiaDespacho(data) {
    const uuid = this.generateUUID();
    const fechaEmision = data.fechaEmision || new Date().toISOString().split('T')[0];

    const dte = {
      DTE: {
        Encabezado: {
          IdDoc: {
            TipoDTE: 52,
            Folio: 0,
            FchEmis: fechaEmision,
            IndTraslado: data.indTraslado || 1
          },
          Emisor: {
            RUTEmisor: this.formatRUT(data.rutEmisor || this.emisor.rut),
            RznSoc: data.razonSocialEmisor || this.emisor.razonSocial,
            GiroEmis: data.giroEmisor || this.emisor.giro,
            Acteco: data.acteco || this.emisor.acteco || [620200],
            DirOrigen: data.dirOrigen || this.emisor.direccion,
            CmnaOrigen: data.cmnaOrigen || this.emisor.comuna,
            CorreoEmisor: data.correoEmisor || this.emisor.email
          },
          Receptor: {
            RUTRecep: this.formatRUT(data.rutReceptor),
            RznSocRecep: data.razonSocialReceptor,
            GiroRecep: data.giroReceptor,
            DirRecep: data.dirReceptor,
            CmnaRecep: data.cmnaReceptor
          },
          Transporte: {
            Patente: data.patente || '',
            RUTTrans: data.rutTransportista ? this.formatRUT(data.rutTransportista) : '',
            RUTChofer: data.rutChofer ? this.formatRUT(data.rutChofer) : '',
            NombreChofer: data.nombreChofer || '',
            DirDest: data.dirDestino || data.dirReceptor,
            CmnaDest: data.cmnaDestino || data.cmnaReceptor,
            CiudadDest: data.ciudadDestino || data.ciudadReceptor || ''
          },
          Totales: {
            MntNeto: data.mntNeto || 0,
            TasaIVA: data.tasaIVA || 19,
            IVA: data.iva || this.calculateIVA(data.mntNeto || 0, data.tasaIVA || 19),
            MntTotal: data.mntTotal || 0
          }
        },
        Detalle: this.formatDetalle(data.items || [])
      }
    };

    const validation = this.validateDTE(dte.DTE);
    if (!validation.valid) {
      throw new Error(`DTE Validation Error: ${validation.errors.join(', ')}`);
    }

    return { uuid, dte };
  }

  createNotaCredito(data) {
    const uuid = this.generateUUID();
    const fechaEmision = data.fechaEmision || new Date().toISOString().split('T')[0];

    const dte = {
      DTE: {
        Encabezado: {
          IdDoc: {
            TipoDTE: 61,
            Folio: 0,
            FchEmis: fechaEmision
          },
          Emisor: {
            RUTEmisor: this.formatRUT(data.rutEmisor || this.emisor.rut),
            RznSoc: data.razonSocialEmisor || this.emisor.razonSocial,
            GiroEmis: data.giroEmisor || this.emisor.giro,
            Acteco: data.acteco || this.emisor.acteco || [620200],
            DirOrigen: data.dirOrigen || this.emisor.direccion,
            CmnaOrigen: data.cmnaOrigen || this.emisor.comuna,
            CorreoEmisor: data.correoEmisor || this.emisor.email
          },
          Receptor: {
            RUTRecep: this.formatRUT(data.rutReceptor),
            RznSocRecep: data.razonSocialReceptor,
            GiroRecep: data.giroReceptor,
            DirRecep: data.dirReceptor,
            CmnaRecep: data.cmnaReceptor
          },
          Totales: {
            MntNeto: data.mntNeto,
            TasaIVA: data.tasaIVA || 19,
            IVA: data.iva || this.calculateIVA(data.mntNeto, data.tasaIVA || 19),
            MntTotal: data.mntTotal
          }
        },
        Detalle: this.formatDetalle(data.items || []),
        Referencia: [
          {
            NroLinRef: 1,
            TpoDocRef: data.tpoDocRef || '33',
            FolioRef: data.folioRef,
            FchRef: data.fchRef,
            CodRef: data.codRef || 1,
            RazonRef: data.razonRef || 'Devolución de productos'
          }
        ]
      }
    };

    const validation = this.validateDTE(dte.DTE);
    if (!validation.valid) {
      throw new Error(`DTE Validation Error: ${validation.errors.join(', ')}`);
    }

    return { uuid, dte };
  }

  createNotaDebito(data) {
    const uuid = this.generateUUID();
    const fechaEmision = data.fechaEmision || new Date().toISOString().split('T')[0];

    const dte = {
      DTE: {
        Encabezado: {
          IdDoc: {
            TipoDTE: 56,
            Folio: 0,
            FchEmis: fechaEmision
          },
          Emisor: {
            RUTEmisor: this.formatRUT(data.rutEmisor || this.emisor.rut),
            RznSoc: data.razonSocialEmisor || this.emisor.razonSocial,
            GiroEmis: data.giroEmisor || this.emisor.giro,
            Acteco: data.acteco || this.emisor.acteco || [620200],
            DirOrigen: data.dirOrigen || this.emisor.direccion,
            CmnaOrigen: data.cmnaOrigen || this.emisor.comuna,
            CorreoEmisor: data.correoEmisor || this.emisor.email
          },
          Receptor: {
            RUTRecep: this.formatRUT(data.rutReceptor),
            RznSocRecep: data.razonSocialReceptor,
            GiroRecep: data.giroReceptor,
            DirRecep: data.dirReceptor,
            CmnaRecep: data.cmnaReceptor
          },
          Totales: {
            MntNeto: data.mntNeto,
            TasaIVA: data.tasaIVA || 19,
            IVA: data.iva || this.calculateIVA(data.mntNeto, data.tasaIVA || 19),
            MntTotal: data.mntTotal
          }
        },
        Detalle: this.formatDetalle(data.items || []),
        Referencia: [
          {
            NroLinRef: 1,
            TpoDocRef: data.tpoDocRef || '33',
            FolioRef: data.folioRef,
            FchRef: data.fchRef,
            CodRef: data.codRef || 1,
            RazonRef: data.razonRef || 'Ajuste por diferencia de precio'
          }
        ]
      }
    };

    const validation = this.validateDTE(dte.DTE);
    if (!validation.valid) {
      throw new Error(`DTE Validation Error: ${validation.errors.join(', ')}`);
    }

    return { uuid, dte };
  }

  formatDetalle(items) {
    return items.map((item, index) => ({
      NroLinDet: index + 1,
      NmbItem: item.nmbItem || item.description || '',
      DscItem: item.dscItem || item.detalle || '',
      QtyItem: item.qtyItem || item.quantity || 1,
      UnmdItem: item.unmdItem || item.unidad || 'UN',
      PrcItem: item.prcItem || item.precio || 0,
      DescuentoMonto: item.descuentoMonto || 0,
      DescuentoPct: item.descuentoPct || 0,
      MontoItem: item.montoItem || item.monto || (item.qtyItem || 1) * (item.prcItem || item.precio || 0),
      CdgItem: item.cdgItem || []
    }));
  }

  formatDetalleExento(items) {
    return items.map((item, index) => ({
      NroLinDet: index + 1,
      NmbItem: item.nmbItem || item.description || '',
      DscItem: item.dscItem || item.detalle || '',
      QtyItem: item.qtyItem || item.quantity || 1,
      UnmdItem: item.unmdItem || item.unidad || 'UN',
      PrcItem: item.prcItem || item.precio || 0,
      DescuentoMonto: item.descuentoMonto || 0,
      DescuentoPct: item.descuentoPct || 0,
      MontoItem: item.montoItem || item.monto || (item.qtyItem || 1) * (item.prcItem || item.precio || 0),
      IndExe: 1,
      CdgItem: item.cdgItem || []
    }));
  }
}

module.exports = DTEGenerator;
