import jsPDF from 'jspdf';
import { CartItem } from '@/components/pos/POSView';

interface StoreInfo {
  name: string;
  cnpj: string;
  phone: string;
  address: string;
}

export const generateSaleReceipt = async (
  cartItems: CartItem[],
  total: number,
  paymentMethod: string,
  storeInfo?: StoreInfo
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 297]
  });

  let y = 10;
  const lineHeight = 5;
  const pageWidth = 80;
  const margin = 5;
  const contentWidth = pageWidth - (margin * 2);

  const addCenteredText = (text: string, yPos: number, fontSize: number = 10) => {
    doc.setFontSize(fontSize);
    const textWidth = doc.getTextWidth(text);
    const x = (pageWidth - textWidth) / 2;
    doc.text(text, x, yPos);
  };

  const addLine = (yPos: number) => {
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
  };

  if (storeInfo?.name) {
    doc.setFont('helvetica', 'bold');
    addCenteredText(storeInfo.name.toUpperCase(), y, 12);
    y += lineHeight;
    
    doc.setFont('helvetica', 'normal');
    if (storeInfo.cnpj) {
      addCenteredText(`CNPJ: ${storeInfo.cnpj}`, y, 8);
      y += lineHeight;
    }
    
    if (storeInfo.phone) {
      addCenteredText(`Tel: ${storeInfo.phone}`, y, 8);
      y += lineHeight;
    }
    
    if (storeInfo.address) {
      doc.setFontSize(7);
      const addressLines = doc.splitTextToSize(storeInfo.address, contentWidth);
      addressLines.forEach((line: string) => {
        addCenteredText(line, y, 7);
        y += 4;
      });
    }
  } else {
    doc.setFont('helvetica', 'bold');
    addCenteredText('COMPROVANTE DE VENDA', y, 12);
    y += lineHeight;
  }

  y += 2;
  addLine(y);
  y += lineHeight;

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR');
  doc.setFont('helvetica', 'normal');
  addCenteredText(`${dateStr} - ${timeStr}`, y, 8);
  y += lineHeight;

  addLine(y);
  y += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Item', margin, y);
  doc.text('Qtd', margin + 40, y);
  doc.text('Valor', pageWidth - margin - 2, y, { align: 'right' });
  y += lineHeight;
  addLine(y);
  y += lineHeight;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  cartItems.forEach((item) => {
    const itemName = item.name.length > 25 ? item.name.substring(0, 25) + '...' : item.name;
    doc.text(itemName, margin, y);
    y += lineHeight;
    
    doc.text(`${item.quantity}x R$ ${item.price.toFixed(2)}`, margin, y);
    y += lineHeight;
    
    const subtotal = item.price * item.quantity;
    doc.setFont('helvetica', 'bold');
    doc.text(`Subtotal: R$ ${subtotal.toFixed(2)}`, margin + 20, y);
    doc.setFont('helvetica', 'normal');
    y += lineHeight + 1;
  });

  addLine(y);
  y += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', margin, y);
  doc.text(`R$ ${total.toFixed(2)}`, pageWidth - margin, y, { align: 'right' });
  y += lineHeight + 2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const paymentLabel = getPaymentMethodLabel(paymentMethod);
  addCenteredText(`Pagamento: ${paymentLabel}`, y, 9);
  y += lineHeight + 3;

  addLine(y);
  y += lineHeight + 2;

  doc.setFont('helvetica', 'bold');
  addCenteredText('Obrigado pela preferência!', y, 10);
  y += lineHeight;
  doc.setFont('helvetica', 'normal');
  addCenteredText('Volte sempre!', y, 8);
  y += lineHeight + 5;

  const footerStartY = y + 5;
  
  addLine(footerStartY);
  
  try {
    const gestorLogo = await fetch('/logo/icone_grande SF.png');
    const gestorBlob = await gestorLogo.blob();
    const gestorReader = new FileReader();

    await new Promise((resolve) => {
      gestorReader.onloadend = () => {
        try {
          const logoSize = 8;
          const logoX = pageWidth / 2 - logoSize / 2;
          doc.addImage(gestorReader.result as string, 'PNG', logoX, footerStartY + 3, logoSize, logoSize);
        } catch (error) {
          console.warn('⚠️ Falha ao adicionar logo GestorMEI');
        }
        resolve(null);
      };
      gestorReader.readAsDataURL(gestorBlob);
    });
  } catch (error) {
    console.warn('⚠️ Falha ao carregar logo GestorMEI');
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  addCenteredText('Criado por', footerStartY + 13, 7);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.textWithLink('GestorMEI', pageWidth / 2, footerStartY + 17, { url: 'https://gestormei.com.br', align: 'center' });

  doc.setFontSize(6);
  doc.setTextColor(120, 120, 120);
  addCenteredText(`${dateStr} ${timeStr}`, footerStartY + 21, 6);

  doc.save(`venda-${now.getTime()}.pdf`);
};

const getPaymentMethodLabel = (method: string): string => {
  const labels: Record<string, string> = {
    'dinheiro': 'Dinheiro',
    'pix': 'PIX',
    'debito': 'Débito',
    'credito_vista': 'Crédito à Vista',
    'credito_parcelado': 'Crédito Parcelado',
    'transferencia': 'Transferência',
    'dividido': 'Pagamento Dividido'
  };
  return labels[method] || method;
};
