import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export interface NFData {
  saleId: string;
  saleDate: string;
  total: number;
  subtotal?: number;
  discountType?: string;
  discountValue?: number;
  paymentMethod: string;
  note?: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  owner: {
    name?: string;
    cnpj?: string;
    address?: string;
    phone?: string;
  };
  customer?: {
    name?: string;
    phone?: string;
    address?: string;
  };
  plan: 'free' | 'premium';
}

export async function generateNFPDF(data: NFData): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 20;

  // Função auxiliar para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Gerar QR Code
  const qrCodeUrl = `https://gestormei.vercel.app/comprovante/${data.saleId}`;
  const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, { width: 80 });

  // Header com Logo e QR Code
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('GestorMEI', margin, y);
  
  // QR Code no canto superior direito
  doc.addImage(qrCodeDataUrl, 'PNG', pageWidth - margin - 30, 10, 30, 30);
  
  y += 10;
  doc.setFontSize(16);
  doc.text('COMPROVANTE DE VENDA DETALHADO', margin, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nº ${data.saleId.substring(0, 8).toUpperCase()}`, margin, y);
  doc.text(`Data: ${new Date(data.saleDate).toLocaleDateString('pt-BR')} ${new Date(data.saleDate).toLocaleTimeString('pt-BR')}`, margin, y + 5);

  // Separador
  y += 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);

  // Dados do Emitente (MEI)
  y += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('EMITENTE', margin, y);
  
  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (data.owner.name) {
    doc.text(data.owner.name, margin, y);
    y += 5;
  }
  if (data.owner.cnpj) {
    doc.text(`CNPJ: ${data.owner.cnpj}`, margin, y);
    y += 5;
  }
  if (data.owner.address) {
    doc.text(`Endereço: ${data.owner.address}`, margin, y);
    y += 5;
  }
  if (data.owner.phone) {
    doc.text(`Telefone: ${data.owner.phone}`, margin, y);
    y += 5;
  }

  // Dados do Cliente (se houver)
  if (data.customer && (data.customer.name || data.customer.phone)) {
    y += 5;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENTE', margin, y);
    
    y += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (data.customer.name) {
      doc.text(data.customer.name, margin, y);
      y += 5;
    }
    if (data.customer.phone) {
      doc.text(`Telefone: ${data.customer.phone}`, margin, y);
      y += 5;
    }
    if (data.customer.address) {
      doc.text(`Endereço: ${data.customer.address}`, margin, y);
      y += 5;
    }
  }

  // Separador
  y += 5;
  doc.line(margin, y, pageWidth - margin, y);

  // Tabela de Itens
  y += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('ITENS', margin, y);

  y += 7;
  doc.setFontSize(9);
  
  // Cabeçalho da tabela
  const colWidths = {
    produto: 80,
    qtd: 25,
    unitario: 35,
    total: 35
  };
  
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y - 4, pageWidth - 2 * margin, 7, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.text('Produto', margin + 2, y);
  doc.text('Qtd', margin + colWidths.produto + 5, y);
  doc.text('Unit.', margin + colWidths.produto + colWidths.qtd + 10, y);
  doc.text('Total', margin + colWidths.produto + colWidths.qtd + colWidths.unitario + 15, y);

  y += 7;
  doc.setFont('helvetica', 'normal');

  // Itens
  data.items.forEach((item, index) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, y - 4, pageWidth - 2 * margin, 6, 'F');
    }

    doc.text(item.name.substring(0, 40), margin + 2, y);
    doc.text(String(item.quantity), margin + colWidths.produto + 5, y);
    doc.text(formatCurrency(item.unitPrice), margin + colWidths.produto + colWidths.qtd + 10, y);
    doc.text(formatCurrency(item.totalPrice), margin + colWidths.produto + colWidths.qtd + colWidths.unitario + 15, y);
    
    y += 6;
  });

  // Separador
  y += 5;
  doc.line(margin, y, pageWidth - margin, y);

  // Totais
  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const totalsX = pageWidth - margin - 60;

  if (data.subtotal && data.subtotal !== data.total) {
    doc.text('Subtotal:', totalsX, y);
    doc.text(formatCurrency(data.subtotal), totalsX + 30, y);
    y += 6;
  }

  if (data.discountValue && data.discountValue > 0) {
    doc.text('Desconto:', totalsX, y);
    const discountText = data.discountType === 'percentage' 
      ? `${data.discountValue}%` 
      : formatCurrency(data.discountValue);
    doc.text(discountText, totalsX + 30, y);
    y += 6;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', totalsX, y);
  doc.text(formatCurrency(data.total), totalsX + 30, y);

  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Forma de pagamento: ${data.paymentMethod}`, margin, y);

  if (data.note) {
    y += 7;
    doc.text(`Observações: ${data.note}`, margin, y);
  }

  // Rodapé
  const footerY = doc.internal.pageSize.getHeight() - 30;
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Documento gerado automaticamente pelo GestorMEI', pageWidth / 2, footerY, { align: 'center' });
  doc.text('Este documento não possui valor fiscal', pageWidth / 2, footerY + 4, { align: 'center' });
  
  // Marca d'água para plano free
  if (data.plan === 'free') {
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.textWithLink('Criado gratuitamente no GestorMEI', pageWidth / 2, footerY + 9, {
      align: 'center',
      url: 'https://gestormei.vercel.app'
    });
    doc.text('https://gestormei.vercel.app', pageWidth / 2, footerY + 13, { align: 'center' });
  }

  return doc.output('blob');
}
