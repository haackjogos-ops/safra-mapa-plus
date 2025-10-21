import Header from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EquipmentList } from "@/components/equipamentos/EquipmentList";
import { MaintenanceList } from "@/components/equipamentos/MaintenanceList";
import { OperatorList } from "@/components/equipamentos/OperatorList";
import { EquipmentAnalytics } from "@/components/equipamentos/EquipmentAnalytics";

const Equipamentos = () => {
  return (
    <div className="min-h-screen">
      <Header 
        title="Equipamentos e Máquinas" 
        subtitle="Controle de frotas e manutenções"
      />
      <div className="p-6">
        <Tabs defaultValue="equipamentos" className="space-y-4">
          <TabsList>
            <TabsTrigger value="equipamentos">Equipamentos</TabsTrigger>
            <TabsTrigger value="manutencoes">Manutenções</TabsTrigger>
            <TabsTrigger value="operadores">Operadores</TabsTrigger>
            <TabsTrigger value="analises">Análises</TabsTrigger>
          </TabsList>

          <TabsContent value="equipamentos">
            <EquipmentList />
          </TabsContent>

          <TabsContent value="manutencoes">
            <MaintenanceList />
          </TabsContent>

          <TabsContent value="operadores">
            <OperatorList />
          </TabsContent>

          <TabsContent value="analises">
            <EquipmentAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Equipamentos;
