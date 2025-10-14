import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

interface BudgetItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Budget {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  subtotal: number;
  discount_type: string | null;
  discount_value: number;
  total: number;
  status: string;
  notes: string | null;
  valid_until: string | null;
  created_at: string;
}

export const generateBudgetPDF = async (budget: Budget) => {
  try {
    console.log('🔄 Iniciando geração de PDF para orçamento:', budget.id);
    
    // Buscar itens do orçamento primeiro
    const { data: items, error } = await supabase
      .from('budget_items')
      .select('id, quantity, unit_price, total_price, product_id')
      .eq('budget_id', budget.id);

    console.log('📋 Itens encontrados:', items?.length || 0);
    if (error) {
      console.error('❌ Erro ao buscar itens:', error);
      throw new Error(`Erro ao buscar itens do orçamento: ${error.message}`);
    }

    // Buscar nomes dos produtos separadamente
    const budgetItems: BudgetItem[] = [];
    for (const item of items || []) {
      const { data: product } = await supabase
        .from('products')
        .select('name')
        .eq('id', item.product_id)
        .single();
      
      budgetItems.push({
        id: item.id,
        product_name: product?.name || 'Produto não encontrado',
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      });
    }

    console.log('✅ Itens processados para PDF:', budgetItems.length);

    // Criar o PDF com design moderno e profissional
    const doc = new jsPDF();
    
    // Configurações
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    let yPosition = 25;
    
    // === CABEÇALHO PRINCIPAL ===
    // Gradiente simulado com retângulos sobrepostos
    doc.setFillColor(37, 99, 235); // blue-600
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setFillColor(59, 130, 246); // blue-500 (mais claro)
    doc.rect(0, 25, pageWidth, 15, 'F');
    
    // Logo/Nome da empresa
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('SUA EMPRESA', margin, 22);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Gestão Comercial', margin, 32);
    
    // Número do orçamento no canto direito
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const budgetNumber = `#${budget.id.substring(0, 8).toUpperCase()}`;
    doc.text('ORÇAMENTO', pageWidth - margin - 50, 18);
    doc.text(budgetNumber, pageWidth - margin - 50, 28);
    
    // Reset para próxima seção
    doc.setTextColor(0, 0, 0);
    yPosition = 55;
    
    // === INFORMAÇÕES DO ORÇAMENTO E STATUS ===
    // Box de informações gerais
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 28, 3, 3, 'FD');
    
    // Dados do orçamento (esquerda)
    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO ORÇAMENTO', margin + 8, yPosition);
    
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Data de Emissão: ${new Date(budget.created_at).toLocaleDateString('pt-BR')}`, margin + 8, yPosition);
    
    yPosition += 4;
    if (budget.valid_until) {
      doc.text(`Válido até: ${new Date(budget.valid_until).toLocaleDateString('pt-BR')}`, margin + 8, yPosition);
    } else {
      doc.text('Válido por: 30 dias', margin + 8, yPosition);
    }
    
    // Status (direita)
    const statusColors = {
      'open': { bg: [220, 252, 231] as [number, number, number], text: [22, 163, 74] as [number, number, number], label: 'ABERTO' },
      'converted': { bg: [219, 234, 254] as [number, number, number], text: [37, 99, 235] as [number, number, number], label: 'CONVERTIDO' },
      'canceled': { bg: [254, 226, 226] as [number, number, number], text: [220, 38, 38] as [number, number, number], label: 'CANCELADO' }
    };
    
    const statusInfo = statusColors[budget.status as keyof typeof statusColors] || statusColors.open;
    
    const statusX = pageWidth - margin - 60;
    yPosition -= 10;
    
    doc.setFillColor(statusInfo.bg[0], statusInfo.bg[1], statusInfo.bg[2]);
    doc.roundedRect(statusX, yPosition, 55, 20, 2, 2, 'F');
    
    doc.setTextColor(statusInfo.text[0], statusInfo.text[1], statusInfo.text[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('STATUS', statusX + 3, yPosition + 6);
    doc.setFontSize(10);
    doc.text(statusInfo.label, statusX + 3, yPosition + 13);
    
    doc.setTextColor(0, 0, 0);
    yPosition += 25;
    
    // === DADOS DO CLIENTE ===
    doc.setFillColor(254, 249, 195); // yellow-100
    doc.setDrawColor(251, 191, 36); // yellow-400
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 35, 3, 3, 'FD');
    
    yPosition += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENTE', margin + 8, yPosition);
    
    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    if (budget.customer_name) {
      doc.setFont('helvetica', 'bold');
      doc.text(budget.customer_name, margin + 8, yPosition);
      yPosition += 5;
      doc.setFont('helvetica', 'normal');
    } else {
      doc.text('Cliente não informado', margin + 8, yPosition);
      yPosition += 5;
    }
    
    const contactInfo = [];
    if (budget.customer_email) contactInfo.push(budget.customer_email);
    if (budget.customer_phone) contactInfo.push(budget.customer_phone);
    
    if (contactInfo.length > 0) {
      doc.setFontSize(9);
      doc.text(contactInfo.join(' | '), margin + 8, yPosition);
    }
    
    yPosition += 25;
    
    // === TABELA DE ITENS ===
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ITENS DO ORÇAMENTO', margin, yPosition);
    yPosition += 10;
    
    // Cabeçalho da tabela
    doc.setFillColor(71, 85, 105); // slate-600
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    
    const colWidths = [90, 20, 30, 30];
    const headers = ['DESCRIÇÃO', 'QTD', 'VLR. UNIT.', 'TOTAL'];
    let xPos = margin + 3;
    
    headers.forEach((header, index) => {
      if (index === 0) {
        doc.text(header, xPos, yPosition + 6);
      } else {
        doc.text(header, xPos + colWidths[index] - 3, yPosition + 6, { align: 'right' });
      }
      xPos += colWidths[index];
    });
    
    doc.setTextColor(0, 0, 0);
    yPosition += 12;
    
    // Linhas da tabela
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    budgetItems.forEach((item, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251); // gray-50
        doc.rect(margin, yPosition - 2, pageWidth - 2 * margin, 10, 'F');
      }
      
      xPos = margin + 3;
      
      // Produto (truncar se muito longo)
      const productName = item.product_name.length > 35 
        ? item.product_name.substring(0, 32) + '...'
        : item.product_name;
      doc.text(productName, xPos, yPosition + 4);
      
      // Quantidade
      xPos += colWidths[0];
      doc.text(item.quantity.toString(), xPos + colWidths[1] - 3, yPosition + 4, { align: 'right' });
      
      // Valor unitário
      xPos += colWidths[1];
      doc.text(`R$ ${item.unit_price.toFixed(2)}`, xPos + colWidths[2] - 3, yPosition + 4, { align: 'right' });
      
      // Total
      xPos += colWidths[2];
      doc.text(`R$ ${item.total_price.toFixed(2)}`, xPos + colWidths[3] - 3, yPosition + 4, { align: 'right' });
      
      yPosition += 10;
    });
    
    yPosition += 10;
    
    // === RESUMO FINANCEIRO ===
    const summaryWidth = 90;
    const summaryX = pageWidth - margin - summaryWidth;
    
    // Box do resumo
    doc.setFillColor(239, 246, 255); // blue-50
    doc.setDrawColor(59, 130, 246); // blue-500
    doc.roundedRect(summaryX, yPosition, summaryWidth, 35, 3, 3, 'FD');
    
    yPosition += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('RESUMO FINANCEIRO', summaryX + 5, yPosition);
    
    yPosition += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    // Subtotal
    doc.text('Subtotal:', summaryX + 5, yPosition);
    doc.text(`R$ ${budget.subtotal.toFixed(2)}`, summaryX + summaryWidth - 5, yPosition, { align: 'right' });
    yPosition += 5;
    
    // Desconto (se houver)
    if (budget.discount_value > 0) {
      const discountAmount = budget.discount_type === 'percentage' 
        ? (budget.subtotal * budget.discount_value / 100)
        : budget.discount_value;
      
      doc.setTextColor(220, 38, 38); // red-600
      doc.text('Desconto:', summaryX + 5, yPosition);
      doc.text(`-R$ ${discountAmount.toFixed(2)}`, summaryX + summaryWidth - 5, yPosition, { align: 'right' });
      yPosition += 5;
      doc.setTextColor(0, 0, 0);
    }
    
    // Linha separadora
    doc.setDrawColor(59, 130, 246);
    doc.line(summaryX + 5, yPosition, summaryX + summaryWidth - 5, yPosition);
    yPosition += 3;
    
    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235); // blue-600
    doc.text('TOTAL:', summaryX + 5, yPosition);
    doc.text(`R$ ${budget.total.toFixed(2)}`, summaryX + summaryWidth - 5, yPosition, { align: 'right' });
    
    doc.setTextColor(0, 0, 0);
    yPosition += 20;
    
    // === OBSERVAÇÕES ===
    if (budget.notes) {
      doc.setFillColor(255, 251, 235); // amber-50
      doc.setDrawColor(245, 158, 11); // amber-500
      doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 25, 3, 3, 'FD');
      
      yPosition += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('OBSERVAÇÕES', margin + 8, yPosition);
      
      yPosition += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const notesLines = doc.splitTextToSize(budget.notes, pageWidth - 2 * margin - 16);
      doc.text(notesLines, margin + 8, yPosition);
      
      yPosition += 20;
    }
    
    // === CONDIÇÕES COMERCIAIS ===
    yPosition += 10;
    doc.setFillColor(249, 250, 251); // gray-50
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 25, 3, 3, 'F');
    
    yPosition += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('CONDIÇÕES COMERCIAIS', margin + 8, yPosition);
    
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('• Orçamento válido conforme data de validade informada', margin + 8, yPosition);
    yPosition += 3;
    doc.text('• Preços sujeitos a alteração sem aviso prévio', margin + 8, yPosition);
    yPosition += 3;
    doc.text('• Pagamento conforme condições acordadas', margin + 8, yPosition);
    
    // === RODAPÉ ===
    const footerY = pageHeight - 25;
    
    // Linha decorativa
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139); // slate-500
    
    doc.text('Este orçamento foi gerado automaticamente pelo sistema de gestão.', pageWidth / 2, footerY, { align: 'center' });
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')} | Documento válido sem assinatura`, pageWidth / 2, footerY + 5, { align: 'center' });
    
    // Assinatura da empresa (canto direito)
    doc.text('SUA EMPRESA LTDA', pageWidth - margin - 5, footerY + 12, { align: 'right' });
    
    // === SALVAR PDF ===
    const customerName = budget.customer_name 
      ? budget.customer_name.replace(/[^a-zA-Z0-9]/g, '_') 
      : 'Cliente';
    const fileName = `Orcamento_${customerName}_${budget.id.substring(0, 8)}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    console.log('💾 Salvando PDF:', fileName);
    doc.save(fileName);
    
    console.log('✅ PDF gerado com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro completo ao gerar PDF:', error);
    throw error;
  }
};