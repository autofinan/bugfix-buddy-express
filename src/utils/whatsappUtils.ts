import jsPDF from 'jspdf';

interface BudgetItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Budget {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  subtotal: number;
  discount_value: number;
  total: number;
  valid_until: string | null;
  notes: string | null;
}

export const generateBudgetPDFBase64 = async (
  budget: Budget,
  items: BudgetItem[]
): Promise<string> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let y = 20;

  // Cabeçalho
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('ORÇAMENTO', pageWidth / 2, y, { align: 'center' });
  
  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nº ${budget.id.substring(0, 8).toUpperCase()}`, pageWidth / 2, y, { align: 'center' });
  
  y += 15;

  // Cliente
  if (budget.customer_name) {
    doc.setFont('helvetica', 'bold');
    doc.text('Cliente:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(budget.customer_name, 45, y);
    y += 8;
  }

  // Itens
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('ITEM', 20, y);
  doc.text('QTD', 100, y);
  doc.text('VALOR UN.', 130, y);
  doc.text('TOTAL', 170, y, { align: 'right' });
  y += 8;

  doc.setFont('helvetica', 'normal');
  items.forEach((item) => {
    doc.text(item.product_name, 20, y);
    doc.text(item.quantity.toString(), 100, y);
    doc.text(`R$ ${item.unit_price.toFixed(2)}`, 130, y);
    doc.text(`R$ ${item.total_price.toFixed(2)}`, 170, y, { align: 'right' });
    y += 7;
  });

  // Totais
  y += 10;
  doc.line(20, y, 190, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('Subtotal:', 130, y);
  doc.text(`R$ ${budget.subtotal.toFixed(2)}`, 170, y, { align: 'right' });
  y += 7;

  if (budget.discount_value > 0) {
    doc.text('Desconto:', 130, y);
    doc.text(`- R$ ${budget.discount_value.toFixed(2)}`, 170, y, { align: 'right' });
    y += 7;
  }

  doc.setFontSize(12);
  doc.text('TOTAL:', 130, y);
  doc.text(`R$ ${budget.total.toFixed(2)}`, 170, y, { align: 'right' });

  // Validade
  if (budget.valid_until) {
    y += 15;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Válido até: ${new Date(budget.valid_until).toLocaleDateString('pt-BR')}`,
      20,
      y
    );
  }

  // Observações
  if (budget.notes) {
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Observações:', 20, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(budget.notes, 170);
    doc.text(lines, 20, y);
  }

  // Retornar como base64
  return doc.output('dataurlstring');
};

export const generateWhatsAppLink = (
  phone: string,
  budget: Budget,
  items: BudgetItem[]
): string => {
  // Remove caracteres não numéricos do telefone
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Adiciona código do Brasil se necessário
  const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

  // Monta a mensagem
  const customerName = budget.customer_name || 'Cliente';
  const budgetNumber = budget.id.substring(0, 8).toUpperCase();
  
  let message = `Olá ${customerName}! 👋\n\n`;
  message += `Segue o orçamento *#${budgetNumber}*:\n\n`;
  
  // Lista de itens
  items.forEach((item) => {
    message += `• ${item.quantity}x ${item.product_name} - R$ ${item.total_price.toFixed(2)}\n`;
  });
  
  message += `\n*Subtotal:* R$ ${budget.subtotal.toFixed(2)}\n`;
  
  if (budget.discount_value > 0) {
    message += `*Desconto:* R$ ${budget.discount_value.toFixed(2)}\n`;
  }
  
  message += `*TOTAL:* R$ ${budget.total.toFixed(2)}\n\n`;
  
  if (budget.valid_until) {
    message += `📅 Válido até: ${new Date(budget.valid_until).toLocaleDateString('pt-BR')}\n\n`;
  }
  
  if (budget.notes) {
    message += `📝 *Observações:* ${budget.notes}\n\n`;
  }
  
  message += `Aguardo seu retorno! 😊`;

  // Codifica a mensagem para URL
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${fullPhone}?text=${encodedMessage}`;
};

export const openWhatsAppWithBudget = (
  phone: string,
  budget: Budget,
  items: BudgetItem[]
) => {
  const link = generateWhatsAppLink(phone, budget, items);
  window.open(link, '_blank');
};
