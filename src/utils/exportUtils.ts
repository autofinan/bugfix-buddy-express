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

export const exportProductsToCSV = (products: ExportProduct[]) => {
  const csvData = products.map(product => ({
    'ID': product.id,
    'Nome': product.name,
    'Descrição': product.description || '',
    'Preço de Venda (R$)': product.price.toFixed(2),
    'Custo (R$)': (product.cost || 0).toFixed(2),
    'Estoque': product.stock || 0,
    'Estoque Mínimo': product.min_stock || 0,
    'SKU': product.sku || '',
    'Código de Barras': product.barcode || '',
    'Categoria': product.category || '',
    'Ativo': product.is_active ? 'Sim' : 'Não',
    'Data de Criação': new Date(product.created_at).toLocaleDateString('pt-BR')
  }));

  const csv = Papa.unparse(csvData);
  downloadCSV(csv, 'produtos');
};

export const exportSalesToCSV = (sales: ExportSale[]) => {
  const csvData = sales.map(sale => ({
    'ID': sale.id,
    'Data': new Date(sale.date).toLocaleDateString('pt-BR'),
    'Total (R$)': sale.total.toFixed(2),
    'Forma de Pagamento': sale.payment_method,
    'Observações': sale.note || '',
    'Lucro Obtido (R$)': (sale.total_profit || 0).toFixed(2),
    'Margem de Lucro (%)': (sale.profit_margin || 0).toFixed(1),
    'Data de Criação': new Date(sale.created_at).toLocaleDateString('pt-BR')
  }));

  const csv = Papa.unparse(csvData);
  downloadCSV(csv, 'vendas');
};

export const exportSaleItemsToCSV = (saleItems: ExportSaleItem[]) => {
  const csvData = saleItems.map(item => ({
    'ID da Venda': item.sale_id,
    'Produto': item.product_name,
    'Quantidade': item.quantity,
    'Preço Unitário (R$)': item.unit_price.toFixed(2),
    'Total (R$)': item.total_price.toFixed(2),
    'Custo Unitário (R$)': (item.unit_cost || 0).toFixed(2),
    'Lucro (R$)': item.profit.toFixed(2),
    'Margem de Lucro (%)': item.profit_margin.toFixed(1)
  }));

  const csv = Papa.unparse(csvData);
  downloadCSV(csv, 'itens-vendas');
};

const downloadCSV = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};