import Papa from 'papaparse';

export interface ExportProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  cost: number | null;
  stock: number | null;
  min_stock: number | null;
  sku: string | null;
  barcode: string | null;
  category: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ExportSale {
  id: string;
  date: string;
  total: number;
  payment_method: string;
  note: string | null;
  total_profit?: number;
  profit_margin?: number;
  created_at: string;
}

export interface ExportSaleItem {
  sale_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  unit_cost: number | null;
  profit: number;
  profit_margin: number;
}

// Formatadores auxiliares
const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatPaymentMethod = (method: string): string => {
  const methods: { [key: string]: string } = {
    'pix': 'PIX',
    'cartao': 'Cartão',
    'dinheiro': 'Dinheiro',
    'pending': 'Pendente',
    'cash': 'Dinheiro',
    'debit': 'Débito',
    'credit': 'Crédito'
  };
  return methods[method] || method;
};

export const exportProductsToCSV = (products: ExportProduct[]) => {
  const csvData = products.map(product => ({
    'ID': product.id,
    'Nome do Produto': product.name,
    'Descrição': product.description || '-',
    'Preço de Venda': formatCurrency(product.price),
    'Custo': formatCurrency(product.cost || 0),
    'Margem de Lucro': product.cost ? `${(((product.price - product.cost) / product.price) * 100).toFixed(1)}%` : '-',
    'Estoque Atual': product.stock || 0,
    'Estoque Mínimo': product.min_stock || 0,
    'SKU': product.sku || '-',
    'Código de Barras': product.barcode || '-',
    'Categoria': product.category || 'Sem categoria',
    'Status': product.is_active ? 'Ativo' : 'Inativo',
    'Data de Cadastro': formatDate(product.created_at)
  }));

  const csv = Papa.unparse(csvData, {
    delimiter: ';',
    header: true,
    quotes: true,
    newline: '\r\n'
  });

  // Adicionar BOM para UTF-8 (corrige acentos no Excel)
  const csvWithBOM = '\uFEFF' + csv;
  downloadCSV(csvWithBOM, 'relatorio-produtos');
};

export const exportSalesToCSV = (sales: ExportSale[]) => {
  const csvData = sales.map(sale => ({
    'ID da Venda': sale.id,
    'Data da Venda': formatDate(sale.date),
    'Hora da Venda': new Date(sale.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    'Total da Venda': formatCurrency(sale.total),
    'Forma de Pagamento': formatPaymentMethod(sale.payment_method),
    'Lucro Obtido': formatCurrency(sale.total_profit || 0),
    'Margem de Lucro': `${(sale.profit_margin || 0).toFixed(1)}%`,
    'Observações': sale.note || '-',
    'Data de Registro': formatDateTime(sale.created_at)
  }));

  // Adicionar linha de totais
  const totalVendas = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalLucro = sales.reduce((sum, sale) => sum + (sale.total_profit || 0), 0);
  const margemMedia = sales.length > 0 
    ? sales.reduce((sum, sale) => sum + (sale.profit_margin || 0), 0) / sales.length 
    : 0;

  csvData.push({
    'ID da Venda': '',
    'Data da Venda': '',
    'Hora da Venda': '',
    'Total da Venda': '',
    'Forma de Pagamento': '',
    'Lucro Obtido': '',
    'Margem de Lucro': '',
    'Observações': '',
    'Data de Registro': ''
  });

  csvData.push({
    'ID da Venda': 'TOTAIS:',
    'Data da Venda': `${sales.length} vendas`,
    'Hora da Venda': '',
    'Total da Venda': formatCurrency(totalVendas),
    'Forma de Pagamento': '',
    'Lucro Obtido': formatCurrency(totalLucro),
    'Margem de Lucro': `${margemMedia.toFixed(1)}%`,
    'Observações': '',
    'Data de Registro': ''
  });

  const csv = Papa.unparse(csvData, {
    delimiter: ';',
    header: true,
    quotes: true,
    newline: '\r\n'
  });

  const csvWithBOM = '\uFEFF' + csv;
  downloadCSV(csvWithBOM, 'relatorio-vendas');
};

export const exportSaleItemsToCSV = (saleItems: ExportSaleItem[]) => {
  const csvData = saleItems.map(item => ({
    'ID da Venda': item.sale_id,
    'Nome do Produto': item.product_name,
    'Quantidade': item.quantity,
    'Preço Unitário': formatCurrency(item.unit_price),
    'Preço Total': formatCurrency(item.total_price),
    'Custo Unitário': formatCurrency(item.unit_cost || 0),
    'Custo Total': formatCurrency((item.unit_cost || 0) * item.quantity),
    'Lucro por Item': formatCurrency(item.profit),
    'Margem de Lucro': `${item.profit_margin.toFixed(1)}%`
  }));

  // Adicionar linha de totais
  const totalQuantidade = saleItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalVenda = saleItems.reduce((sum, item) => sum + item.total_price, 0);
  const totalCusto = saleItems.reduce((sum, item) => sum + ((item.unit_cost || 0) * item.quantity), 0);
  const totalLucro = saleItems.reduce((sum, item) => sum + item.profit, 0);
  const margemMedia = totalVenda > 0 ? ((totalLucro / totalVenda) * 100) : 0;

  csvData.push({
    'ID da Venda': '',
    'Nome do Produto': '',
    'Quantidade': 0,
    'Preço Unitário': '',
    'Preço Total': '',
    'Custo Unitário': '',
    'Custo Total': '',
    'Lucro por Item': '',
    'Margem de Lucro': ''
  });

  csvData.push({
    'ID da Venda': 'TOTAIS:',
    'Nome do Produto': `${saleItems.length} itens`,
    'Quantidade': totalQuantidade,
    'Preço Unitário': '',
    'Preço Total': formatCurrency(totalVenda),
    'Custo Unitário': '',
    'Custo Total': formatCurrency(totalCusto),
    'Lucro por Item': formatCurrency(totalLucro),
    'Margem de Lucro': `${margemMedia.toFixed(1)}%`
  });

  const csv = Papa.unparse(csvData, {
    delimiter: ';',
    header: true,
    quotes: true,
    newline: '\r\n'
  });

  const csvWithBOM = '\uFEFF' + csv;
  downloadCSV(csvWithBOM, 'relatorio-itens-vendas');
};

const downloadCSV = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
