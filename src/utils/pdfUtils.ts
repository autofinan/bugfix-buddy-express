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
    
    // Buscar configurações da loja
    const { data: userData } = await supabase.auth.getUser();
    let storeSettings = null;
    
    if (userData.user) {
      const { data: settings } = await supabase
        .from('store_settings')
        .select('*')
        .eq('owner_id', userData.user.id)
        .maybeSingle();
      
      storeSettings = settings;
    }
    
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
        .select('name, description')
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

    // Criar o PDF com design inspirado no modelo de referência
    const doc = new jsPDF();
    
    // Configurações
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    let yPosition = 15;
    
    // Cores da loja
    const primaryColor = storeSettings?.primary_color || '#2563eb';
    const accentColor = storeSettings?.accent_color || '#10b981';
    
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 37, g: 99, b: 235 };
    };
    
    const primaryRgb = hexToRgb(primaryColor);
    const accentRgb = hexToRgb(accentColor);
    
    // === LINHA DECORATIVA SUPERIOR ===
    doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    
    yPosition += 5;
    
    // === INFORMAÇÕES DE CONTATO SUPERIOR ===
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    
    let contactLine = '';
    if (storeSettings?.phone) contactLine += `Tel: ${storeSettings.phone}`;
    if (storeSettings?.address) {
      if (contactLine) contactLine += ' | ';
      const shortAddress = storeSettings.address.substring(0, 40);
      contactLine += shortAddress;
    }
    
    if (contactLine) {
      doc.text(contactLine, margin, yPosition);
    }
    
    // Logo/Nome da empresa no canto direito
    const storeName = storeSettings?.store_name || 'MINHA EMPRESA';
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const nameWidth = doc.getTextWidth(storeName);
    doc.text(storeName, pageWidth - margin - nameWidth, yPosition);
    
    yPosition += 15;
    
    // === TÍTULO DO ORÇAMENTO ===
    const budgetNumber = `#${budget.id.substring(0, 5).toUpperCase()}`;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`ORÇAMENTO ${budgetNumber}`, margin, yPosition);
    
    yPosition += 10;
    
    // === DADOS DO CLIENTE (A/C:) ===
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('A/C:', margin, yPosition);
    
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    if (budget.customer_name) {
      doc.text(budget.customer_name, margin, yPosition);
      yPosition += 4;
    }
    
    if (budget.customer_phone) {
      doc.text(budget.customer_phone, margin, yPosition);
      yPosition += 4;
    }
    
    if (budget.customer_email) {
      doc.text(budget.customer_email, margin, yPosition);
      yPosition += 4;
    }
    
    if (!budget.customer_name && !budget.customer_phone && !budget.customer_email) {
      doc.text('Cliente não informado', margin, yPosition);
      yPosition += 4;
    }
    
    yPosition += 8;
    
    // === CABEÇALHO DA TABELA (estilo "pílulas" pretas) ===
    const colX = {
      service: margin,
      description: margin + 50,
      value: pageWidth - margin - 35
    };
    
    const pillHeight = 8;
    const pillRadius = 4;
    
    // Pílula SERVIÇO
    doc.setFillColor(0, 0, 0);
    doc.roundedRect(colX.service, yPosition, 45, pillHeight, pillRadius, pillRadius, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('SERVIÇO', colX.service + 22.5, yPosition + 5.5, { align: 'center' });
    
    // Pílula DESCRIÇÃO
    doc.roundedRect(colX.description, yPosition, 75, pillHeight, pillRadius, pillRadius, 'F');
    doc.text('DESCRIÇÃO', colX.description + 37.5, yPosition + 5.5, { align: 'center' });
    
    // Pílula VALOR
    doc.roundedRect(colX.value, yPosition, 35, pillHeight, pillRadius, pillRadius, 'F');
    doc.text('VALOR', colX.value + 17.5, yPosition + 5.5, { align: 'center' });
    
    yPosition += 15;
    
    doc.setTextColor(0, 0, 0);
    
    // === ITENS DO ORÇAMENTO ===
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    budgetItems.forEach((item, index) => {
      const itemStartY = yPosition;
      
      // Nome do serviço/produto (esquerda)
      const serviceName = item.product_name.length > 25 
        ? item.product_name.substring(0, 22) + '...'
        : item.product_name;
      doc.text(serviceName, colX.service, yPosition);
      
      // Descrição (centro) - formato numerado
      const descriptionText = `Quantidade: ${item.quantity}`;
      const descLines = doc.splitTextToSize(descriptionText, 70);
      doc.text(descLines, colX.description, yPosition);
      
      // Valor (direita)
      doc.setFont('helvetica', 'bold');
      doc.text(`R$ ${item.total_price.toFixed(2)}`, colX.value + 32, yPosition, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      
      yPosition += Math.max(descLines.length * 4, 8);
      
      // Linha separadora sutil
      if (index < budgetItems.length - 1) {
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.1);
        doc.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2);
        yPosition += 6;
      }
    });
    
    yPosition += 15;
    
    // === TOTAL (botão preto arredondado) ===
    const totalBoxWidth = 80;
    const totalBoxHeight = 12;
    const totalBoxX = pageWidth - margin - totalBoxWidth;
    
    doc.setFillColor(0, 0, 0);
    doc.roundedRect(totalBoxX, yPosition, totalBoxWidth, totalBoxHeight, 6, 6, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: R$ ${budget.total.toFixed(2)}`, totalBoxX + totalBoxWidth / 2, yPosition + 8, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    yPosition += 25;
    
    // === FORMA DE PAGAMENTO ===
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('FORMA DE PAGAMENTO', margin, yPosition);
    
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('À vista com 10% de desconto', margin, yPosition);
    yPosition += 4;
    doc.text('ou até 3x no cartão de crédito', margin, yPosition);
    
    yPosition += 10;
    
    // === TERMOS E CONDIÇÕES ===
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TERMOS E CONDIÇÕES', margin, yPosition);
    
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    const validDays = budget.valid_until 
      ? `Válido até ${new Date(budget.valid_until).toLocaleDateString('pt-BR')}`
      : 'Válido por 30 dias';
    doc.text(`Este orçamento é ${validDays}.`, margin, yPosition);
    
    yPosition += 4;
    doc.text('Preços e disponibilidade sujeitos a alteração sem aviso prévio.', margin, yPosition);
    
    yPosition += 4;
    if (budget.notes) {
      const notesLines = doc.splitTextToSize(budget.notes, pageWidth - 2 * margin);
      doc.text(notesLines, margin, yPosition);
    }
    
    // === RODAPÉ ===
    const footerY = pageHeight - 25;
    
    doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY, pageWidth - margin, footerY);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text('Obrigado por confiar em nós!', pageWidth / 2, footerY + 6, { align: 'center' });
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(`Emitido em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, pageWidth / 2, footerY + 11, { align: 'center' });
    
    if (storeSettings?.phone || storeSettings?.cnpj) {
      let footerInfo = '';
      if (storeSettings.phone) footerInfo += storeSettings.phone;
      if (storeSettings.cnpj) {
        if (footerInfo) footerInfo += ' | ';
        footerInfo += `CNPJ: ${storeSettings.cnpj}`;
      }
      doc.text(footerInfo, pageWidth / 2, footerY + 15, { align: 'center' });
    }
    
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