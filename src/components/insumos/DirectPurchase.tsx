import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Phone, Mail, ShoppingCart } from "lucide-react";

interface Supplier {
  name: string;
  category: string;
  contact: string;
  email: string;
  website?: string;
  whatsapp?: string;
}

const DirectPurchase = () => {
  // Lista de fornecedores exemplo - pode ser integrada com a base de dados
  const suppliers: Supplier[] = [
    {
      name: "AgroInsumos Brasil",
      category: "Fertilizantes e Defensivos",
      contact: "(11) 98765-4321",
      email: "contato@agroinsumos.com.br",
      website: "https://agroinsumos.com.br",
      whatsapp: "5511987654321",
    },
    {
      name: "Sementes Premium",
      category: "Sementes",
      contact: "(19) 97654-3210",
      email: "vendas@sementespremium.com.br",
      website: "https://sementespremium.com.br",
      whatsapp: "5519976543210",
    },
    {
      name: "Fertilizantes do Campo",
      category: "Fertilizantes",
      contact: "(16) 96543-2109",
      email: "comercial@fertilizantesdocampo.com.br",
      whatsapp: "5516965432109",
    },
  ];

  const handleWhatsAppContact = (whatsapp: string, supplierName: string) => {
    const message = encodeURIComponent(
      `Olá! Gostaria de solicitar um orçamento de insumos agrícolas.`
    );
    window.open(`https://wa.me/${whatsapp}?text=${message}`, "_blank");
  };

  const handleEmailContact = (email: string, supplierName: string) => {
    const subject = encodeURIComponent("Solicitação de Orçamento - Insumos Agrícolas");
    const body = encodeURIComponent(
      `Olá,\n\nGostaria de solicitar um orçamento para compra de insumos agrícolas.\n\nAguardo retorno.`
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Compra Direta de Fornecedores
          </CardTitle>
          <CardDescription>
            Entre em contato direto com fornecedores parceiros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {suppliers.map((supplier, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{supplier.name}</CardTitle>
                  <Badge variant="outline" className="w-fit">
                    {supplier.category}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{supplier.contact}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{supplier.email}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    {supplier.whatsapp && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          handleWhatsAppContact(supplier.whatsapp!, supplier.name)
                        }
                      >
                        <svg
                          className="h-4 w-4 mr-2"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        WhatsApp
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleEmailContact(supplier.email, supplier.name)}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      E-mail
                    </Button>
                    {supplier.website && (
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(supplier.website, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visitar Site
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Marketplaces Parceiros</CardTitle>
          <CardDescription>
            Plataformas de e-commerce para compra de insumos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => window.open("https://www.agrosmart.com.br", "_blank")}
            >
              <span>AgroSmart Marketplace</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => window.open("https://www.agroloja.com.br", "_blank")}
            >
              <span>AgroLoja Brasil</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => window.open("https://www.campoonline.com.br", "_blank")}
            >
              <span>Campo Online</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DirectPurchase;
