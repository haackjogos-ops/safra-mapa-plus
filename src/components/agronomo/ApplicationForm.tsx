import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ApplicationFormProps {
  equipmentType: "trator" | "drone";
  supplies: any[];
  plantingAreas: any[];
  operators: any[];
  equipment: any[];
  calculationResults: {
    totalSpray: number;
    productAmount: number;
    waterAmount: number;
    trips: number;
    sprayPerHectare: number;
  };
  selectedProduct: string;
  selectedArea: string;
  applicationArea: string;
  productDosage: string;
  onSuccess: () => void;
}

const ApplicationForm = ({
  equipmentType,
  supplies,
  plantingAreas,
  operators,
  equipment,
  calculationResults,
  selectedProduct,
  selectedArea,
  applicationArea,
  productDosage,
  onSuccess
}: ApplicationFormProps) => {
  const { toast } = useToast();
  const [applicationDate, setApplicationDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedOperator, setSelectedOperator] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [windSpeed, setWindSpeed] = useState("");
  const [applicationCost, setApplicationCost] = useState("");
  const [observations, setObservations] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveApplication = async () => {
    if (!selectedProduct || !selectedArea || !applicationArea || !productDosage) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios antes de registrar.",
        variant: "destructive"
      });
      return;
    }

    if (calculationResults.totalSpray === 0) {
      toast({
        title: "Realize o cálculo",
        description: "Calcule a calda antes de registrar a aplicação.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("applications").insert({
        equipment_type: equipmentType,
        equipment_id: selectedEquipment || null,
        supply_id: selectedProduct,
        planting_area_id: selectedArea,
        application_date: format(applicationDate, "yyyy-MM-dd"),
        start_time: startTime || null,
        end_time: endTime || null,
        area_applied: parseFloat(applicationArea),
        product_dosage: parseFloat(productDosage),
        total_product_used: calculationResults.productAmount,
        total_spray_volume: calculationResults.totalSpray,
        weather_temperature: temperature ? parseFloat(temperature) : null,
        weather_humidity: humidity ? parseFloat(humidity) : null,
        weather_wind_speed: windSpeed ? parseFloat(windSpeed) : null,
        operator_id: selectedOperator || null,
        application_cost: applicationCost ? parseFloat(applicationCost) : 0,
        observations: observations
      });

      if (error) throw error;

      toast({
        title: "Aplicação registrada",
        description: "A aplicação foi registrada com sucesso. Estoque e financeiro foram atualizados automaticamente."
      });

      onSuccess();
    } catch (error) {
      console.error("Erro ao registrar aplicação:", error);
      toast({
        title: "Erro",
        description: "Erro ao registrar aplicação.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Aplicação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Data da Aplicação*</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {applicationDate ? format(applicationDate, "PPP") : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={applicationDate}
                  onSelect={(date) => date && setApplicationDate(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="operator">Operador</Label>
            <Select value={selectedOperator} onValueChange={setSelectedOperator}>
              <SelectTrigger id="operator">
                <SelectValue placeholder="Selecione o operador" />
              </SelectTrigger>
              <SelectContent>
                {operators.map(op => (
                  <SelectItem key={op.id} value={op.id}>
                    {op.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment">Equipamento</Label>
            <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
              <SelectTrigger id="equipment">
                <SelectValue placeholder="Selecione o equipamento" />
              </SelectTrigger>
              <SelectContent>
                {equipment.filter(e => e.tipo.toLowerCase().includes(equipmentType === 'trator' ? 'pulverizador' : 'drone')).map(eq => (
                  <SelectItem key={eq.id} value={eq.id}>
                    {eq.nome} - {eq.marca}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="applicationCost">Custo Operacional (R$)</Label>
            <Input
              id="applicationCost"
              type="number"
              step="0.01"
              placeholder="Ex: 150.00"
              value={applicationCost}
              onChange={(e) => setApplicationCost(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startTime">Horário de Início</Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">Horário de Término</Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Condições Climáticas</h4>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperatura (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                placeholder="Ex: 22.5"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="humidity">Umidade Relativa (%)</Label>
              <Input
                id="humidity"
                type="number"
                step="0.1"
                placeholder="Ex: 65"
                value={humidity}
                onChange={(e) => setHumidity(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="windSpeed">Velocidade do Vento (km/h)</Label>
              <Input
                id="windSpeed"
                type="number"
                step="0.1"
                placeholder="Ex: 8"
                value={windSpeed}
                onChange={(e) => setWindSpeed(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="observations">Observações</Label>
          <Textarea
            id="observations"
            placeholder="Observações sobre a aplicação..."
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows={3}
          />
        </div>

        <Button 
          onClick={saveApplication} 
          disabled={isSubmitting}
          className="w-full"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "Salvando..." : "Registrar Aplicação"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ApplicationForm;
