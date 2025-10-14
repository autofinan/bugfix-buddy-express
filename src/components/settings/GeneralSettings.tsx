import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Store, Save, Upload, Palette } from "lucide-react";

interface StoreSettings {
  store_name: string;
  cnpj: string;
  phone: string;
  address: string;
  logo_url: string | null;
  primary_color: string;
  accent_color: string;
  max_discount_percentage: number;
}

export function GeneralSettings() {
  const [settings, setSettings] = useState<StoreSettings>({
    store_name: "",
    cnpj: "",
    phone: "",
    address: "",
    logo_url: null,
    primary_color: "#3b82f6",
    accent_color: "#10b981",
    max_discount_percentage: 10
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from("store_settings")
        .select("*")
        .eq("owner_id", userData.user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings({
          store_name: data.store_name || "",
          cnpj: data.cnpj || "",
          phone: data.phone || "",
          address: data.address || "",
          logo_url: data.logo_url,
          primary_color: data.primary_color || "#3b82f6",
          accent_color: data.accent_color || "#10b981",
          max_discount_percentage: data.max_discount_percentage || 10
        });
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações da loja",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem válida",
        variant: "destructive"
      });
      return;
    }

    // Validar tamanho (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 2MB",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");

      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${userData.user.id}/logo-${Date.now()}.${fileExt}`;

      // Deletar logo anterior se existir
      if (settings.logo_url) {
        const oldPath = settings.logo_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('product-images')
            .remove([`${userData.user.id}/${oldPath}`]);
        }
      }

      // Upload da nova logo
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      setSettings(prev => ({ ...prev, logo_url: publicUrl }));
      
      toast({
        title: "Sucesso",
        description: "Logo carregada com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da logo",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");

      // Verificar se já existe configuração
      const { data: existing } = await supabase
        .from("store_settings")
        .select("id")
        .eq("owner_id", userData.user.id)
        .maybeSingle();

      if (existing) {
        // Atualizar
        const { error } = await supabase
          .from("store_settings")
          .update({
            store_name: settings.store_name,
            cnpj: settings.cnpj,
            phone: settings.phone,
            address: settings.address,
            logo_url: settings.logo_url,
            primary_color: settings.primary_color,
            accent_color: settings.accent_color,
            max_discount_percentage: settings.max_discount_percentage,
            updated_at: new Date().toISOString()
          })
          .eq("owner_id", userData.user.id);

        if (error) throw error;
      } else {
        // Inserir
        const { error } = await supabase
          .from("store_settings")
          .insert({
            owner_id: userData.user.id,
            store_name: settings.store_name,
            cnpj: settings.cnpj,
            phone: settings.phone,
            address: settings.address,
            logo_url: settings.logo_url,
            primary_color: settings.primary_color,
            accent_color: settings.accent_color,
            max_discount_percentage: settings.max_discount_percentage
          });

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Configurações Gerais
        </CardTitle>
        <CardDescription>
          Configure as informações da sua loja e personalize a aparência do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo da Loja */}
        <div className="space-y-3">
          <Label>Logo da Loja</Label>
          <div className="flex items-center gap-4">
            {settings.logo_url && (
              <div className="w-24 h-24 rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
                <img 
                  src={settings.logo_url} 
                  alt="Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="flex-1">
              <Input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG ou WEBP. Máximo 2MB.
              </p>
            </div>
          </div>
        </div>

        {/* Informações da Loja */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="store_name">Nome da Loja</Label>
            <Input
              id="store_name"
              value={settings.store_name}
              onChange={(e) => setSettings(prev => ({ ...prev, store_name: e.target.value }))}
              placeholder="Ex: Loja do João"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              value={settings.cnpj}
              onChange={(e) => setSettings(prev => ({ ...prev, cnpj: e.target.value }))}
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={settings.phone}
              onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_discount">Limite de Desconto (%)</Label>
            <Input
              id="max_discount"
              type="number"
              min="0"
              max="100"
              step="1"
              value={settings.max_discount_percentage}
              onChange={(e) => setSettings(prev => ({ ...prev, max_discount_percentage: parseFloat(e.target.value) }))}
            />
            <p className="text-xs text-muted-foreground">
              Desconto máximo permitido nas vendas
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Endereço Completo</Label>
          <Textarea
            id="address"
            value={settings.address}
            onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Rua, número, bairro, cidade, estado"
            rows={3}
          />
        </div>

        {/* Cores do Sistema */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="h-5 w-5" />
            <h4 className="font-medium">Personalização Visual</h4>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primary_color">Cor Principal</Label>
              <div className="flex gap-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) => setSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  value={settings.primary_color}
                  onChange={(e) => setSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accent_color">Cor Secundária</Label>
              <div className="flex gap-2">
                <Input
                  id="accent_color"
                  type="color"
                  value={settings.accent_color}
                  onChange={(e) => setSettings(prev => ({ ...prev, accent_color: e.target.value }))}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  value={settings.accent_color}
                  onChange={(e) => setSettings(prev => ({ ...prev, accent_color: e.target.value }))}
                  placeholder="#10b981"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Preview das cores */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">Preview:</p>
            <div className="flex gap-2">
              <div 
                className="w-20 h-20 rounded-lg shadow-md flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: settings.primary_color }}
              >
                Principal
              </div>
              <div 
                className="w-20 h-20 rounded-lg shadow-md flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: settings.accent_color }}
              >
                Secundária
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <h4 className="font-medium text-sm">Informações importantes:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• As informações da loja serão exibidas nos PDFs de orçamento</li>
            <li>• As cores serão aplicadas nos documentos gerados</li>
            <li>• O limite de desconto será validado no PDV</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}