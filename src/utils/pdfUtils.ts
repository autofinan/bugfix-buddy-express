import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

interface BudgetItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image_url?: string | null;
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
    console.log('🧾 Gerando orçamento:', budget.id);

    // === BUSCAR CONFIGURAÇÕES DA LOJA ===
    let storeSettings = null;
    try {
      const { data } = await supabase.rpc('get_store_settings');
      storeSettings = data;
    } catch (error) {
      console.warn('⚠️ Falha ao carregar configurações da loja');
    }

    // === BUSCAR ITENS ===
    const { data: items } = await supabase
      .from('budget_items')
      .select('id, quantity, unit_price, total_price, product_id')
      .eq('budget_id', budget.id);

    const budgetItems: BudgetItem[] = [];

    for (const item of items || []) {
      const { data: product } = await supabase
        .from('products')
        .select('name, description, image_url')
        .eq('id', item.product_id)
        .single();

      budgetItems.push({
        id: item.id,
        product_name: product?.name || 'Produto não encontrado',
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        image_url: product?.image_url || null,
      });
    }

    // === CONFIGURAÇÃO BÁSICA DO PDF ===
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    let y = 20;

    const primaryColor = storeSettings?.primary_color || '#2563eb';
    const secondaryColor = storeSettings?.accent_color || '#10b981';

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 37, g: 99, b: 235 };
    };
    const primaryRgb = hexToRgb(primaryColor);

    // === LOGO E CABEÇALHO ===
    let logoLoaded = false;
    let logoWidth = 0;
    let logoHeight = 0;

    // Tentar carregar e adicionar logo
    if (storeSettings?.logo_url) {
      try {
        const logo = await fetch(storeSettings.logo_url);
        const blob = await logo.blob();
        const reader = new FileReader();

        await new Promise((resolve) => {
          reader.onloadend = () => {
            try {
              logoWidth = 28;
              logoHeight = 28;
              doc.addImage(reader.result as string, 'PNG', margin, y, logoWidth, logoHeight);
              logoLoaded = true;
            } catch (error) {
              console.warn('⚠️ Falha ao adicionar imagem da logo.');
            }
            resolve(null);
          };
          reader.readAsDataURL(blob);
        });
      } catch {
        console.warn('⚠️ Falha ao carregar logo.');
      }
    }

    // Posição do texto baseada na presença da logo
    const textStartX = logoLoaded ? margin + logoWidth + 5 : margin;
    const headerRightX = pageWidth - margin;

    // Nome da loja
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text(
      storeSettings?.store_name || 'MINHA EMPRESA',
      textStartX,
      y + 5
    );

    // Informações de contato (telefone e CNPJ)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);

    let contactY = y + 12;

    if (storeSettings?.phone) {
      doc.text(`Telefone: ${storeSettings.phone}`, textStartX, contactY);
      contactY += 4;
    }

    if (storeSettings?.cnpj) {
      doc.text(`CNPJ: ${storeSettings.cnpj}`, textStartX, contactY);
      contactY += 4;
    }

    // Endereço em linha separada (menor)
    if (storeSettings?.address) {
      doc.setFontSize(7);
      const addressLines = doc.splitTextToSize(storeSettings.address, pageWidth - 2 * margin - 10);
      doc.text(addressLines, textStartX, contactY);
    }

    y += 32;

    // === LINHA DECORATIVA ===
    doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setLineWidth(1.2);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // === TÍTULO E DETALHES DO ORÇAMENTO ===
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const number = budget.id.substring(0, 6).toUpperCase();
    doc.text(`ORÇAMENTO #${number}`, margin, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(
      `Emitido em ${new Date(budget.created_at).toLocaleDateString('pt-BR')}`,
      margin,
      y
    );

    if (budget.valid_until) {
      doc.text(
        `Válido até ${new Date(budget.valid_until).toLocaleDateString('pt-BR')}`,
        margin + 60,
        y
      );
    }

    if (budget.status)
      doc.text(`Status: ${budget.status}`, pageWidth - margin, y, {
        align: 'right',
      });

    y += 15;

    // === TABELA DE ITENS ===
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 9, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text('ITEM', margin + 5, y + 6);
    doc.text('DESCRIÇÃO', margin + 50, y + 6);
    doc.text('VALOR', pageWidth - margin - 20, y + 6, { align: 'right' });

    y += 12;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    budgetItems.forEach((item, index) => {
      if (index % 2 === 1)
        doc.setFillColor(245, 245, 245);
      else doc.setFillColor(255, 255, 255);

      doc.rect(margin, y - 4, pageWidth - 2 * margin, 14, 'F');

      // imagem
      if (item.image_url) {
        const img = new Image();
        img.src = item.image_url;
        doc.addImage(img, 'JPEG', margin + 2, y - 2, 10, 10);
      }

      doc.setFont('helvetica', 'bold');
      doc.text(item.product_name, margin + 15, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Qtd: ${item.quantity}`, margin + 50, y);
      doc.setTextColor(0, 0, 0);
      doc.text(`R$ ${item.total_price.toFixed(2)}`, pageWidth - margin - 10, y, {
        align: 'right',
      });

      y += 12;
    });

    y += 5;

    // === RESUMO FINANCEIRO ===
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Subtotal:', pageWidth - 80, y);
    doc.text(`R$ ${budget.subtotal.toFixed(2)}`, pageWidth - margin, y, {
      align: 'right',
    });

    y += 5;
    if (budget.discount_value > 0) {
      doc.text('Desconto:', pageWidth - 80, y);
      doc.text(`- R$ ${budget.discount_value.toFixed(2)}`, pageWidth - margin, y, {
        align: 'right',
      });
      y += 5;
    }

    // total destacado
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(pageWidth - 100, y, 80, 12, 6, 6, 'F');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(`TOTAL: R$ ${budget.total.toFixed(2)}`, pageWidth - 60, y + 8, {
      align: 'center',
    });

    y += 25;

    // === TERMOS ===
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('TERMOS E CONDIÇÕES', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(
      `Válido até ${new Date(budget.valid_until || new Date()).toLocaleDateString('pt-BR')}.`,
      margin,
      y
    );

    if (budget.notes) {
      y += 5;
      const notesLines = doc.splitTextToSize(budget.notes, pageWidth - 2 * margin);
      doc.text(notesLines, margin, y);
    }

    // === RODAPÉ ===
    const footerY = pageHeight - 25;
    doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY, pageWidth - margin, footerY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text('Obrigado por confiar em nós!', pageWidth / 2, footerY + 8, {
      align: 'center',
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Emitido em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
      pageWidth / 2,
      footerY + 14,
      { align: 'center' }
    );

    // === SALVAR PDF ===
    const fileName = `Orcamento_${budget.customer_name || 'Cliente'}_${budget.id}.pdf`;
    doc.save(fileName);
    console.log('✅ PDF gerado com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao gerar PDF:', err);
  }
};
