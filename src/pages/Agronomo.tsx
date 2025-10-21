import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tractor, Plane, Beaker, Map as MapIcon, Calculator, FileText, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ApplicationForm from "@/components/agronomo/ApplicationForm";
import ApplicationHistory from "@/components/agronomo/ApplicationHistory";
import ApplicationReports from "@/components/agronomo/ApplicationReports";
import MapAreaSelector from "@/components/agronomo/MapAreaSelector";

interface Supply {
  id: string;
  nome: string;
  categoria: string;
  unidade_medida: string;
}

interface PlantingArea {
  id: string;
  nome: string;
  area_hectares: number;
  cultura: string;
  property_id: string;
}

const Agronomo = () => {
  const [equipmentType, setEquipmentType] = useState<"trator" | "drone">("trator");
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [plantingAreas, setPlantingAreas] = useState<PlantingArea[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const { toast } = useToast();

  // Dados do equipamento
  const [tankCapacity, setTankCapacity] = useState("");
  const [applicationWidth, setApplicationWidth] = useState("");
  const [workPressure, setWorkPressure] = useState("");
  const [nozzleCount, setNozzleCount] = useState("");

  // Dados do produto
  const [selectedProduct, setSelectedProduct] = useState("");
  const [productDosage, setProductDosage] = useState("");
  const [productType, setProductType] = useState("");

  // Dados da área
  const [selectedArea, setSelectedArea] = useState("");
  const [applicationArea, setApplicationArea] = useState("");

  // Resultados do cálculo
  const [calculationResults, setCalculationResults] = useState({
    totalSpray: 0,
    productAmount: 0,
    waterAmount: 0,
    trips: 0,
    sprayPerHectare: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedArea) {
      const area = plantingAreas.find(a => a.id === selectedArea);
      if (area) {
        setApplicationArea(area.area_hectares.toString());
      }
    }
  }, [selectedArea, plantingAreas]);

  const loadData = async () => {
    try {
      const [suppliesResult, areasResult, operatorsResult, equipmentResult] = await Promise.all([
        supabase.from("supplies").select("*").order("nome"),
        supabase.from("planting_areas").select("*").order("nome"),
        supabase.from("operadores").select("*").eq("status", "ativo").order("nome"),
        supabase.from("equipamentos").select("*").eq("status", "disponivel").order("nome")
      ]);

      if (suppliesResult.error) throw suppliesResult.error;
      if (areasResult.error) throw areasResult.error;
      if (operatorsResult.error) throw operatorsResult.error;
      if (equipmentResult.error) throw equipmentResult.error;

      setSupplies(suppliesResult.data || []);
      setPlantingAreas(areasResult.data || []);
      setOperators(operatorsResult.data || []);
      setEquipment(equipmentResult.data || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados.",
        variant: "destructive"
      });
    }
  };

  const calculateSpray = () => {
    const area = parseFloat(applicationArea);
    const dosage = parseFloat(productDosage);
    const tank = parseFloat(tankCapacity);

    if (!area || !dosage || !tank) {
      toast({
        title: "Atenção",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // Cálculo básico de calda
    // Assumindo 200-400 L/ha para trator e 10-30 L/ha para drone
    const sprayPerHa = equipmentType === "trator" ? 300 : 20;
    const totalSpray = area * sprayPerHa;
    const productAmount = area * dosage;
    const waterAmount = totalSpray - productAmount;
    const trips = Math.ceil(totalSpray / tank);

    setCalculationResults({
      totalSpray: parseFloat(totalSpray.toFixed(2)),
      productAmount: parseFloat(productAmount.toFixed(2)),
      waterAmount: parseFloat(waterAmount.toFixed(2)),
      trips,
      sprayPerHectare: sprayPerHa
    });

    toast({
      title: "Cálculo realizado",
      description: `Será necessário ${trips} ${trips === 1 ? 'abastecimento' : 'abastecimentos'} para cobrir ${area} ha.`,
    });
  };

  const resetForm = () => {
    setTankCapacity("");
    setApplicationWidth("");
    setWorkPressure("");
    setNozzleCount("");
    setSelectedProduct("");
    setProductDosage("");
    setProductType("");
    setSelectedArea("");
    setApplicationArea("");
    setCalculationResults({
      totalSpray: 0,
      productAmount: 0,
      waterAmount: 0,
      trips: 0,
      sprayPerHectare: 0
    });
  };

  return (
    <div className="min-h-screen">
      <Header 
        title="Controle do Agrônomo" 
        subtitle="Gestão e cálculo de aplicações agrícolas"
      />
      
      <div className="p-6 space-y-6">
        {/* Seleção de Equipamento */}
        <Card>
          <CardHeader>
            <CardTitle>Tipo de Equipamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={equipmentType === "trator" ? "default" : "outline"}
                onClick={() => setEquipmentType("trator")}
                className="h-24 flex flex-col gap-2"
              >
                <Tractor className="h-8 w-8" />
                <span>Pulverizador de Trator</span>
              </Button>
              <Button
                variant={equipmentType === "drone" ? "default" : "outline"}
                onClick={() => setEquipmentType("drone")}
                className="h-24 flex flex-col gap-2"
              >
                <Plane className="h-8 w-8" />
                <span>Drone Agrícola</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="produto" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="produto">Produto</TabsTrigger>
            <TabsTrigger value="equipamento">Equipamento</TabsTrigger>
            <TabsTrigger value="area">Área</TabsTrigger>
            <TabsTrigger value="calculo">Cálculo</TabsTrigger>
            <TabsTrigger value="registro">Registrar</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          {/* Aba Produto */}
          <TabsContent value="produto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Beaker className="h-5 w-5" />
                  Dados do Produto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="product">Produto*</Label>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger id="product">
                        <SelectValue placeholder="Selecione o produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {supplies.map(supply => (
                          <SelectItem key={supply.id} value={supply.id}>
                            {supply.nome} - {supply.categoria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productType">Tipo de Produto*</Label>
                    <Select value={productType} onValueChange={setProductType}>
                      <SelectTrigger id="productType">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="herbicida">Herbicida</SelectItem>
                        <SelectItem value="fungicida">Fungicida</SelectItem>
                        <SelectItem value="inseticida">Inseticida</SelectItem>
                        <SelectItem value="fertilizante">Fertilizante Foliar</SelectItem>
                        <SelectItem value="adjuvante">Adjuvante</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dosage">Dosagem (L/ha ou kg/ha)*</Label>
                    <Input
                      id="dosage"
                      type="number"
                      step="0.01"
                      placeholder="Ex: 2.5"
                      value={productDosage}
                      onChange={(e) => setProductDosage(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Equipamento */}
          <TabsContent value="equipamento">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {equipmentType === "trator" ? <Tractor className="h-5 w-5" /> : <Plane className="h-5 w-5" />}
                  Especificações do Equipamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tank">Capacidade do Tanque (Litros)*</Label>
                    <Input
                      id="tank"
                      type="number"
                      placeholder={equipmentType === "trator" ? "Ex: 2000" : "Ex: 10"}
                      value={tankCapacity}
                      onChange={(e) => setTankCapacity(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="width">Largura de Aplicação (metros)*</Label>
                    <Input
                      id="width"
                      type="number"
                      step="0.1"
                      placeholder={equipmentType === "trator" ? "Ex: 18" : "Ex: 5"}
                      value={applicationWidth}
                      onChange={(e) => setApplicationWidth(e.target.value)}
                    />
                  </div>

                  {equipmentType === "trator" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="pressure">Pressão de Trabalho (PSI)</Label>
                        <Input
                          id="pressure"
                          type="number"
                          placeholder="Ex: 40"
                          value={workPressure}
                          onChange={(e) => setWorkPressure(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="nozzles">Número de Bicos</Label>
                        <Input
                          id="nozzles"
                          type="number"
                          placeholder="Ex: 36"
                          value={nozzleCount}
                          onChange={(e) => setNozzleCount(e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Área */}
          <TabsContent value="area">
            <div className="space-y-4">
              <MapAreaSelector 
                plantingAreas={plantingAreas}
                selectedArea={selectedArea}
                onAreaSelect={setSelectedArea}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapIcon className="h-5 w-5" />
                    Detalhes da Aplicação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="area">Talhão*</Label>
                      <Select value={selectedArea} onValueChange={setSelectedArea}>
                        <SelectTrigger id="area">
                          <SelectValue placeholder="Selecione o talhão" />
                        </SelectTrigger>
                        <SelectContent>
                          {plantingAreas.map(area => (
                            <SelectItem key={area.id} value={area.id}>
                              {area.nome} - {area.cultura} ({area.area_hectares} ha)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="areaSize">Área a Aplicar (hectares)*</Label>
                      <Input
                        id="areaSize"
                        type="number"
                        step="0.01"
                        placeholder="Ex: 50.5"
                        value={applicationArea}
                        onChange={(e) => setApplicationArea(e.target.value)}
                      />
                    </div>
                  </div>

                  {selectedArea && (
                    <div className="p-4 bg-muted rounded-lg space-y-3">
                      <h4 className="font-medium">Informações do Talhão Selecionado</h4>
                      {plantingAreas.filter(a => a.id === selectedArea).map(area => (
                        <div key={area.id} className="grid gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Nome:</span>
                            <span className="font-medium">{area.nome}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Cultura:</span>
                            <span className="font-medium">{area.cultura}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Área Total:</span>
                            <span className="font-medium">{area.area_hectares} ha</span>
                          </div>
                          {parseFloat(applicationArea) > area.area_hectares && (
                            <div className="flex items-center gap-2 text-destructive mt-2 p-2 bg-destructive/10 rounded">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="text-xs">Área de aplicação maior que o talhão!</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba Cálculo */}
          <TabsContent value="calculo">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Cálculo Interativo de Calda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Resumo dos dados */}
                <div className="grid gap-4 md:grid-cols-3 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Produto</p>
                    <p className="font-medium text-sm">
                      {selectedProduct ? supplies.find(s => s.id === selectedProduct)?.nome : "Não selecionado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Área</p>
                    <p className="font-medium text-sm">
                      {applicationArea ? `${applicationArea} ha` : "Não informada"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Dosagem</p>
                    <p className="font-medium text-sm">
                      {productDosage ? `${productDosage} L/ha` : "Não informada"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={calculateSpray} className="flex-1" size="lg">
                    <Calculator className="mr-2 h-5 w-5" />
                    Calcular Calda
                  </Button>
                  <Button variant="outline" onClick={resetForm} size="lg">
                    Limpar
                  </Button>
                </div>

                {calculationResults.totalSpray > 0 && (
                  <div className="space-y-4">
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-4 text-lg">Resultados do Cálculo</h4>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="p-6 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg border-2 border-primary/20">
                          <p className="text-sm font-medium text-muted-foreground mb-2">Volume Total de Calda</p>
                          <p className="text-3xl font-bold text-primary">{calculationResults.totalSpray}</p>
                          <p className="text-sm text-muted-foreground mt-1">Litros</p>
                        </div>

                        <div className="p-6 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg border-2 border-primary/20">
                          <p className="text-sm font-medium text-muted-foreground mb-2">Quantidade de Produto</p>
                          <p className="text-3xl font-bold text-primary">{calculationResults.productAmount}</p>
                          <p className="text-sm text-muted-foreground mt-1">Litros</p>
                        </div>

                        <div className="p-6 bg-muted rounded-lg border-2 border-border">
                          <p className="text-sm font-medium text-muted-foreground mb-2">Quantidade de Água</p>
                          <p className="text-3xl font-bold">{calculationResults.waterAmount}</p>
                          <p className="text-sm text-muted-foreground mt-1">Litros</p>
                        </div>

                        <div className="p-6 bg-muted rounded-lg border-2 border-border">
                          <p className="text-sm font-medium text-muted-foreground mb-2">Taxa de Aplicação</p>
                          <p className="text-3xl font-bold">{calculationResults.sprayPerHectare}</p>
                          <p className="text-sm text-muted-foreground mt-1">L/ha</p>
                        </div>

                        <div className="p-6 bg-accent/20 rounded-lg border-2 border-accent/30">
                          <p className="text-sm font-medium text-muted-foreground mb-2">Abastecimentos</p>
                          <p className="text-3xl font-bold text-accent">{calculationResults.trips}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {calculationResults.trips === 1 ? 'vez' : 'vezes'}
                          </p>
                        </div>

                        <div className="p-6 bg-muted rounded-lg border-2 border-border">
                          <p className="text-sm font-medium text-muted-foreground mb-2">Capacidade do Tanque</p>
                          <p className="text-3xl font-bold">{tankCapacity || 0}</p>
                          <p className="text-sm text-muted-foreground mt-1">Litros</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-3">
                      <h4 className="font-semibold">Recomendações Técnicas</h4>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                          <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
                          <div>
                            <p className="font-medium text-sm">Condições Climáticas</p>
                            <p className="text-xs text-muted-foreground">
                              Temperatura ideal: 15-25°C | Umidade: 60-90% | Vento: &lt; 10 km/h
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                          <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
                          <div>
                            <p className="font-medium text-sm">Horário de Aplicação</p>
                            <p className="text-xs text-muted-foreground">
                              Manhã (6h-10h) ou tarde (16h-19h) - evite horários de sol intenso
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                          <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
                          <div>
                            <p className="font-medium text-sm">Calibração</p>
                            <p className="text-xs text-muted-foreground">
                              Verifique a calibração do equipamento antes de iniciar
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                          <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
                          <div>
                            <p className="font-medium text-sm">Segurança</p>
                            <p className="text-xs text-muted-foreground">
                              Use EPIs adequados e respeite o período de carência
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Registro */}
          <TabsContent value="registro">
            <ApplicationForm
              equipmentType={equipmentType}
              supplies={supplies}
              plantingAreas={plantingAreas}
              operators={operators}
              equipment={equipment}
              calculationResults={calculationResults}
              selectedProduct={selectedProduct}
              selectedArea={selectedArea}
              applicationArea={applicationArea}
              productDosage={productDosage}
              onSuccess={() => {
                resetForm();
                loadData();
              }}
            />
          </TabsContent>

          {/* Aba Histórico */}
          <TabsContent value="historico">
            <div className="space-y-6">
              <ApplicationHistory />
              <ApplicationReports />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Agronomo;
