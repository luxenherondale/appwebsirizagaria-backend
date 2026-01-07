const DTE = require('../models/dte');
const Invoice = require('../models/invoice');
const Shipping = require('../models/shipping');
const Customer = require('../models/customer');
const DTEGenerator = require('../utils/dteGenerator');

const emisorData = {
  rut: process.env.COMPANY_RUT || '77226199-3',
  razonSocial: process.env.COMPANY_NAME || 'Siriza Agaria S.A.',
  giro: process.env.COMPANY_GIRO || 'Comercio',
  acteco: [620200],
  direccion: process.env.COMPANY_ADDRESS || 'Av. Principal 123',
  comuna: process.env.COMPANY_COMMUNE || 'Santiago',
  ciudad: process.env.COMPANY_CITY || 'Santiago',
  email: process.env.COMPANY_EMAIL || 'contacto@sirizagaria.com'
};

exports.getAllDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 50, tipoDTE, status, customerId } = req.query;
    const filter = {};

    if (tipoDTE) filter.tipoDTE = parseInt(tipoDTE);
    if (status) filter.status = status;
    if (customerId) filter.customerId = customerId;

    const skip = (page - 1) * limit;
    const documents = await DTE.find(filter)
      .populate('customerId', 'name email rut')
      .populate('invoiceId', 'invoiceNumber')
      .populate('shippingId', 'guiaNumber')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await DTE.countDocuments(filter);

    res.json({
      success: true,
      data: documents,
      meta: {
        total,
        perPage: parseInt(limit),
        currentPage: parseInt(page),
        lastPage: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching documents:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDocumentByUUID = async (req, res) => {
  try {
    const { uuid } = req.params;
    const document = await DTE.findOne({ uuid })
      .populate('customerId')
      .populate('invoiceId')
      .populate('shippingId');

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    res.json({
      success: true,
      data: document,
      uuid: document.uuid,
      status: document.status
    });
  } catch (error) {
    console.error('Error fetching document:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDocumentByFolio = async (req, res) => {
  try {
    const { rutEmisor, tipoDTE, folio } = req.params;
    const document = await DTE.findOne({
      rutEmisor: rutEmisor.replace(/\D/g, ''),
      tipoDTE: parseInt(tipoDTE),
      folio: parseInt(folio)
    })
      .populate('customerId')
      .populate('invoiceId')
      .populate('shippingId');

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Error fetching document:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createDocument = async (req, res) => {
  try {
    const { DTE: dteData, idempotencyKey } = req.body;

    if (!dteData) {
      return res.status(400).json({ success: false, error: 'DTE data is required' });
    }

    const idDoc = dteData.Encabezado?.IdDoc || {};
    if (idDoc.Folio !== 0) {
      return res.status(400).json({ success: false, error: 'Folio must be 0 (system generates it)' });
    }

    const generator = new DTEGenerator(emisorData);
    const validation = generator.validateDTE(dteData);

    if (!validation.valid) {
      return res.status(422).json({
        success: false,
        error: 'Validation Error',
        details: validation.errors
      });
    }

    const uuid = generator.generateUUID();
    const rutEmisor = dteData.Encabezado.Emisor.RUTEmisor.replace(/\D/g, '');
    const rutReceptor = dteData.Encabezado.Receptor.RUTRecep.replace(/\D/g, '');

    let customer = await Customer.findOne({
      $or: [
        { rut: rutReceptor },
        { email: dteData.Encabezado.Receptor.CorreoRecep }
      ]
    });

    const document = new DTE({
      uuid,
      tipoDTE: idDoc.TipoDTE,
      status: 'pending',
      rutEmisor,
      rutReceptor,
      customerId: customer?._id,
      fechaEmision: new Date(idDoc.FchEmis),
      fechaVencimiento: idDoc.FchVenc ? new Date(idDoc.FchVenc) : null,
      mntNeto: dteData.Encabezado.Totales.MntNeto,
      mntExe: dteData.Encabezado.Totales.MntExe,
      tasaIVA: dteData.Encabezado.Totales.TasaIVA || 19,
      iva: dteData.Encabezado.Totales.IVA,
      mntTotal: dteData.Encabezado.Totales.MntTotal,
      formaPago: idDoc.FmaPago || 1,
      detalle: dteData.Detalle || [],
      transporte: dteData.Encabezado.Transporte || null,
      referencia: dteData.Referencia || [],
      dteJson: dteData,
      createdBy: req.user?.id || 'system'
    });

    await document.save();

    res.status(201).json({
      success: true,
      message: 'Document created successfully',
      data: document,
      uuid: document.uuid,
      status: document.status
    });
  } catch (error) {
    console.error('Error creating document:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createFacturaElectronica = async (req, res) => {
  try {
    const generator = new DTEGenerator(emisorData);
    const { uuid, dte } = generator.createFacturaElectronica(req.body);

    const rutReceptor = dte.DTE.Encabezado.Receptor.RUTRecep.replace(/\D/g, '');
    let customer = await Customer.findOne({
      $or: [
        { rut: rutReceptor },
        { email: dte.DTE.Encabezado.Receptor.CorreoRecep }
      ]
    });

    const document = new DTE({
      uuid,
      tipoDTE: 33,
      status: 'pending',
      rutEmisor: dte.DTE.Encabezado.Emisor.RUTEmisor.replace(/\D/g, ''),
      rutReceptor,
      customerId: customer?._id,
      invoiceId: req.body.invoiceId,
      fechaEmision: new Date(dte.DTE.Encabezado.IdDoc.FchEmis),
      fechaVencimiento: dte.DTE.Encabezado.IdDoc.FchVenc ? new Date(dte.DTE.Encabezado.IdDoc.FchVenc) : null,
      mntNeto: dte.DTE.Encabezado.Totales.MntNeto,
      tasaIVA: dte.DTE.Encabezado.Totales.TasaIVA,
      iva: dte.DTE.Encabezado.Totales.IVA,
      mntTotal: dte.DTE.Encabezado.Totales.MntTotal,
      formaPago: dte.DTE.Encabezado.IdDoc.FmaPago || 1,
      detalle: dte.DTE.Detalle,
      dteJson: dte.DTE,
      createdBy: req.user?.id || 'system'
    });

    await document.save();

    res.status(201).json({
      success: true,
      message: 'Factura Electrónica created successfully',
      data: document,
      uuid: document.uuid,
      status: document.status
    });
  } catch (error) {
    console.error('Error creating factura electrónica:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createBoletaElectronica = async (req, res) => {
  try {
    const generator = new DTEGenerator(emisorData);
    const { uuid, dte } = generator.createBoletaElectronica(req.body);

    const rutReceptor = dte.DTE.Encabezado.Receptor.RUTRecep.replace(/\D/g, '');
    let customer = await Customer.findOne({
      $or: [
        { rut: rutReceptor },
        { email: dte.DTE.Encabezado.Receptor.CorreoRecep }
      ]
    });

    const document = new DTE({
      uuid,
      tipoDTE: 39,
      status: 'pending',
      rutEmisor: dte.DTE.Encabezado.Emisor.RUTEmisor.replace(/\D/g, ''),
      rutReceptor,
      customerId: customer?._id,
      invoiceId: req.body.invoiceId,
      fechaEmision: new Date(dte.DTE.Encabezado.IdDoc.FchEmis),
      mntNeto: dte.DTE.Encabezado.Totales.MntNeto,
      tasaIVA: dte.DTE.Encabezado.Totales.TasaIVA,
      iva: dte.DTE.Encabezado.Totales.IVA,
      mntTotal: dte.DTE.Encabezado.Totales.MntTotal,
      detalle: dte.DTE.Detalle,
      dteJson: dte.DTE,
      createdBy: req.user?.id || 'system'
    });

    await document.save();

    res.status(201).json({
      success: true,
      message: 'Boleta Electrónica created successfully',
      data: document,
      uuid: document.uuid,
      status: document.status
    });
  } catch (error) {
    console.error('Error creating boleta electrónica:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createGuiaDespacho = async (req, res) => {
  try {
    const generator = new DTEGenerator(emisorData);
    const { uuid, dte } = generator.createGuiaDespacho(req.body);

    const rutReceptor = dte.DTE.Encabezado.Receptor.RUTRecep.replace(/\D/g, '');
    let customer = await Customer.findOne({
      $or: [
        { rut: rutReceptor },
        { email: dte.DTE.Encabezado.Receptor.CorreoRecep }
      ]
    });

    const document = new DTE({
      uuid,
      tipoDTE: 52,
      status: 'pending',
      rutEmisor: dte.DTE.Encabezado.Emisor.RUTEmisor.replace(/\D/g, ''),
      rutReceptor,
      customerId: customer?._id,
      shippingId: req.body.shippingId,
      fechaEmision: new Date(dte.DTE.Encabezado.IdDoc.FchEmis),
      mntNeto: dte.DTE.Encabezado.Totales.MntNeto,
      tasaIVA: dte.DTE.Encabezado.Totales.TasaIVA,
      iva: dte.DTE.Encabezado.Totales.IVA,
      mntTotal: dte.DTE.Encabezado.Totales.MntTotal,
      detalle: dte.DTE.Detalle,
      transporte: dte.DTE.Encabezado.Transporte,
      dteJson: dte.DTE,
      createdBy: req.user?.id || 'system'
    });

    await document.save();

    if (req.body.shippingId) {
      await Shipping.findByIdAndUpdate(req.body.shippingId, {
        guiaElectronica: 'generated',
        guiaElectronicaNumber: uuid
      });
    }

    res.status(201).json({
      success: true,
      message: 'Guía de Despacho created successfully',
      data: document,
      uuid: document.uuid,
      status: document.status
    });
  } catch (error) {
    console.error('Error creating guía de despacho:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createNotaCredito = async (req, res) => {
  try {
    const generator = new DTEGenerator(emisorData);
    const { uuid, dte } = generator.createNotaCredito(req.body);

    const rutReceptor = dte.DTE.Encabezado.Receptor.RUTRecep.replace(/\D/g, '');
    let customer = await Customer.findOne({
      $or: [
        { rut: rutReceptor },
        { email: dte.DTE.Encabezado.Receptor.CorreoRecep }
      ]
    });

    const document = new DTE({
      uuid,
      tipoDTE: 61,
      status: 'pending',
      rutEmisor: dte.DTE.Encabezado.Emisor.RUTEmisor.replace(/\D/g, ''),
      rutReceptor,
      customerId: customer?._id,
      invoiceId: req.body.invoiceId,
      fechaEmision: new Date(dte.DTE.Encabezado.IdDoc.FchEmis),
      mntNeto: dte.DTE.Encabezado.Totales.MntNeto,
      tasaIVA: dte.DTE.Encabezado.Totales.TasaIVA,
      iva: dte.DTE.Encabezado.Totales.IVA,
      mntTotal: dte.DTE.Encabezado.Totales.MntTotal,
      detalle: dte.DTE.Detalle,
      referencia: dte.DTE.Referencia,
      dteJson: dte.DTE,
      createdBy: req.user?.id || 'system'
    });

    await document.save();

    res.status(201).json({
      success: true,
      message: 'Nota de Crédito created successfully',
      data: document,
      uuid: document.uuid,
      status: document.status
    });
  } catch (error) {
    console.error('Error creating nota de crédito:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createNotaDebito = async (req, res) => {
  try {
    const generator = new DTEGenerator(emisorData);
    const { uuid, dte } = generator.createNotaDebito(req.body);

    const rutReceptor = dte.DTE.Encabezado.Receptor.RUTRecep.replace(/\D/g, '');
    let customer = await Customer.findOne({
      $or: [
        { rut: rutReceptor },
        { email: dte.DTE.Encabezado.Receptor.CorreoRecep }
      ]
    });

    const document = new DTE({
      uuid,
      tipoDTE: 56,
      status: 'pending',
      rutEmisor: dte.DTE.Encabezado.Emisor.RUTEmisor.replace(/\D/g, ''),
      rutReceptor,
      customerId: customer?._id,
      invoiceId: req.body.invoiceId,
      fechaEmision: new Date(dte.DTE.Encabezado.IdDoc.FchEmis),
      mntNeto: dte.DTE.Encabezado.Totales.MntNeto,
      tasaIVA: dte.DTE.Encabezado.Totales.TasaIVA,
      iva: dte.DTE.Encabezado.Totales.IVA,
      mntTotal: dte.DTE.Encabezado.Totales.MntTotal,
      detalle: dte.DTE.Detalle,
      referencia: dte.DTE.Referencia,
      dteJson: dte.DTE,
      createdBy: req.user?.id || 'system'
    });

    await document.save();

    res.status(201).json({
      success: true,
      message: 'Nota de Débito created successfully',
      data: document,
      uuid: document.uuid,
      status: document.status
    });
  } catch (error) {
    console.error('Error creating nota de débito:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPendingDocumentStatus = async (req, res) => {
  try {
    const { uuid } = req.params;
    const document = await DTE.findOne({ uuid })
      .populate('customerId')
      .populate('invoiceId')
      .populate('shippingId');

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    res.json({
      success: true,
      data: document,
      uuid: document.uuid,
      status: document.status,
      folio: document.folio || null
    });
  } catch (error) {
    console.error('Error fetching pending document status:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateDocumentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, folio, siiResponse, siiError } = req.body;

    const document = await DTE.findByIdAndUpdate(
      id,
      {
        status,
        folio: folio || null,
        siiResponse: siiResponse || null,
        siiError: siiError || null,
        processedAt: status === 'completed' ? new Date() : null
      },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    res.json({
      success: true,
      message: 'Document status updated successfully',
      data: document
    });
  } catch (error) {
    console.error('Error updating document status:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDocumentStats = async (req, res) => {
  try {
    const documents = await DTE.find();

    const byTipoDTE = {};
    const byStatus = {};

    documents.forEach(doc => {
      byTipoDTE[doc.tipoDTE] = (byTipoDTE[doc.tipoDTE] || 0) + 1;
      byStatus[doc.status] = (byStatus[doc.status] || 0) + 1;
    });

    const totalAmount = documents.reduce((sum, doc) => sum + (doc.mntTotal || 0), 0);
    const totalWithIVA = documents.filter(d => d.iva).reduce((sum, doc) => sum + (doc.iva || 0), 0);

    res.json({
      success: true,
      data: {
        totalDocuments: documents.length,
        totalAmount,
        totalIVA: totalWithIVA,
        byTipoDTE,
        byStatus
      }
    });
  } catch (error) {
    console.error('Error fetching document stats:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createFromInvoice = async (req, res) => {
  try {
    const { invoiceId, documentType = 'factura' } = req.body;

    const invoice = await Invoice.findById(invoiceId).populate('customerId');
    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    const customer = invoice.customerId;
    const generator = new DTEGenerator(emisorData);

    let dteData;
    let tipoDTE;

    const invoiceData = {
      rutReceptor: customer.rut,
      razonSocialReceptor: customer.name,
      giroReceptor: customer.businessType || 'Servicios',
      dirReceptor: customer.address,
      cmnaReceptor: customer.commune,
      ciudadReceptor: customer.region,
      correoReceptor: customer.email,
      mntNeto: invoice.subtotal,
      tasaIVA: invoice.taxRate,
      iva: invoice.tax,
      mntTotal: invoice.total,
      items: invoice.items.map(item => ({
        nmbItem: item.description,
        qtyItem: item.quantity,
        prcItem: item.unitPrice,
        montoItem: item.total
      })),
      invoiceId
    };

    if (documentType === 'factura') {
      const result = generator.createFacturaElectronica(invoiceData);
      dteData = result.dte;
      tipoDTE = 33;
    } else if (documentType === 'boleta') {
      const result = generator.createBoletaElectronica(invoiceData);
      dteData = result.dte;
      tipoDTE = 39;
    } else {
      return res.status(400).json({ success: false, error: 'Invalid document type' });
    }

    const document = new DTE({
      uuid: generator.generateUUID(),
      tipoDTE,
      status: 'pending',
      rutEmisor: dteData.DTE.Encabezado.Emisor.RUTEmisor.replace(/\D/g, ''),
      rutReceptor: dteData.DTE.Encabezado.Receptor.RUTRecep.replace(/\D/g, ''),
      customerId: invoice.customerId._id,
      invoiceId,
      fechaEmision: new Date(dteData.DTE.Encabezado.IdDoc.FchEmis),
      mntNeto: dteData.DTE.Encabezado.Totales.MntNeto,
      tasaIVA: dteData.DTE.Encabezado.Totales.TasaIVA,
      iva: dteData.DTE.Encabezado.Totales.IVA,
      mntTotal: dteData.DTE.Encabezado.Totales.MntTotal,
      detalle: dteData.DTE.Detalle,
      dteJson: dteData.DTE,
      createdBy: req.user?.id || 'system'
    });

    await document.save();

    res.status(201).json({
      success: true,
      message: `${documentType === 'factura' ? 'Factura Electrónica' : 'Boleta Electrónica'} created from invoice`,
      data: document,
      uuid: document.uuid,
      status: document.status
    });
  } catch (error) {
    console.error('Error creating DTE from invoice:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createFromShipping = async (req, res) => {
  try {
    const { shippingId } = req.body;

    const shipping = await Shipping.findById(shippingId).populate('customerId').populate('orderId');
    if (!shipping) {
      return res.status(404).json({ success: false, error: 'Shipping not found' });
    }

    const customer = shipping.customerId;
    const generator = new DTEGenerator(emisorData);

    const shippingData = {
      rutReceptor: customer.rut,
      razonSocialReceptor: customer.name,
      giroReceptor: customer.businessType || 'Servicios',
      dirReceptor: customer.address,
      cmnaReceptor: customer.commune,
      ciudadReceptor: customer.region,
      dirDestino: shipping.shippingAddress.address,
      cmnaDestino: shipping.shippingAddress.commune,
      ciudadDestino: shipping.shippingAddress.region,
      correoReceptor: customer.email,
      patente: shipping.trackingNumber,
      rutChofer: shipping.trackingNumber,
      nombreChofer: 'Transportista',
      mntNeto: 0,
      tasaIVA: 19,
      iva: 0,
      mntTotal: shipping.shippingCost || 0,
      items: shipping.items.map(item => ({
        nmbItem: item.description,
        qtyItem: item.quantity,
        prcItem: 0,
        montoItem: 0
      })),
      shippingId
    };

    const result = generator.createGuiaDespacho(shippingData);
    const dteData = result.dte;

    const document = new DTE({
      uuid: result.uuid,
      tipoDTE: 52,
      status: 'pending',
      rutEmisor: dteData.DTE.Encabezado.Emisor.RUTEmisor.replace(/\D/g, ''),
      rutReceptor: dteData.DTE.Encabezado.Receptor.RUTRecep.replace(/\D/g, ''),
      customerId: shipping.customerId._id,
      shippingId,
      fechaEmision: new Date(dteData.DTE.Encabezado.IdDoc.FchEmis),
      mntNeto: dteData.DTE.Encabezado.Totales.MntNeto,
      tasaIVA: dteData.DTE.Encabezado.Totales.TasaIVA,
      iva: dteData.DTE.Encabezado.Totales.IVA,
      mntTotal: dteData.DTE.Encabezado.Totales.MntTotal,
      detalle: dteData.DTE.Detalle,
      transporte: dteData.DTE.Encabezado.Transporte,
      dteJson: dteData.DTE,
      createdBy: req.user?.id || 'system'
    });

    await document.save();

    await Shipping.findByIdAndUpdate(shippingId, {
      guiaElectronica: 'generated',
      guiaElectronicaNumber: result.uuid
    });

    res.status(201).json({
      success: true,
      message: 'Guía de Despacho created from shipping',
      data: document,
      uuid: document.uuid,
      status: document.status
    });
  } catch (error) {
    console.error('Error creating guía from shipping:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
