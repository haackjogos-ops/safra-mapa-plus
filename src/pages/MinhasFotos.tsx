import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Header from '@/components/layout/Header';
import { Camera, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MinhasFotosProps {
  onMenuClick?: () => void;
}

const MinhasFotos = ({ onMenuClick }: MinhasFotosProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fotos, setFotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFoto, setSelectedFoto] = useState<any>(null);
  const [uploadData, setUploadData] = useState({
    file: null as File | null,
    descricao: '',
    localizacao: '',
  });

  useEffect(() => {
    if (user) {
      fetchFotos();
    }
  }, [user]);

  const fetchFotos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lavoura_fotos')
        .select('*')
        .eq('agricultor_id', user?.id)
        .order('data_envio', { ascending: false });

      if (error) throw error;
      setFotos(data || []);
    } catch (error) {
      console.error('Erro ao buscar fotos:', error);
      toast({
        title: 'Erro ao carregar fotos',
        description: 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadData({ ...uploadData, file: e.target.files[0] });
    }
  };

  const handleUpload = async () => {
    if (!uploadData.file || !user) return;

    setUploading(true);
    try {
      // Upload para Storage
      const fileName = `${user.id}/${Date.now()}-${uploadData.file.name}`;
      const { data: uploadResult, error: uploadError } = await supabase.storage
        .from('lavoura-fotos')
        .upload(fileName, uploadData.file);

      if (uploadError) throw uploadError;

      // Pegar URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('lavoura-fotos')
        .getPublicUrl(fileName);

      // Criar registro na tabela
      const { error: insertError } = await supabase
        .from('lavoura_fotos')
        .insert({
          agricultor_id: user.id,
          foto_url: publicUrl,
          descricao: uploadData.descricao,
          localizacao: uploadData.localizacao,
        });

      if (insertError) throw insertError;

      toast({
        title: 'Foto enviada com sucesso!',
        description: 'Seu agrônomo será notificado.',
      });

      setUploadData({ file: null, descricao: '', localizacao: '' });
      fetchFotos();
    } catch (error) {
      console.error('Erro ao enviar foto:', error);
      toast({
        title: 'Erro ao enviar foto',
        description: 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pendente: { label: '🟡 Pendente', className: 'bg-yellow-500 text-white' },
      analisada: { label: '🟢 Analisada', className: 'bg-green-600 text-white' },
      respondida: { label: '🔵 Respondida', className: 'bg-primary text-primary-foreground' },
    };
    return statusConfig[status] || statusConfig.pendente;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Minhas Fotos" onMenuClick={onMenuClick} />
      
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Minhas Fotos</h1>
          <Camera className="h-8 w-8 text-primary" />
        </div>

        {/* Card de Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Enviar Nova Foto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="foto">Selecionar Foto</Label>
              <Input
                id="foto"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                placeholder="Descreva o que você observou na lavoura..."
                value={uploadData.descricao}
                onChange={(e) => setUploadData({ ...uploadData, descricao: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="localizacao">Localização (opcional)</Label>
              <Input
                id="localizacao"
                placeholder="Ex: Talhão 3, Área Norte"
                value={uploadData.localizacao}
                onChange={(e) => setUploadData({ ...uploadData, localizacao: e.target.value })}
                className="mt-2"
              />
            </div>
            <Button
              onClick={handleUpload}
              disabled={!uploadData.file || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Foto'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Galeria de Fotos */}
        <Card>
          <CardHeader>
            <CardTitle>Fotos Enviadas</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : fotos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma foto enviada ainda</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fotos.map((foto) => (
                  <div
                    key={foto.id}
                    className="border border-border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors"
                    onClick={() => setSelectedFoto(foto)}
                  >
                    <img
                      src={foto.foto_url}
                      alt={foto.descricao || 'Foto da lavoura'}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-3 space-y-2">
                      <Badge className={getStatusBadge(foto.status).className}>
                        {getStatusBadge(foto.status).label}
                      </Badge>
                      <p className="text-sm text-foreground line-clamp-2">
                        {foto.descricao || 'Sem descrição'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(foto.data_envio).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Visualização */}
      <Dialog open={!!selectedFoto} onOpenChange={() => setSelectedFoto(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Foto</DialogTitle>
          </DialogHeader>
          {selectedFoto && (
            <div className="space-y-4">
              <img
                src={selectedFoto.foto_url}
                alt={selectedFoto.descricao}
                className="w-full rounded-lg"
              />
              <div className="space-y-2">
                <Badge className={getStatusBadge(selectedFoto.status).className}>
                  {getStatusBadge(selectedFoto.status).label}
                </Badge>
                <p className="text-sm text-foreground">{selectedFoto.descricao}</p>
                {selectedFoto.localizacao && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Local:</strong> {selectedFoto.localizacao}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Enviada em: {new Date(selectedFoto.data_envio).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MinhasFotos;
