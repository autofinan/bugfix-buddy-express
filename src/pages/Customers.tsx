import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, Plus, Search, Edit2, Trash2, Eye, Phone, Mail, 
  MessageCircle, User, Calendar, ShoppingBag, Crown, UserX,
  TrendingUp, UserPlus
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  status: "active" | "inactive" | "vip";
  created_at: string;
  updated_at: string;
}

export default function Customers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [customerSales, setCustomerSales] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
    status: "active" as "active" | "inactive" | "vip",
  });

  // Estatísticas
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === "active").length;
  const vipCustomers = customers.filter(c => c.status === "vip").length;
  const inactiveCustomers = customers.filter(c => c.status === "inactive").length;

  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("owner_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCustomers((data as Customer[]) || []);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      toast.error("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCustomer = async () => {
    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    try {
      if (editingCustomer) {
        const { error } = await supabase
          .from("customers")
          .update({
            name: formData.name.trim(),
            email: formData.email.trim() || null,
            phone: formData.phone.trim() || null,
            notes: formData.notes.trim() || null,
            status: formData.status,
          })
          .eq("id", editingCustomer.id);

        if (error) throw error;
        toast.success("Cliente atualizado!");
      } else {
        const { error } = await supabase
          .from("customers")
          .insert({
            owner_id: user?.id,
            name: formData.name.trim(),
            email: formData.email.trim() || null,
            phone: formData.phone.trim() || null,
            notes: formData.notes.trim() || null,
            status: formData.status,
          });

        if (error) throw error;
        toast.success("Cliente adicionado!");
      }
      
      setDialogOpen(false);
      setEditingCustomer(null);
      resetForm();
      fetchCustomers();
    } catch (error: any) {
      toast.error("Erro ao salvar cliente: " + error.message);
    }
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    if (!confirm(`Deseja remover ${customer.name}?`)) return;
    
    try {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", customer.id);

      if (error) throw error;
      toast.success("Cliente removido!");
      fetchCustomers();
    } catch (error: any) {
      toast.error("Erro ao remover cliente: " + error.message);
    }
  };

  const openCustomerDetails = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setDrawerOpen(true);

    // Buscar histórico de compras do cliente
    const { data: sales } = await supabase
      .from("sales")
      .select("*")
      .eq("owner_id", user?.id)
      .eq("cliente_nome", customer.name)
      .eq("canceled", false)
      .order("date", { ascending: false })
      .limit(10);

    setCustomerSales(sales || []);
  };

  const openEditDialog = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        email: customer.email || "",
        phone: customer.phone || "",
        notes: customer.notes || "",
        status: customer.status,
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCustomer(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      notes: "",
      status: "active",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const openWhatsApp = (phone: string | null, name: string) => {
    if (!phone) {
      toast.error("Cliente sem telefone cadastrado");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    const message = encodeURIComponent(`Olá ${name}! Aqui é do GestorMEI.`);
    window.open(`https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${message}`, "_blank");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-success/20 text-success">Ativo</span>;
      case "inactive":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">Inativo</span>;
      case "vip":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-secondary/20 text-secondary flex items-center gap-1"><Crown className="h-3 w-3" /> VIP</span>;
      default:
        return null;
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Carregando clientes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-display">Clientes</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus clientes e acompanhe o relacionamento
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openEditDialog()} className="btn-gradient gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-0 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-display">
                {editingCustomer ? "Editar Cliente" : "Novo Cliente"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 pt-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Nome *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nome completo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-premium pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-premium pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-premium pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(v: "active" | "inactive" | "vip") => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger className="input-premium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Observações</Label>
                <Textarea
                  placeholder="Notas sobre o cliente..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-premium min-h-[80px]"
                />
              </div>
              <Button onClick={handleSaveCustomer} className="w-full btn-gradient">
                {editingCustomer ? "Atualizar Cliente" : "Adicionar Cliente"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-premium p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-primary">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Clientes</p>
              <p className="text-3xl font-bold text-foreground">{totalCustomers}</p>
            </div>
          </div>
        </Card>

        <Card className="card-premium p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-success">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clientes Ativos</p>
              <p className="text-3xl font-bold text-foreground">{activeCustomers}</p>
            </div>
          </div>
        </Card>

        <Card className="card-premium p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-secondary">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clientes VIP</p>
              <p className="text-3xl font-bold text-foreground">{vipCustomers}</p>
            </div>
          </div>
        </Card>

        <Card className="card-premium p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-muted">
              <UserX className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Inativos</p>
              <p className="text-3xl font-bold text-foreground">{inactiveCustomers}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Busca e Tabela */}
      <Card className="card-premium overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-premium pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold">Cliente</TableHead>
                <TableHead className="font-semibold">Contato</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Cadastrado em</TableHead>
                <TableHead className="font-semibold text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhum cliente cadastrado</p>
                    <p className="text-sm text-muted-foreground mt-1">Clique em "Adicionar Cliente" para começar</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-primary/5 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{customer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {customer.email && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {customer.email}
                          </p>
                        )}
                        {customer.phone && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {customer.phone}
                          </p>
                        )}
                        {!customer.email && !customer.phone && (
                          <p className="text-sm text-muted-foreground">Sem contato</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(customer.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(customer.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openCustomerDetails(customer)}
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openWhatsApp(customer.phone, customer.name)}
                          title="WhatsApp"
                          className="text-success hover:text-success"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(customer)}
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCustomer(customer)}
                          title="Excluir"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Drawer de Detalhes */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold text-lg">
                {selectedCustomer?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold">{selectedCustomer?.name}</p>
                {getStatusBadge(selectedCustomer?.status || "active")}
              </div>
            </SheetTitle>
          </SheetHeader>

          {selectedCustomer && (
            <div className="space-y-6 mt-6">
              {/* Informações de Contato */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase">Contato</h3>
                {selectedCustomer.email && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                )}
                {selectedCustomer.phone && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                )}
              </div>

              {/* Observações */}
              {selectedCustomer.notes && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase">Observações</h3>
                  <p className="text-sm p-3 bg-muted/50 rounded-lg">{selectedCustomer.notes}</p>
                </div>
              )}

              {/* Histórico de Compras */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Histórico de Compras
                </h3>
                {customerSales.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                    Nenhuma compra registrada
                  </p>
                ) : (
                  <div className="space-y-2">
                    {customerSales.map((sale) => (
                      <div key={sale.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">
                            {format(new Date(sale.date), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                          <p className="text-xs text-muted-foreground">{sale.payment_method}</p>
                        </div>
                        <span className="font-semibold text-primary">
                          {formatCurrency(sale.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => openWhatsApp(selectedCustomer.phone, selectedCustomer.name)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setDrawerOpen(false);
                    openEditDialog(selectedCustomer);
                  }}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}